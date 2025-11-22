import express from "express";
import { authenticateJWT } from "../../middleware/verifyToken.js";
import { getRoles, addRoles, editRoles, deleteRoles, getUserRole, setUserRole, deleteUserRole } from "../../controller/permissions/roles.controller.js";

const rolesRoutes = express.Router();

rolesRoutes.use(authenticateJWT);

rolesRoutes.get('/getRoles', getRoles);

rolesRoutes.post('/addRoles', addRoles);

rolesRoutes.post('/editRoles', editRoles);

rolesRoutes.post('/deleteRoles', deleteRoles);

rolesRoutes.get('/getUserRole', getUserRole);

rolesRoutes.post('/setUserRole', setUserRole);

rolesRoutes.post('/deleteUserRole', deleteUserRole);

export default rolesRoutes;