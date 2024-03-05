import { Router } from "express";
import { TasksContr } from "../controllers/tasks.js";
import managerCheck from '../middlewares/manager.js'
import workerCheck from '../middlewares/worker.js'
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



router.post('/', managerCheck, TasksContr.AddTask);

router.put('/upload_file_to_task/:id', upload.single('file'), workerCheck, TasksContr.uploadFileByWorker);

router.get('/', TasksContr.GetTask)
router.get('/:id', TasksContr.GetTask)

router.put('/edit/:id', TasksContr.EditTask);

router.put('/add_worker', managerCheck, TasksContr.addWorkerToTask);
router.put('/delete_worker', managerCheck, TasksContr.deleteWorkerFromTask);


router.delete('/:id', managerCheck, TasksContr.DeleteTask);



export default router;