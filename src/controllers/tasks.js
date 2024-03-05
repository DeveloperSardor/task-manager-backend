import TasksSchema from "../schemas/tasks.js";
import ChatSchema from "../schemas/chats.js";
import UserSchema from "../schemas/users.js";
import { errorMessage } from "../utils/error-message.js";
import JWT from "../utils/jwt.js";


export class TasksContr {
  constructor() {}





  static async AddTask(req, res) {
    try {
      const { title, desc, workers, deadline, category } = req.body;
      if (!title) {
        throw new Error(`Vazifa nomini kiriting`);
      } else if (!workers) {
        throw new Error(`Ishchilar birikiring`);
      } else if (!deadline) {
        throw new Error(`Vazifani tugatish sanasini kiriting`);
      } else if (!category) {
        throw new Error(`Vazifa tezligini kiriting`);
      }
      const newChatForTask = await ChatSchema.create({});
      const newTask = await TasksSchema.create({
        title,
        desc,
        workers,
        deadline,
        category,
        status: "pending",
        chat: newChatForTask._id,
      });
      res.send({
        status: 200,
        message: "Vazifa muvofaqqiyatli qo'shildi",
        success: true,
        data: newTask,
      });
    } catch (error) {
      res.send(errorMessage(error.message));
    }
  }


static async uploadFileByWorker(req, res){
  try {
    const { id } = req.params;
    const findTask = await TasksSchema.findById(id);
    if(findTask == null){
      throw new Error(`Vazifa topilmadi`)
    }
    const file = req.file;
    if(!file){
      throw new Error(`Fayl yuklang`)
    }
    console.log(file);
    const updated = await TasksSchema.findByIdAndUpdate(id, {  status : "done", worker_file : file.destination + file.originalname }, { new : true })
    res.send({
      status : 200,
      message : "Muvofaqqiyatli o'zgartirildi",
      success : true,
      data : updated
    })
  } catch (error) {
    res.send(errorMessage(error.message))
  }
}


static async GetArchiveTask(req, res) {
  try {
    const { id } = req.params;
    const { search, page = 1, limit = 6 } = req.query;

    const { token } = req.headers;
    if (!token) {
      throw new Error(`Token yuborish talab etiladi`);
    }
    const userId = JWT.VERIFY(token).id;
    console.log(userId);
    const findUser = await UserSchema.findById(userId); // Replace with the actual way of retrieving the user's role
    const userRole = findUser.position;
    if (id) {
      const findById = await TasksSchema.findById(id)
        .populate("workers")
        .populate("chat");

      if (findById == null) {
        throw new Error(`Vazifa topilmadi`);
      }

      res.send({
        status: 200,
        message: "Vazifa malumotlari",
        success: true,
        data: findById,
      });
    } else if (search) {
      const keyword = search
        ? {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { desc: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      let foundTask;

      if (userRole === "manager") {
        foundTask = await TasksSchema.find({
          ...keyword,
          deadline: { $gte: new Date() }, // Filter out tasks with past deadlines
        })
          .populate("workers")
          .populate("chat")
          .skip((page - 1) * limit)
          .limit(limit);
      } else if (userRole === "worker") {
        foundTask = await TasksSchema.find({
          ...keyword,
          workers: userId, // Replace with the actual way of retrieving the worker's ID
          deadline: { $gte: new Date() }, // Filter out tasks with past deadlines
        })
          .populate("workers")
          .populate("chat")
          .skip((page - 1) * limit)
          .limit(limit);
      }

      res.send({
        status: 200,
        message: "Topilgan vazifalar",
        success: true,
        data: foundTask,
      });
    } else {
      let allTasks;

      if (userRole === "manager") {
        allTasks = await TasksSchema.find({
          deadline: { $gte: new Date() }, // Filter out tasks with past deadlines
        })
          .populate("workers")
          .populate("chat")
          .skip((page - 1) * limit)
          .limit(limit);
      } else if (userRole === "worker") {
        allTasks = await TasksSchema.find({
          workers: userId, // Replace with the actual way of retrieving the worker's ID
          deadline: { $gte: new Date() }, // Filter out tasks with past deadlines
        })
          .populate("workers")
          .populate("chat")
          .skip((page - 1) * limit)
          .limit(limit);
      }

      res.send({
        status: 200,
        message: "Barcha vazifalar",
        success: true,
        data: allTasks,
      });
    }
  } catch (error) {
    res.send(errorMessage(error.message));
  }
}


static async GetTask(req, res){
  try{
    const { id } = req.params;
    const { search, page = 1, limit = 6 } = req.query;
    const { token } = req.headers;
if (!token) {
  throw new Error(`Token yuborish talab etiladi`);
}
const userId = JWT.VERIFY(token).id;
console.log(userId);
const findUser = await UserSchema.findById(userId); // Replace with the actual way of retrieving the user's role
const userRole = findUser.position;
if (id) {
  const findById = await TasksSchema.findById(id)
    .populate("workers")
    .populate("chat");

  if (findById == null) {
    throw new Error(`Vazifa topilmadi`);
  }

  res.send({
    status: 200,
    message: "Vazifa malumotlari",
    success: true,
    data: findById,
  });
} else if (search) {
  const keyword = search
    ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { desc: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  let foundTask;

  if (userRole === "manager") {
    foundTask = await TasksSchema.find(keyword)
      .populate("workers")
      .populate("chat")
      // .skip((page - 1) * limit)
      // .limit(limit);
  } else if (userRole === "worker") {
    foundTask = await TasksSchema.find({
      ...keyword,
      workers: userId, // Replace with the actual way of retrieving the worker's ID
    })
      .populate("workers")
      .populate("chat")
      // .skip((page - 1) * limit)
      // .limit(limit);
  }

  res.send({
    status: 200,
    message: "Topilgan vazifalar",
    success: true,
    data: foundTask,
  });
} else {
  let allTasks;

  if (userRole === "manager") {
    allTasks = await TasksSchema.find()
      .populate("workers")
      .populate("chat")
      // .skip((page - 1) * limit)
      // .limit(limit);
  } else if (userRole === "worker") {
    allTasks = await TasksSchema.find({
      workers: userId, // Replace with the actual way of retrieving the worker's ID
    })
      .populate("workers")
      .populate("chat")
      // .skip((page - 1) * limit)
      // .limit(limit);
  }

  res.send({
    status: 200,
    message: "Barcha vazifalar",
    success: true,
    data: allTasks,
  });
}
  }catch(err){
    res.send(errorMessage(err.message))
  }
}



  static async addWorkerToTask(req, res) {
    try {
      const { workerId, taskId } = req.body;
      const findTask = await TasksSchema.findById(taskId);
      if (findTask == null) {
        throw new Error(`Vazifa topilmadi`);
      }
      const findUser = await UserSchema.findById(workerId);
      if (findUser == null) {
        throw new Error(`Ishchi topilmadi`);
      }
      const added = await TasksSchema.findByIdAndUpdate(
        taskId,
        {
          $push: { workers: workerId },
        },
        { new: true }
      );
      res.send({
        status: 200,
        message: "Muvofaqqiyatli qo'shildi",
        success: true,
        data: added,
      });
    } catch (error) {
      res.send(errorMessage(error.message));
    }
  }

  static async deleteWorkerFromTask(req, res) {
    try {
      const { workerId, taskId } = req.body;
      const findTask = await TasksSchema.findById(taskId);
      if (findTask == null) {
        throw new Error(`Vazifa topilmadi`);
      }
      const findUser = await UserSchema.findById(workerId);
      if (findUser == null) {
        throw new Error(`Ishchi topilmadi`);
      }
      const deleted = await TasksSchema.findByIdAndUpdate(
        taskId,
        {
          $pull: { workers: workerId },
        },
        { new: true }
      );
      res.send({
        status: 200,
        message: "Ishchi vazifadan chiqarildi ",
        success: true,
        data: deleted,
      });
    } catch (error) {
      res.send(errorMessage(error.message));
    }
  }

 
  static async EditTask(req, res) {
    try {
      const { token } = req.headers;
      const userId = JWT.VERIFY(token).id;
      const findUser = await UserSchema.findById(userId);
      const { id } = req.params;
      const findTask = await TasksSchema.findById(id);
      if (findTask == null) {
        throw new Error(`Vazifa topilmadi`);
      }
      const { title, desc, deadline, category, status } = req.body;
      if (!title && !desc && !deadline && !category && !status) {
        throw new Error(`O'zgartirish uchun yaroqli bo'lgan malumotlarni yuboring!`);
      }
      if (status) {
         if (status === "checked") {
          if (findUser.position === "worker") {
            throw new Error(
              `Faqat manager vazifani holatini "checked" ga o'zgartira oladi.`
            );
          }
          for (let i = 0; i < findTask.workers.length; i++) {
            const workerId = findTask.workers[i];
            const worker = await UserSchema.findByIdAndUpdate(workerId, { $inc: { raiting: 1 } }, { new: true });
            if (worker.raiting < 10) {
              await worker.save();
            }
          }
        } else if (status === "rejected") {
          if (findUser.position === "worker") {
            throw new Error(
              `Faqat manager vazifani holatini "rejected" ga o'zgartira oladi.`
            );
          }
          for (let i = 0; i < findTask.workers.length; i++) {
            const workerId = findTask.workers[i];
            const worker = await UserSchema.findByIdAndUpdate(workerId, { $inc: { raiting: -1 } }, { new: true });
            if (worker.raiting > 1) {
              await worker.save();
            }
          }
        }
      }
      const updated = await TasksSchema.findByIdAndUpdate(id, { title, desc, deadline : deadline || findTask.deadline, category, status : status || findTask.status }, { new: true });
      res.send({
        status: 200,
        message: "Muvofaqqiyatli o'zgartirildi",
        success: true,
        data: updated
      });
    } catch (error) {
      res.status(400).json({
        error: {
          message: error.message
        }
      });
    }
  }


  static async DeleteTask(req, res){
    try {
        const { id } = req.params;
        const findTask = await TasksSchema.findById(id);
        if (findTask == null) {
          throw new Error(`Vazifa topilmadi`);
        }
        const deleted = await TasksSchema.findByIdAndDelete(id);
        res.send({
            status : 200,
            message : "Vazifa muvofaqqiyatli o'chirildi",
            success : true,
            data : deleted
        })
    } catch (error) {
        res.send(errorMessage(error.message));
    }
  }



}
