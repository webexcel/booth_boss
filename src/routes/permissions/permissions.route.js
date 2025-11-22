import express from "express";
import { authenticateJWT } from "../../middleware/verifyToken.js";
import {
    getPermissions, addPermissions, editPermissions, deletePermissions, getRolePermissions, setRolePermissions,
    deleteRolePermissions
} from "../../controller/permissions/permissions.controller.js";

const permissionsRoutes = express.Router();

permissionsRoutes.use(authenticateJWT);

permissionsRoutes.get('/getPermissions', getPermissions);

permissionsRoutes.post('/addPermissions', addPermissions);

permissionsRoutes.post('/editPermissions', editPermissions);

permissionsRoutes.post('/deletePermissions', deletePermissions);

permissionsRoutes.get('/getRolePermissions', getRolePermissions);

permissionsRoutes.post('/setRolePermissions', setRolePermissions);

permissionsRoutes.post('/deleteRolePermissions', deleteRolePermissions);

export default permissionsRoutes;