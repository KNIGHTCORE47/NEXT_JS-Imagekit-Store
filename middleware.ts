import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'


export default withAuth(

    function middleware() {
        // NOTE - Allow the request
        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // NOTE - Get user path-name
                const { pathname } = req.nextUrl

                // NOTE - Check for API routes 

                // NOTE - Check for [Webhook routes]
                if (pathname.startsWith('/api/webhook')) {
                    return true
                }


                // NOTE - Check for [Authentication routes]
                if (
                    pathname.startsWith('/api/auth') ||
                    pathname === '/login' ||
                    pathname === '/register'
                ) {
                    return true
                }

                // NOTE - Check for [Public routes]
                if (
                    pathname === '/' ||
                    pathname.startsWith('/api/products') ||
                    pathname.startsWith('/products')
                ) {
                    return true
                }

                // NOTE - Check for [Admin routes]
                if (pathname.startsWith('/admin')) {
                    return token?.role === 'admin'
                }


                // NOTE - Check for Authenticated [Other routes]
                return !!token
            }
        },
    }
)

export const config = {
    matcher: [
        /*
            * Match all request paths except for the ones starting with:
            * - _next/static (static files)
            * - _next/image (image optimization files)
            * - favicon.ico (favicon file)
            * - /public (public folder)
        */
        "/((?!_next/static|_next/image|favicon.ico|public/).*)",
    ]
}