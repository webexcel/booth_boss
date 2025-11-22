import express from "express";
import { authenticateJWT } from "../../middleware/verifyToken.js";
import { getTasks, addTask, editTask, deleteTask, assignTask, updateTaskStatus } from "../../controller/tasks/task.controller.js";

const taskRoutes = express.Router();

taskRoutes.use(authenticateJWT);

taskRoutes.get('/getTasks', getTasks);

taskRoutes.post('/addTask', addTask);

taskRoutes.post('/editTask', editTask);

taskRoutes.post('/deleteTask', deleteTask);

taskRoutes.post('/assignTask', assignTask);

taskRoutes.post('/updateTaskStatus', updateTaskStatus);

export default taskRoutes;