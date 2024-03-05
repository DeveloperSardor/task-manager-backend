import { Router } from "express";
import { ChatContr } from "../controllers/chats.js";
import multer from "multer";


const router = Router();

const storage = multer.diskStorage({
    destination : function (req, file, cb){
        cb(null, 'uploads/')
    },
    filename : function (req, file, cb){
        cb(null, file.originalname)
    }
})

const upload = multer({ storage : storage })


router.get('/:task_id', ChatContr.GetChatByTaskId);



export default router;