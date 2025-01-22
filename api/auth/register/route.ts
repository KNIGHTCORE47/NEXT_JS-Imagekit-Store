import { connectToDatabase } from '@/lib/dataBase.lib'
import UserModel from '@/models/user.models'
import { NextRequest, NextResponse } from 'next/server'


export async function POST(request: NextRequest) {
    // NOTE - Connect to Database
    await connectToDatabase()

    // NOTE - Get the data from the request
    try {
        // NOTE - Get the data from the request
        const { email, password } = await request.json();

        // NOTE - Check for invalid data
        if (
            [email, password].some(items => items?.trim() === "")
        ) {
            return NextResponse.json({
                success: false,
                message: "Invalid Email or Password"
            }, { status: 400 })
        }

        // NOTE - Check for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                message: "Invalid Email type"
            }, { status: 400 })
        }

        // NOTE - Check for password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (password.length < 8) {
            return NextResponse.json({
                success: false,
                message: "Password must be at least 8 characters long"
            }, { status: 400 })
        } else if (!passwordRegex.test(password)) {
            return NextResponse.json({
                success: false,
                message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            }, { status: 400 })
        }

        // NOTE - Check if user already exists
        const user = await UserModel.findOne({ email });

        if (user) {
            return NextResponse.json({
                success: false,
                message: "User already exists"
            }, { status: 409 })
        }

        // NOTE - Create new user
        const newUser = await UserModel.create({
            email,
            password,
            role: 'user'
        });

        return NextResponse.json({
            success: true,
            message: "User registered successfully",
            data: newUser
        }, { status: 201 })


    } catch (error: any) {
        console.error("Error in registering user", error);

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 })
    }
}