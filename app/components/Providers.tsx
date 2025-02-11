'use client'

import React from "react";
import { ImageKitProvider } from "imagekitio-next";
import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from './Notification'

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY!;


export default function Providers(
    { children }: { children: React.ReactNode }
) {
    const authenticator = async function () {
        try {
            // NOTE - Get Respone from the API_Endpoint
            const response = await fetch('/api/imagekit-auth');

            // NOTE - Check if Response is not Ok
            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            // NOTE - Return Response
            return response.json();


        } catch (error: any) {
            console.error('Error authenticating:', error);
            throw new Error('Failed to authenticate');
        }
    };


    // NOTE - Return Provider
    return (
        < SessionProvider refetchInterval={5 * 60}>
            <NotificationProvider>
                <ImageKitProvider
                    urlEndpoint={urlEndpoint}
                    publicKey={publicKey}
                    authenticator={authenticator}
                >
                    {children}
                </ImageKitProvider>
            </NotificationProvider>
        </SessionProvider>
    );
}