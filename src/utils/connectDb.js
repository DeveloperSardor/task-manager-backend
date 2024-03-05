import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

export default async function (){
    try {
        await mongoose.connect(process.env.DB_URL)
          console.log(`Successfuly connected to DB!`);
    } catch (error) {
        console.log('error');
        console.log(error.message);
    }
}