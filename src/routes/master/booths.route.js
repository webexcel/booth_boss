import express from "express";
import { authenticateJWT } from "../../middleware/verifyToken.js";
import { getBooths, addBooths, editBooths, deleteBooths } from "../../controller/master/booths.controller.js";

const boothsRoutes = express.Router();

boothsRoutes.use(authenticateJWT);

boothsRoutes.get('/getBooths', getBooths);

boothsRoutes.post('/addBooths', addBooths);

boothsRoutes.post('/editBooths', editBooths);

boothsRoutes.post('/deleteBooths', deleteBooths);

export default boothsRoutes;