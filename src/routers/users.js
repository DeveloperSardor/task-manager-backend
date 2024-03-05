import { Router } from "express";
import { UsersContr } from "../controllers/users.js";
import managerCheck from '../middlewares/manager.js'
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

router.post('/register-worker', upload.single('file'), UsersContr.RegisterWorker);
router.post('/login-admin', UsersContr.LoginAdmin);
router.post('/login-workers', UsersContr.LoginWorkers);
router.get('/my-profile', UsersContr.GetMyProfile)
router.get('/', UsersContr.GetUsers)
router.put('/edit-worker/:id', upload.single('file'), managerCheck, UsersContr.EditWorker)
router.put('/edit-my-profile', upload.single('file'), UsersContr.EditMyProfile)
router.delete('/:id', managerCheck, UsersContr.DeleteWorker)


export default router;