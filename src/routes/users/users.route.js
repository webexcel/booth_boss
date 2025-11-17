import express from "express";
import { authenticateJWT } from "../../middleware/verifyToken.js";
import { getUsers, addUsers, editUsers, deleteUsers, resetPassword, changePassword } from "../../controller/users/users.controller.js";

const usersRoutes = express.Router();

usersRoutes.use(authenticateJWT);

usersRoutes.get('/getUsers', getUsers);

usersRoutes.post('/addUsers', addUsers);

usersRoutes.post('/editUsers', editUsers);

usersRoutes.post('/deleteUsers', deleteUsers);

usersRoutes.post('/resetPassword', resetPassword);

usersRoutes.post('/changePassword', changePassword);

export default usersRoutes;