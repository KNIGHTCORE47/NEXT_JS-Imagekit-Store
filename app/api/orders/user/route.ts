import { authOptions } from '@/lib/auth.lib';
import { connectToDatabase } from '@/lib/dataBase.lib';
import Order from '@/models/oreder.models';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server'

export async function GET() {
    // NOTE - Connect to Database
    await connectToDatabase()

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

        // NOTE - Fetch orders from the database and populate on the base of productId
        const orders = await Order.find({ userId: session.user.id })
            .populate({
                path: 'productId',
                select: 'name imageUrl',
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 })
            .lean();

        // NOTE - Check if orders exist
        if (!orders || orders.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No orders found'
            }, { status: 404 })
        }

        // NOTE - Valid orders
        const validOrders = orders.map(order => {
            return {
                ...order,
                productId: order.productId || {
                    imageUrl: null,
                    name: "Product no longer available",
                }
            }
        })


        // NOTE - Return the orders
        return NextResponse.json({
            success: true,
            message: 'Orders fetched successfully',
            data: validOrders
        }, { status: 200 })


    } catch (error) {
        console.error('Error fetching orders.', error);
        return NextResponse.json({
            success: false,
            message: 'Error fetching orders'
        }, { status: 500 })
    }
}