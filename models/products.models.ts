import mongoose, { Schema, model, models } from 'mongoose';

export const IMAGE_VARIANTS = {
    SQUARE: {
        type: 'SQUARE',
        dimentions: {
            width: 1200,
            height: 1200
        },
        label: 'Square (1:1)',
        aspectRatio: "1:1"
    },
    WIDE: {
        type: 'WIDE',
        dimentions: {
            width: 1920,
            height: 1080
        },
        label: 'Square (16:9)',
        aspectRatio: "16:9"
    },
    PORTRAIT: {
        type: 'PORTRAIT',
        dimentions: {
            width: 1080,
            height: 1920
        },
        label: 'Square (9:16)',
        aspectRatio: "9:16"
    },
} as const;

export type ImageVariantType = keyof typeof IMAGE_VARIANTS

export interface IImageVariant {
    type: ImageVariantType;
    price: number;
    license: 'personal' | 'commercial';
}


export interface IProducts {
    _id?: mongoose.Types.ObjectId
    name: string;
    description: string;
    imageUrl: string;
    variants?: IImageVariant[];
    createdAt?: Date;
    updatedAt?: Date
}


const imageVariantSchema = new Schema<IImageVariant>({
    type: {
        type: String,
        required: true,
        enum: ['SQUARE', 'WIDE', 'PORTRAIT']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    license: {
        type: String,
        required: true,
        enum: ['personal', 'commercial']
    }

})




const productSchema = new Schema<IProducts>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    variants: [imageVariantSchema],

}, { timestamps: true })


const Product = models?.Product || model<IProducts>('Product', productSchema);

export default Product