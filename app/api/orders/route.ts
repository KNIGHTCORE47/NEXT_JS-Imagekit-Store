import { authOptions } from '@/lib/auth.lib';
import { connectToDatabase } from '@/lib/dataBase.lib';
import Order from '@/models/oreder.models';
import Product from '@/models/products.models';
import { getServerSession } from 'next-auth';
import { NextResponse, NextRequest } from 'next/server'
import Razorpay from 'razorpay'


// NOTE - Create Razorpay Key ID and Secret Key
const rezorpay = new Razorpay({
    key_id: String(process.env.RAZORPAY_KEY_ID!),
    key_secret: String(process.env.RAZORPAY_KEY_SECRET!)
})


export async function POST(request: NextRequest) {
    // NOTE - Connect to Database
    await connectToDatabase();

    try {
        // NOTE - Check for Authenticated User
        const session = await getServerSession(authOptions);

        // NOTE - Check if session exists
        if (!session) {
            return NextResponse.json({
                success: false,
                message: 'You are not authorized to access this route'
            }, { status: 401 })
        }

        // NOTE - Get the product ID and variant from the request
        const {
            productId,
            variant
        } = await request.json();

        // NOTE - Check for invalid data
        if (!productId || !variant) {
            return NextResponse.json({
                success: false,
                message: 'Invalid product ID or variant'
            }, { status: 400 })
        }

        // NOTE - Fetch the product from the database
        const product = await Product.findById(productId);

        // NOTE - Check if product exists
        if (!product) {
            return NextResponse.json({
                success: false,
                message: 'Product not found'
            }, { status: 404 })
        }

        // NOTE - Check if variant exists
        if (!product.variants.includes(variant)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid variant found'
            }, { status: 404 })
        }

        // NOTE - Need a record [instance] of the order in the database
        const newOrder = new Order({
            userId: session.user.id,
            productId,
            variant,
            razorpayOrderId: '',
            amount: variant.price,
            status: 'pending'
        })

        // NOTE - Create Razorpay Option
        const options = {
            amount: Math.round(newOrder.amount * 100),
            currency: 'INR',
            receipt: `order_${Date.now()}_${newOrder.userId}`,
            payment_capture: 1,
            notes: {
                product: newOrder.productId.toString(),
            }
        }

        // NOTE - Create Razorpay Order
        const razorpayOrder = await rezorpay.orders.create(options)

        // NOTE - Update the order in the database
        newOrder.razorpayOrderId = razorpayOrder.id;

        // NOTE - Save the order in the database
        await newOrder.save();


        // NOTE - Return the order
        return NextResponse.json({
            success: true,
            message: 'Order created successfully',
            data: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                dbOrderId: newOrder._id,
            }
        }, { status: 200 })



    } catch (error: any) {
        console.error('Error creating order:', error);
        return NextResponse.json({
            success: false,
            message: 'Something went wrong, error creating order'
        }, { status: 500 })
    }
}