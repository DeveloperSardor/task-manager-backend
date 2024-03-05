import { Schema, Types, model } from "mongoose";



const ChatSchema = new Schema({
    latestMessage : {
        type : Types.ObjectId,
        ref : "Messages"
    }
});





export default model('Chats', ChatSchema)