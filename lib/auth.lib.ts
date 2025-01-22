import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from './dataBase.lib'
import UserModel from '@/models/user.models'


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'email'
                },
                password: {
                    label: 'Password',
                    type: 'password',
                    placeholder: 'password'
                }
            },
            async authorize(credentials) {

                // NOTE - Check if credentials are valid
                if (
                    !credentials?.email && !credentials?.password
                ) {
                    throw new Error('Invalid credentials')
                }

                //
                try {
                    await connectToDatabase()

                    // NOTE - Find user from the database using email
                    const user = await UserModel.findOne({ email: credentials?.email })

                    // NOTE - Check if user exists
                    if (!user) {
                        throw new Error('User not found')
                    }

                    // NOTE - Check if password is correct
                    const isPasswordCorrect = await user.comparePassword(credentials?.password, user.password)

                    if (!isPasswordCorrect) {
                        throw new Error('Incorrect password')
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        role: user.role
                    }
                } catch (error) {
                    console.error("Invalid credentials - (AUTH_Error)", error)
                    throw error
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            // NOTE - Check if user exists
            if (user) {
                token.id = user.id?.toString()
                token.role = user.role
            }

            return token
        },
        async session({ session, token }) {
            // NOTE - Check if session exists
            if (token) {
                session.user.id = token.id?.toString() as string
                session.user.role = token.role as string
            }

            return session
        }
    },
    pages: {
        signIn: '/login',
        error: '/login'
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60   // Output - 30 days
    },
    secret: String(process.env.NEXTAUTH_SECRET)
}