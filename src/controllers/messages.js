import MessagesSchema from "../schemas/messages.js";
import ChatSchema from "../schemas/chats.js";
import { errorMessage } from "../utils/error-message.js";
import JWT from "../utils/jwt.js";

export class MessageContr {
  constructor() {}

  static async AddMessage(req, res) {
    try {
      const { token } = req.headers;
      if(!token){
        throw new Error(`Token yuboring`)
      }
      const { id } = JWT.VERIFY(token);
      const { message, chat } = req.body;
      const findChat = await ChatSchema.findById(chat);
      if(findChat == null){
        throw new Error(`Chat topilmadi`)
      }
      const file = req.file;
      if (!chat) {
        throw new Error(`Chat Id yuboring`);
      } else if (!message && !file) {
        throw new Error(`Nimadur jo'nating, fayl yoki text`);
      }
      const newMessage = await MessagesSchema.create({
        sender: id,
        message,
        chat,
        file: file ? file.destination + file.originalname : null,
        type_file: file ? file?.mimetype.split("/")[0] : null,
      });
      await ChatSchema.findByIdAndUpdate(chat, {
        latestMessage: newMessage._id,
      });

      res.send({
        status: 200,
        message: "Xabar muvofaqqiyatli qo'shildi",
        success: true,
        data: newMessage,
      });
    } catch (error) {
      res.send(errorMessage(error.message));
    }
  }

  static async EditMessage(req, res) {
    try {
        const { id } = req.params;
      const { token } = req.headers;
      if(!token){
        throw new Error(`Token yuboring`)
      }
      const userId = JWT.VERIFY(token).id;
      const findMessage = await MessagesSchema.findById(id);
      if(findMessage == null){
        throw new Error(`Xabar topilmadi`)
      }
      const { message } = req.body;
      const file = req.file;
     if (!message && !file) {
        throw new Error(`Nimadur jo'nating, fayl yoki text`);
      }
      if(findMessage.sender != userId){
        throw new Error(`Faqat o'zingiz yuborgan xabarlarni o'zgartira olasiz`)
      }
      const updated = await MessagesSchema.findByIdAndUpdate(id, { message : message || findMessage.message, file : file?.destination + file?.originalname || findMessage.file }, { new : true })
      res.send({
        status : 200,
        message : "Xabar muvofaqqiyatli o'zgartirildi",
        success : true,
        data : updated
      })
      
    } catch (error) {
      res.send(errorMessage(error.message));
    }
  }


 static async Delete(req, res){
    try {
        const { id } = req.params;
        const { token } = req.headers;
        if(!token){
          throw new Error(`Token yuboring`)
        }
        const userId = JWT.VERIFY(token).id;
      const findMessage = await MessagesSchema.findById(id);
      if(findMessage == null){
        throw new Error(`Xabar topilmadi`)
      }
      if(findMessage.sender != userId){
        throw new Error(`Faqat o'zingiz yuborgan xabarlarni o'chira olasiz`)
      }
      const deleted = await MessagesSchema.findByIdAndDelete(id);
      res.send({
        status : 200,
        message : "Xabar muvofaqqiyatli o'chirildi",
        success : true,
        data : deleted
      })
    } catch (error) {
        res.send(errorMessage(error.message));
    }
 }

}
