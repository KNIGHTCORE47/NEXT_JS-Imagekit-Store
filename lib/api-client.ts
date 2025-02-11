import { IOrder } from "@/models/oreder.models";
import { IImageVariant, IProducts } from "@/models/products.models";
import mongoose from "mongoose";

// NOTE - Creation of Interface for Product Data
export type ProductFormData = Omit<IProducts, '_id'>

type FetchOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
};

// NOTE - Creation of Interface for Order Data
export interface createOrderData {
    productId: mongoose.Types.ObjectId | string;
    variant: IImageVariant;
}


// NOTE - Class creation for API Client
class APIClient {

    //
    private async fetch<T>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<T> {
        const {
            method = 'GET',
            body,
            headers = {}
        } = options;


        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };


        const response = await fetch(endpoint, {
            method,
            body: JSON.stringify(body),
            headers: defaultHeaders
        })


        if (!response.ok) {
            throw new Error(response.statusText);
        }


        return response.json();
    }

    // NOTE - Get All Products
    async getProducts() {
        return this.fetch<IProducts[]>('/api/products');
    }

    // NOTE - Get Single Product
    async getProduct(id: string) {
        return this.fetch<IProducts>(`/api/products/${id}`);
    }


    // NOTE - Create Product
    async createProduct(productData: ProductFormData) {
        return this.fetch<IProducts>('/api/products', {
            method: 'POST',
            body: productData

        })
    }

    // NOTE - Get user orders
    async getUserOrders() {
        return this.fetch<IOrder[]>('/api/orders/user');
    }

    // NOTE - Create Order
    async createOrder(orderData: createOrderData) {
        const sanitizeOrderData = {
            ...orderData,
            productId: orderData.productId.toString()
        }


        return this.fetch<{
            orderId: string,
            amount: number
        }>('/api/orders', {
            method: 'POST',
            body: sanitizeOrderData
        })
    }
}

const apiClient = new APIClient();

export default apiClient;