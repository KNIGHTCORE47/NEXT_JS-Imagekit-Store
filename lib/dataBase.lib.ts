import mongoose from 'mongoose'

// NOTE - Establishing db connection string
const MONGODB_URI = process.env.MONGODB_URI!;

// NOTE - Check for Database Connection String
if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    )
}

// NOTE - Here we assume that in our database there is a cached connection

// NOTE - global: browser[window] | node[global]

// NOTE - Here we have to insert types explicitly

let cached = global.mongoose    // Output - {}

// NOTE - If cached connection exists, then return it
if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    }
}



// NOTE - Connect to Database
export async function connectToDatabase() {
    // NOTE - If cached connection exists, then return it
    if (cached.conn) {
        return cached.conn
    }

    // NOTE - If there is no cached connection, then create a new one
    if (!cached.promise) {
        const options = {
            bufferCommands: true,
            maxPoolSize: 10,
        }

        cached.promise = mongoose
            .connect(MONGODB_URI, options)
            .then(() => mongoose.connection)
    }
    // NOTE - If there is a cached connection, then return it
    try {
        cached.conn = await cached.promise
    } catch (error) {
        cached.promise = null
    }

    return cached.conn
}