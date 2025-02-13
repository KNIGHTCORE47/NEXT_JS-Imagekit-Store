'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useNotification } from '@/app/components/Notification';
import apiClient from '@/lib/api-client';
import { IKImage } from 'imagekitio-next';
import {
    IProducts,
    IImageVariant,
    IMAGE_VARIANTS,
    ImageVariantType
} from '@/models/products.models'
import { Loader2, AlertCircle, ImageIcon, Check } from 'lucide-react';


export default function ProductPage() {

    const { data: session } = useSession();
    const router = useRouter();
    const { showNotification } = useNotification();
    const params = useParams();

    const [product, setProduct] = useState<IProducts | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectVariant, setSelectVariant] = useState<IImageVariant | null>(null);

    useEffect(() => {
        async function fetchProduct() {
            const id = params?.id;

            // NOTE - Check for invalid product Id
            if (!id) {
                setError('Invalid product Id');
                setLoading(false);
                return router.push('/404');
            }

            // NOTE - Fetch product from the database
            try {
                const data = await apiClient.getProduct(id.toString());

                // NOTE - Check if product exists
                if (!data) {
                    setError('Product not found');
                    showNotification('Product not found', 'error');
                    setLoading(false);
                    return router.push('/404');
                }

                setProduct(data);
                showNotification('Product fetched successfully', 'success');

            } catch (error) {
                console.error('Error fetching product:', error);
                setError(error instanceof Error ? error.message : 'Error fetching product');
                showNotification(error instanceof Error ? error.message : 'Error fetching product', 'error');
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [params?.id]);

    async function handlePurchase(variant: IImageVariant) {
        // NOTE - Check for authenticated user
        if (!session) {
            showNotification('You must be logged in to purchase a product', 'error');
            router.push('/login');
            return;
        }

        // NOTE - Check for product id
        if (!product?._id) {
            showNotification('Invalid product id', 'error');
            return;
        }

        // NOTE - Check for selected variant
        if (!variant) {
            showNotification('Please select a variant', 'error');
            return;
        }

        // NOTE - Create order
        try {
            const { orderId, amount } = await apiClient.createOrder({
                productId: product._id,
                variant
            })

            // NOTE - Check for Razorpay Key ID
            if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
                showNotification('Razorpay Key ID not found', 'error');
                return;
            }

            // NOTE - Ammount options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount,
                currency: 'USD',
                name: 'Imagekit Store',
                order_id: orderId,
                handler: function () {
                    showNotification('Payment successful', 'success');
                    router.push(`/orders/${orderId}`);
                },
                prefill: {
                    email: session.user?.email,
                }
            };

            // NOTE - Open Razorpay checkout
            const RazorpayPayment = new (window as any).Razorpay(options);
            RazorpayPayment.open();

        } catch (error) {
            console.error('Error creating order:', error);
            showNotification(error instanceof Error ? error.message : 'Error creating order', 'error');
        }
    }

    // NOTE - Get Transformation
    function getTransformation(variantType: ImageVariantType) {
        const variant = IMAGE_VARIANTS[variantType];

        return [
            {
                width: variant.dimentions.width.toString(),
                height: variant.dimentions.height.toString(),
                cropMode: 'extract',
                focus: 'center',
                quality: '60'
            }
        ]
    }

    if (loading) {
        return (
            <div className="min-h-[70dvh] flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div
                className="alert alert-error max-w-md mx-auto my-8"
            >
                <AlertCircle className="w-6 h-6" />
                <span>
                    {error || 'Error fetching product'}
                </span>
            </div>
        )
    }


    return (
        <div
            className='container mx-auto px-4 py-8'
        >
            <div
                className='grid grid-cols-1  lg:grid-cols-3 gap-8'
            >
                {/*NOTE - Image Section*/}
                <div
                    className='space-y-4'
                >
                    <div
                        className='relative rounded-lg overflow-hidden'
                        style={{
                            aspectRatio: selectVariant ? `${IMAGE_VARIANTS[selectVariant.type].dimentions.width} / ${IMAGE_VARIANTS[selectVariant.type].dimentions.height}` : "1/1"
                        }}
                    >
                        <IKImage
                            urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT!}
                            path={product.imageUrl}
                            alt={product.name}
                            transformation={selectVariant ? getTransformation(selectVariant.type) : getTransformation('SQUARE')}
                            loading='eager'
                            className='w-full h-full object-cover'
                        />
                    </div>

                    {/* Image Dimensions Info */}
                    {
                        selectVariant && (
                            <div
                                className='text-sm text-base-content/70 text-center'
                            >
                                Preview: {
                                    IMAGE_VARIANTS[selectVariant.type].dimentions.width
                                } x{" "}
                                {
                                    IMAGE_VARIANTS[selectVariant.type].dimentions.height
                                }
                            </div>
                        )
                    }
                </div>


                {/*NOTE - Product Details Section*/}
                <div
                    className='space-y-6'
                >
                    <div>
                        <h1
                            className='text-xl font-semibold mb-2'
                        >
                            {product.name}
                        </h1>
                        <p
                            className='text-base-content/80 text-lg'
                        >
                            {product.description}
                        </p>
                    </div>

                    {/*NOTE - Variant Selection*/}
                    <div
                        className='space-x-4'
                    >
                        <h2
                            className='text-xl font-semibold'
                        >
                            Available Variants
                        </h2>

                        {product.variants?.map((variant) => (
                            <div
                                key={variant.type}
                                onClick={() => setSelectVariant(variant)}
                                className={`card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors ${selectVariant?.type === variant.type ? "ring-2 ring-primary" : ""
                                    }`}
                            >
                                <div
                                    className='card-body p-4'
                                >
                                    <div
                                        className='flex items-center justify-between'
                                    >
                                        <div
                                            className='flex items-center gap-3'
                                        >
                                            <ImageIcon className='w-5 h-5' />
                                            <div>
                                                <h3 className='font-semibold'>
                                                    {
                                                        IMAGE_VARIANTS[
                                                            variant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
                                                        ].label
                                                    }
                                                </h3>
                                                <p
                                                    className='text-sm text-base-content/70'
                                                >
                                                    {
                                                        IMAGE_VARIANTS[
                                                            variant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
                                                        ].dimentions.width
                                                    }{" "}
                                                    x{" "}
                                                    {
                                                        IMAGE_VARIANTS[
                                                            variant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
                                                        ].dimentions.height
                                                    }
                                                    px • {variant.license} license
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="text-xl font-bold">
                                                ${variant.price.toFixed(2)}
                                            </span>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePurchase(variant);
                                                }}
                                            >
                                                Buy Now
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* License Information */}
                    <div
                        className="card bg-base-200"
                    >
                        <div
                            className="card-body p-4"
                        >
                            <h3
                                className="font-semibold mb-2"
                            >
                                License Information
                            </h3>
                            <ul className="space-y-2">
                                <li
                                    className="flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4 text-success" />
                                    <span>Personal: Use in personal projects</span>
                                </li>

                                <li
                                    className="flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4 text-success" />
                                    <span>Commercial: Use in commercial projects</span>
                                </li>
                            </ul>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}

