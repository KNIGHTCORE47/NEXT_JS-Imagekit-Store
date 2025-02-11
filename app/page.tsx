'use client'

import apiClient from "@/lib/api-client";
import { IProducts } from "@/models/products.models";
import { useEffect, useState } from "react";
import ImageGallery from "./components/ImageGallery";

export default function Home() {
  const [products, setProducts] = useState<IProducts[]>([]);

  useEffect(() => {
    // NOTE - Fetch all the products from the database
    const fetchProducts = async function () {
      try {

        // NOTE - fetch products from the api endpoint
        const data = await apiClient.getProducts();

        // NOTE - set the products to the state
        setProducts(data);


      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }

    fetchProducts();
  }, [])

  return (
    <main
      className="container mx-auto px-4 py-8"
    >
      <h1
        className="text-3xl font-bold mb-8"
      >
        Imagekit Shop
      </h1>
      <ImageGallery products={products} />
    </main>
  )
}

