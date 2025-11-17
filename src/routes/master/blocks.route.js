import express from "express";
import { authenticateJWT } from "../../middleware/verifyToken.js";
import { getBlocks, addBlocks, editBlocks, deleteBlocks } from "../../controller/master/blocks.controller.js";

const blocksRoutes = express.Router();

blocksRoutes.use(authenticateJWT);

blocksRoutes.get('/getBlocks', getBlocks);

blocksRoutes.post('/addBlocks', addBlocks);

blocksRoutes.post('/editBlocks', editBlocks);

blocksRoutes.post('/deleteBlocks', deleteBlocks);

export default blocksRoutes;