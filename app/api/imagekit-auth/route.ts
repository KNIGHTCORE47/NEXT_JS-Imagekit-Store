import ImageKit from "imagekit"
import { NextResponse } from "next/server";

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
    privateKey: process.env.PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

export async function GET() {
    try {
        // NOTE - 
        const authenticationParameters = imagekit.getAuthenticationParameters();

        return NextResponse.json({
            success: true,
            message: "Authentication parameters fetched successfully",
            data: authenticationParameters
        }, { status: 200 })

    } catch (error) {
        console.error("Error in imagekit-auth", error);
        return NextResponse.json({
            success: false,
            message: "Error uploading image, please try again later"
        }, { status: 500 })
    }
}