"use client"
import { IKUpload } from 'imagekitio-next'
import { IKUploadResponse } from 'imagekitio-next/dist/types/components/IKUpload/props'
import { useState } from 'react'

// NOTE - Interface




export default function FileUpload(
    { onSuccess }: { onSuccess: (response: IKUploadResponse) => void }
) {

    const [upload, setUpload] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const onError = function (err: { message: string }) {
        setError(err.message);
        setUpload(false);
    }


    const handleSuccess = function (response: IKUploadResponse) {
        setUpload(false);
        setError(null);

        // NOTE - Call the onSuccess callback
        onSuccess(response);
    }

    const handleStartUpload = function () {
        setUpload(true);
        setError(null);
    }


    return (
        <div className='space-y-2'>
            <IKUpload
                fileName='product-image.png'
                onError={onError}
                onSuccess={handleSuccess}
                onUploadStart={handleStartUpload}
                validateFile={(file: File) => {
                    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];

                    // NOTE - Check if the file type is valid
                    if (!validTypes.includes(file.type)) {
                        setError('Invalid file type. Only PNG, JPEG, and WEBP files are allowed.');
                    }

                    // NOTE - Check for file size
                    if (file.size > 5 * 1024 * 1024) {
                        // NOTE - Limit [5MB]
                        setError('File size exceeds the limit of 5MB.');
                    }

                    return true
                }}
            />

            // NOTE - Loader
            {
                upload && (
                    <p
                        className='text-sm text-gray-500'
                    >
                        Uploading...
                    </p>
                )
            }

            // NOTE - Error message
            {
                error && (
                    <p
                        className='text-sm text-red-500'
                    >
                        {error}
                    </p>
                )
            }
        </div>
    )
}