'use client'

import { useState } from 'react'
import { useNotification } from '../components/Notification'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function LoginPage() {

    const { showNotification } = useNotification();
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const response = await signIn('credentials', {
            redirect: false,
            email,
            password
        })

        // NOTE - Check for error
        if (!response?.ok) {
            showNotification(response?.error || 'Something went wrong, login failed', 'error');
        } else {
            showNotification('Login successful', 'success');
            router.push('/');
        }
    }


    return (
        <div
            className='max-w-md mx-auto'

        >
            <h1
                className='text-2xl font-bold mb-4'

            >
                Login
            </h1>

            <form
                onSubmit={handleSubmit}
                className='space-y-4'
            >

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium mb-1"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
                >
                    Login
                </button>

                <p
                    className='text-sm text-center mt-4'
                >
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/login"
                        className="text-blue-500 hover:underline hover:text-blue-600"
                    >
                        Register
                    </Link>
                </p>
            </form>
        </div>
    )
}