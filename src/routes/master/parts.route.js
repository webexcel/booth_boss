import express from "express";
import { authenticateJWT } from "../../middleware/verifyToken.js";
import { getParts, addParts, editParts, deleteParts } from "../../controller/master/parts.controller.js";

const partsRoutes = express.Router();

partsRoutes.use(authenticateJWT);

partsRoutes.get('/getParts', getParts);

partsRoutes.post('/addParts', addParts);

partsRoutes.post('/editParts', editParts);

partsRoutes.post('/deleteParts', deleteParts);

export default partsRoutes;