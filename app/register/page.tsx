'use client'

import { useState } from 'react'
import { useNotification } from '../components/Notification'
import Link from 'next/link'
import { useRouter } from 'next/navigation'


export default function RegisterPage() {
    const { showNotification } = useNotification();
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // NOTE - Check for password and confirm password
        if (password !== confirmPassword) {
            showNotification('Password and Confirm Password do not match', 'error');
            return;
        }

        try {
            const response = await fetch('api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json();

            // NOTE - Check for error
            if (!data.ok) {
                showNotification(data.message || "Something went wrong, Registration failed", 'error');
            }

            // NOTE - Proceed to login page
            router.push('/login');
        } catch (error) {
            console.error("Error in Registration", error);
            showNotification(error instanceof Error ? error.message : 'Something went wrong, Registration failed', 'error');
        }
    }


    return (
        <div
            className='max-w-md mx-auto'
        >
            <h1
                className='text-2xl font-bold mb-4'
            >
                Register
            </h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
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

                <div>
                    <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium mb-1"
                    >
                        Confirm Password
                    </label>
                    <input
                        type="confirmPassword"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
                >
                    Register
                </button>

                <p
                    className='text-sm text-center mt-4'
                >
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="text-blue-500 hover:underline hover:text-blue-600"
                    >
                        Login
                    </Link>
                </p>
            </form>
        </div>
    )
}

