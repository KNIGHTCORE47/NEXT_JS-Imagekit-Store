import { connectToDatabase } from '@/lib/dataBase.lib';
import Product from '@/models/products.models';
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    await connectToDatabase()
    try {
        // NOTE - Fetch product Id from params
        const { id } = await props.params

        // NOTE - Check for invalid product Id
        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'Invalid product Id'
            }, { status: 400 })
        }

        // NOTE - Fetch product from the database
        const product = await Product.findById(id).lean()

        // NOTE - Check if product exists
        if (!product) {
            return NextResponse.json({
                success: false,
                message: 'Product not found'
            }, { status: 404 })
        }

        // NOTE - Return the product
        return NextResponse.json({
            success: true,
            message: 'Product fetched successfully',
            data: product
        }, { status: 200 })


    } catch (error) {
        console.error('Error fetching products:', error);

        return NextResponse.json({
            success: false,
            message: 'Error fetching products'
        }, { status: 500 })
    }
}