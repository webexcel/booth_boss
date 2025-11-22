import express from "express";
import { authenticateJWT } from "../../middleware/verifyToken.js";
import { getSurveyQuestions, addSurveyQuestions, editSurveyQuestions, deleteSurveyQuestions } from "../../controller/survey/surveys.controller.js";

const surveysRoutes = express.Router();

surveysRoutes.use(authenticateJWT);

surveysRoutes.get('/getSurveyQuestions', getSurveyQuestions);

surveysRoutes.post('/addSurveyQuestions', addSurveyQuestions);

surveysRoutes.post('/editSurveyQuestions', editSurveyQuestions);

surveysRoutes.post('/deleteSurveyQuestions', deleteSurveyQuestions);

export default surveysRoutes;