import { NextResponse, NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/dataBase.lib'
import Product, { IProducts } from '@/models/products.models'
import { authOptions } from '@/lib/auth.lib';
import { getServerSession } from 'next-auth';


export async function GET() {
    // NOTE - Connect to Database
    await connectToDatabase()

    try {
        // NOTE - Fetch all products from the database
        const products = await Product.find({}).lean();

        // NOTE - Check if products exist
        if (!products || products.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No products found'
            }, { status: 404 })
        }

        // NOTE - Return the products
        return NextResponse.json({
            success: true,
            message: 'Products fetched successfully',
            data: products
        }, { status: 200 })

    } catch (error: any) {
        console.error('Error fetching products:', error);

        return NextResponse.json({
            success: false,
            message: 'Error fetching products'
        }, { status: 500 })
    }
}



export async function POST(request: NextRequest) {
    // NOTE - Connect to Database
    await connectToDatabase();

    try {
        // NOTE - Check for authenticated user [Admin]
        const session = await getServerSession(authOptions);

        if (!session || session?.user?.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'You are not authorized to access this route'
            }, { status: 401 })
        }

        // NOTE - Get the data from the request
        const { name, description, imageUrl, variants }: IProducts = await request.json();

        // NOTE - Check for invalid data
        if (
            !name || !description || !imageUrl || variants?.length === 0
        ) {
            return NextResponse.json({
                success: false,
                message: 'All fields are required'
            }, { status: 400 })
        }

        // NOTE - Create a new product
        const product = await Product.create({
            name,
            description,
            imageUrl,
            variants
        });

        // NOTE - Return the product
        return NextResponse.json({
            success: true,
            message: 'Product created successfully',
            data: product
        }, { status: 201 })


    } catch (error) {
        console.error('Error creating product:', error);

        return NextResponse.json({
            success: false,
            message: 'Error creating product'
        }, { status: 500 })
    }
}