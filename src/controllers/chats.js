import { errorMessage } from "../utils/error-message.js";
import ChatSchema from '../schemas/chats.js'
import TaskSchema from '../schemas/tasks.js'
import MessagesSchema from '../schemas/messages.js'
import UserSchema from '../schemas/users.js'



export class ChatContr{
    constructor(){};

    static async GetChatByTaskId(req, res) {
        try {
          const { task_id } = req.params;
          console.log(task_id);
          const findTask = await TaskSchema.findById(task_id)?.populate('workers');
          if (!findTask) {
            throw new Error(`Vazifa topilmadi`);
          }
          
          const findChat = await ChatSchema.findById(findTask?.chat)
          if (!findChat) {
            throw new Error(`Chat topilmadi`);
          }
          const chatId = findChat?._id;
          
          const messages = await MessagesSchema.find({ chat: chatId }).populate('sender').populate('chat');
          console.log(messages);

          
      
          const workerIds = findTask?.workers.map(worker => worker);
          const workers = await UserSchema?.find({ _id: { $in: workerIds } });
      
          const chatWithTaskInfo = { ...findChat?._doc, chatName: findTask?.title, workers };
      
          res.send({
            status: 200,
            message: "Chat va chat xabarlari",
            success: true,
            data: {
              messages: messages,
              chat: chatWithTaskInfo,
              task : findTask
            },
          });
        } catch (error) {
          res.send(errorMessage(error.message));
        }
      }

}