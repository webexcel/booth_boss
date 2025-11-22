import express from "express";
import { authenticateJWT } from "../../middleware/verifyToken.js";
import { getSurveyTemplate, addSurveyTemplate, editSurveyTemplate, deleteSurveyTemplate } from "../../controller/survey/surveyTemplate.controller.js";

const surveyTemplateRoutes = express.Router();

surveyTemplateRoutes.use(authenticateJWT);

surveyTemplateRoutes.get('/getSurveyTemplate', getSurveyTemplate);

surveyTemplateRoutes.post('/addSurveyTemplate', addSurveyTemplate);

surveyTemplateRoutes.post('/editSurveyTemplate', editSurveyTemplate);

surveyTemplateRoutes.post('/deleteSurveyTemplate', deleteSurveyTemplate);

export default surveyTemplateRoutes;