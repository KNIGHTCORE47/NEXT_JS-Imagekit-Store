import { Connection } from 'mongoose'

// NOTE - Here we have use declare syntax to create a global variable called mongoose which is of type Connection.
/* NOTE - This global variable has three possiblities of connection - 
    01. There is connection, 
    02. There is a attampt to create connection will resolve/reject in promise, 
    03. There is no connection 
*/

declare global {
    var mongoose: {
        conn: Connection | null
        promise: Promise<Connection> | null
    }
}

export { }