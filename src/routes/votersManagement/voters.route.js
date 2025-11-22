import express from "express";
import multer from 'multer';
import { authenticateJWT } from "../../middleware/verifyToken.js";
import { getVoters, addVoter, editVoter, deleteVoter, voterBulkUpload } from "../../controller/votersManagement/voters.controller.js";

const votersRoutes = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

votersRoutes.use(authenticateJWT);

votersRoutes.get('/getVoters', getVoters);

votersRoutes.post('/addVoter', addVoter);

votersRoutes.post('/editVoter', editVoter);

votersRoutes.post('/deleteVoter', deleteVoter);

votersRoutes.post('/voterBulkUpload', upload.single('voters'), voterBulkUpload);

export default votersRoutes;