import UsersSchema from "../schemas/users.js";
import { errorMessage } from "../utils/error-message.js";
import TasksSchema from "../schemas/tasks.js";
import bcrypt from 'bcrypt'
import JWT from '../utils/jwt.js'

export class UsersContr {
  constructor() {}

  static async LoginAdmin(req, res) {
    try {
      const { email, password } = req.body;
      if (!email) {
        throw new Error(`Email talab qilinadi!`);
      } else if (!password) {
        throw new Error(`Parolni kiriting!`);
      }
      const worker = await UsersSchema.findOne({ email });
      if(worker?.position != 'manager'){
        throw new Error(`Parol yoki email xato!`)
      }
      if (worker && (await worker.matchPassword(password))) {
        res.send({
          status: 200,
          message: "Muvofaqqiyatli kirdingiz",
          success: true,
          token: JWT.SIGN(worker._id),
          data: worker,
        });
      } else {
        throw new Error(`Email yoki parol xato`);
      }
    } catch (error) {
      res.send(errorMessage(error.message));
    }
  }


  static async LoginWorkers(req, res){
    try {
      const { email, password } = req.body;
      console.log(password);
      if (!email) {
        throw new Error(`Email talab qilinadi!`);
      } else if (!password) {
        throw new Error(`Parolni kiriting!`);
      }
      const worker = await UsersSchema.findOne({ email });
      if(worker?.position != 'worker'){
        throw new Error(`Ishchi topilmadi!`)
      }
      if (worker && (await worker.matchPassword(password))) {
        res.send({
          status: 200,
          message: "Muvofaqqiyatli kirdingiz",
          success: true,
          token: JWT.SIGN(worker._id),
          data: worker,
        });
      } else {
        throw new Error(`Email yoki parol xato`);
      }
    } catch (error) {
      res.send(errorMessage(error.message));
    }
  }

  static async RegisterWorker(req, res) {
    try {
      const { fullname, email, password } = req.body;
      const file = req.file;
      if (file && file.mimetype.split("/")[0] !== "image") {
        throw new Error(`Rasm fayl yuklashingiz kerak!`);
      }
      console.log(req.body);
      if (!fullname) {
        throw new Error(`Ism sharifingizni kiriting!`);
      } else if (!email) {
        throw new Error(`Email talab qilinadi!`);
      } else if (!password) {
        throw new Error(`Iltimos parol yarating!`);
      }
      const checkEmail = await UsersSchema.findOne({ email });
      if (checkEmail) {
        throw new Error(`Bu email band!`);
      }
      const newWorker = await UsersSchema.create({
        fullname,
        email,
        password,
        img: file
          ? file.destination + file.originalname
          : "uploads/user-default.png",
        position: "worker",
      });
      res.send({
        status: 201,
        message: `Muvofaqqiyatli ro'yxatdan o'tdingiz!`,
        success: true,
        data: newWorker,
        token: JWT.SIGN(newWorker?._id),
      });
    } catch (error) {
      res.send(errorMessage(error.message));
    }
  }

  static async GetMyProfile(req, res) {
    try {
      const { token } = req.headers;
      if(!token){
        throw new Error(`Token yuboring!`)
      }
      const { id } = JWT.VERIFY(token);
      const findProfile = await UsersSchema.findById(id);
      if (!findProfile) {
        throw new Error(`Profil topilmadi`);
      }
      res.send({
        status: 200,
        message: "Profilingiz",
        success: true,
        data: findProfile,
      });
    } catch (error) {
      res.send(errorMessage(error.message));
    }
  }




  static async GetUsers(req, res) {
    try {
      const { manager } = req.query;
      const search = req.query.search;
      const { id } = req.params;
      const findById = await UsersSchema.findById(id);
      if (id) {
        if (findById == null) {
          throw new Error(`Foydalanuvchi topilmadi!`);
        } else {
          const usersTasks = await TasksSchema.find({ workers: { $in: [id] } });
          res.send({
            status: 200,
            message: `${id} - foydalanuvchi ma'lumotlari`,
            success: true,
            data: { ...findById, tasks: usersTasks },
          });
        }
      } else if (search) {
        const keyword = req.query.search
          ? {
              $or: [
                { fullname: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
              ],
            }
          : {};
        const allUsers = (await UsersSchema.find(keyword)).filter(e=> e.position != 'manager');
       
        res.send({
          status: 200,
          message: "Qidiruv natijasida topilgan ishchilar",
          success: true,
          data: allUsers,
        });
      } else if(manager){
        res.send({
          status : 200,
          message : "Manager",
          success : true,
          data : await UsersSchema.findOne( {position : "manager"} )
        })
      }
      else {
        const allUsers = (await UsersSchema.find()).filter(e=> e.position != 'manager');
        
        res.send({
          status: 200,
          message: "Barcha ishchilar",
          success: true,
          data: allUsers,
        });
      }
    } catch (error) {
      res.send(errorMessage(error.message));
    }
  }

  static async EditWorker(req, res) {
    try {
      const { id } = req.params;
      const file = req.file;
      const findById = await UsersSchema.findById(id);

      if (findById == null) {
        throw new Error(`Foydalanuvchi topilmadi`);
      }
      const { fullname, email, password } = req.body;

      if (!fullname && !email && !password && !file) {
        throw new Error(
          `Siz o'zgartirish uchun hech qanday ma'lumot yubormadingiz!`
        );
      }

      if (file && file.mimetype.split("/")[0] !== "image") {
        throw new Error(`Rasm fayl yuklashingiz kerak`);
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = password ? await bcrypt.hash(password, salt) : findById.password;

      const updated = await UsersSchema.findByIdAndUpdate(
        id,
        {
          fullname,
          email,
          password: password ?  hashedPassword : findById.password,
          img: file ? file.destination + file.originalname : findById.img,
        },
        { new: true }
      );
      res.send({
        status: 200,
        message: `Muvofaqqiyatli o'zgartirildi`,
        success: true,
        data: updated,
      });
    } catch (error) {
      res.send(errorMessage(error.message));
    }
  }


  static async EditMyProfile(req, res) {
    try {
      const { token } = req.headers;
      const { id } = JWT.VERIFY(token);
      const file = req.file;
      const findById = await UsersSchema.findById(id);

      if (findById == null) {
        throw new Error(`Foydalanuvchi topilmadi`);
      }
      const { fullname, email, password } = req.body;

      if (!fullname && !email && !password && !file) {
        throw new Error(
          `Siz o'zgartirish uchun hech qanday ma'lumot yubormadingiz!`
        );
      }

      if (file && file.mimetype.split("/")[0] !== "image") {
        throw new Error(`Rasm fayl yuklashingiz kerak`);
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = password ? await bcrypt.hash(password, salt) : findById.password;
      const updated = await UsersSchema.findByIdAndUpdate(
        id,
        {
          fullname,
          email,
          password: hashedPassword,
          img: file ? file.destination + file.originalname : findById.img,
        },
        { new: true }
      );
      res.send({
        status: 200,
        message: `Muvofaqqiyatli o'zgartirildi`,
        success: true,
        data: updated,
      });
    } catch (error) {
      res.send(errorMessage(error.message));
    }
  }



  static async DeleteWorker(req, res){
    try {
        const { id } = req.params;
        const findById = await UsersSchema.findById(id);
        if (findById == null) {
          throw new Error(`Foydalanuvchi topilmadi`);
        }
        const deletedWorker = await UsersSchema.findByIdAndDelete(id);
        res.send({
          status: 200,
          message: "Ishchi muvofaqqiyatli o'chirildi",
          success: true,
          data: deletedWorker,
        });
        
    } catch (error) {
        res.send(errorMessage(error.message));
    }
  }
}
