import { Router } from "express";
import userRouter from './users.js'
import taskRouter from './tasks.js';
import chatsRouter from './chats.js'
import messageRouter from './messages.js'


const router = Router();


router.use('/users', userRouter);
router.use('/tasks', taskRouter);
router.use('/chats', chatsRouter);
router.use('/messages', messageRouter);



export default router;