import express from "express";
import { authenticateJWT } from "../../middleware/verifyToken.js";
import { getConstituencies, addConstituencies, editConstituencies, deleteConstituencies } from "../../controller/master/constituencies.controller.js";

const constituenciesRoutes = express.Router();

constituenciesRoutes.use(authenticateJWT);

constituenciesRoutes.get('/getConstituencies', getConstituencies);

constituenciesRoutes.post('/addConstituencies', addConstituencies);

constituenciesRoutes.post('/editConstituencies', editConstituencies);

constituenciesRoutes.post('/deleteConstituencies', deleteConstituencies);

export default constituenciesRoutes;