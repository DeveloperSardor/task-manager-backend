import { Schema, Types, model } from "mongoose";



const TaskSchema = new Schema({
    title : {
       type : String,
   },
   desc : {
    type : String
   },
   workers : [{
    type : Types.ObjectId,
    ref : "Users"
   }],
   deadline : {
    type : Date
   },
   category : {
    type : String,
    enum : ['tez', '1-kunlik', '3-kunlik', '1-haftalik']
   },
   worker_file : {
    type : String,
    default : null
   },
   status : {
       type : String,
       enum : ['pending', 'done', 'checked', 'rejected'],
       default : 'pending'
     },
   chat : {
       type :  Types.ObjectId,
       ref : "Chats"
     }
   }, {
       timestamps : true
   })
   
   
   
   export default model('Tasks', TaskSchema)