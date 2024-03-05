import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export default {
    SIGN(payload){
     return jwt.sign({id : payload}, JWT_SECRET)
    },
    VERIFY(token){
        try {
            if (jwt.verify(token, JWT_SECRET) instanceof Error)
              throw new Error("Expired token");
            else return jwt.verify(token, JWT_SECRET);
          } catch (err) {
            return err.message;
          }
    }
}
