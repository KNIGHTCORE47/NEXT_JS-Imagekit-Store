import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto'
import { connectToDatabase } from "@/lib/dataBase.lib";
import Order from "@/models/oreder.models";
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
    // NOTE - Connect to Database
    await connectToDatabase();

    try {
        // Dev Bakend API
        // NOTE - Get body from the request text
        const body = await request.text();

        const signature = request.headers.get('x-razorpay-signature');

        // NOTE - Check for valid signature
        if (!signature) {
            return NextResponse.json({
                success: false,
                message: 'Invalid signature'
            }, { status: 400 })
        }

        // NOTE - Define expected signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest('hex');


        // NOTE - Check for valid signature
        if (signature !== expectedSignature) {
            return NextResponse.json({
                success: false,
                message: 'Payment verification failed!'
            }, { status: 400 })
        }


        // Razorpay Webhook
        // NOTE - Parse the body
        const event = JSON.parse(body);

        // NOTE - Check for valid event
        if (event.event !== 'payment.captured') {
            return NextResponse.json({
                success: false,
                message: 'Invalid event'
            }, { status: 400 })
        }

        if (event.event === 'payment.captured') {
            // NOTE - Get the payment
            const payment = event.payload.payment.entity

            // NOTE - Check for valid payment
            if (!payment) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid payment'
                }, { status: 400 })
            }

            // NOTE - Update the order and populate with user and product details
            const order = await Order.findOneAndUpdate(
                { razorpayOrderId: payment.order_id },
                {
                    razorpayPaymentId: payment.id, status: 'completed'
                },
            ).populate([
                { path: 'productId', select: 'name' },
                { path: 'userId', select: 'email' }
            ]);

            // NOTE - Check if order exists
            if (!order) {
                return NextResponse.json({
                    success: false,
                    message: 'Order not found'
                }, { status: 400 })
            }

            if (order) {
                // NOTE - Send email only after payment is confirmed
                const transporter = nodemailer.createTransport({
                    host: String(process.env.MAILTRAP_HOST!),
                    port: Number(process.env.MAILTRAP_PORT!),
                    auth: {
                        user: String(process.env.MAILTRAP_USER),
                        pass: String(process.env.MAILTRAP_PASS),
                    },
                })

                // NOTE - Send email to user
                const mailOptions = {
                    from: String(process.env.MAILTRAP_USER),
                    to: order?.userId?.email,
                    subject: 'Payment Confirmation - Imagekit Store',
                    text: `
        Thank you for your purchase!.

        Order Details:
        - Order ID: ${order._id.toString().slice(-6)}
        - Product: ${order.productId.name}
        - Version: ${order.variant.type}
        - License: ${order.variant.license}
        - Price: ${order.amount.toFixed(2)}

        Your image is now available in your order page.
        Thank you for choosing Imagekit Store!
    `.trim(),
                }

                // NOTE - Send email
                await transporter.sendMail(mailOptions);
            }
        }

        // NOTE - Return success response
        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully!',
            received: true
        }, { status: 200 })




    } catch (error) {
        console.error("Error in razorpay-webhook", error);
        return NextResponse.json({
            success: false,
            message: 'Error in razorpay-webhook, please try again later'
        }, { status: 500 })
    }
}