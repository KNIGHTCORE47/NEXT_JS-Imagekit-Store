import mongoose, { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';


export interface IUser {
    email: string;
    password: string;
    role: 'user' | 'admin';
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}



const userSchema = new Schema<IUser>({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
}, { timestamps: true });



// NOTE - Hashing the password
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
})






// NOTE - Here we have export the User model in the base of previously created or if not then create a new one 
const User = models?.User || model<IUser>('User', userSchema);

export default User;