import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDb from './utils/connectDb.js';
import api from './routers/index.js';
import userSchema from './schemas/users.js';
import messageSchema from './schemas/messages.js';
import chatSchema from './schemas/chats.js';
import { Server as SocketIo } from 'socket.io';
import mime from 'mime-types'
import fs from 'fs';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

app.use(cors('*'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use('/api', api);

connectDb();

const io = new SocketIo(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', async (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('joinChat', (taskId) => {
    socket.join(`chat-${taskId}`);
  });

//   socket.on('sendMessage', async (data) => {
//     try {
//       const { userId, messageData, taskId } = data;
//       const { message, chat, file } = messageData;
//       const filePath = file ? `uploads/${file?.filename}` : null;
//       const findChat = await chatSchema.findById(chat);
//        console.log(file)
//       if (!findChat) {
//         throw new Error('Chat not found');
//       }

//       if (file) {
//         fs.writeFileSync(filePath, file.buffer);
//       }

//       const newMessage = await messageSchema.create({
//         sender: userId,
//         message,
//         chat,
//         file: filePath || null,  
//       });

//       console.log(file);
//       io.to(`chat-${taskId}`).emit('receive-new-message', newMessage);
//     } catch (error) {
//       console.error('Error saving message to the database:', error.message);
//     }
//   });


socket.on('sendMessage', async (data) => {
    try {
      const { userId, messageData, taskId } = data;
      console.log(data);
      const { message, chat, file } = messageData;
      const findChat = await chatSchema.findById(chat);
  
      if (!findChat) {
        throw new Error('Chat not found');
      }
  
      let filePath = null;
  
      if (file) {
        const fileExtension = file.filename.split('.').pop().toLowerCase();
        filePath = `uploads/${file.filename}`;
  
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          // Handle image file
          fs.writeFileSync(filePath, Buffer.from(file.buffer, 'base64'));
        } else if (['mp4', 'avi', 'mov'].includes(fileExtension)) {
          // Handle video file
          fs.writeFile(filePath, file.buffer, 'base64', (err) => {
            if (err) throw err;
          });
        } else if (['zip'].includes(fileExtension)) {
          // Handle zip file
          fs.writeFile(filePath, file.buffer, 'base64', (err) => {
            if (err) throw err;
          });
        } else {
          // Handle other file types (PDF, Word, etc.)
          fs.writeFileSync(filePath, Buffer.from(file.buffer, 'base64'));
        }
      }
  
      const newMessage = await messageSchema.create({
        sender: userId,
        message,
        chat,
        file: filePath || null,
      });
      const findNewMessage = await messageSchema.findById(newMessage._id).populate('sender')
  
      io.to(`chat-${taskId}`).emit('receive-new-message', findNewMessage);
    } catch (error) {
      console.error('Error saving message to the database:', error.message);
    }
  });

  socket.on('updateMessage', async (data) => {
    try {
      const { messageData, userId } = data;
      const { _id, message, file } = messageData;
      const findMessage = await messageSchema.findById(_id);
      const filePath = `uploads/${file.filename}`;

      if (file) {
        fs.writeFileSync(filePath, file.buffer);
      }

      const updated = await messageSchema.findByIdAndUpdate(
        _id,
        { message: message || findMessage.message, file: filePath || findMessage.file },
        { new: true }
      );

      io.to(`chat-${updated.chat}`).emit('messageUpdated', updated);   
    } catch (error) {
      console.log('Error updating message:', error.message);
    }
  });

  socket.on('deleteMessage', async ({ messageId, taskId }) => {
    try {
      const deleted = await messageSchema.findByIdAndDelete(messageId);
      io.to(`chat-${taskId}`).emit('messageDeleted', messageId);
    } catch (error) {
      console.error('Error deleting message:', error.message);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT}`);
});