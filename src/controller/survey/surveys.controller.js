import createKnexInstance from "../../../configs/db.js";
import { logger } from "../../../configs/winston.js";

export const getSurveyQuestions = async (req, res, next) => {
    let knex = null;
    try {
        const { dbname, user_name } = req.user;

        logger.info("Survey Questions list Request Received", {
            username: user_name,
            reqdetails: "surveys-getSurveyQuestions",
        });

        knex = await createKnexInstance(dbname);

        const result = await knex('survey_questions')
            .leftJoin('survey_templates', 'survey_questions.template_id', 'survey_templates.id')
            .select(
                'survey_questions.id',
                'survey_questions.template_id',
                'survey_questions.question_text',
                'survey_questions.question_type',
                'survey_questions.options',
                'survey_templates.code as template_code',
                'survey_templates.title as template_title'
            )
            .where({ 'survey_templates.active': '1', 'survey_questions.required': '1' });

        if (result && result.length > 0) {
            logger.info("Survey Questions list retrieved successfully", {
                username: user_name,
                reqdetails: "surveys-getSurveyQuestions",
            });
            return res.status(200).json({
                message: "Survey Questions list retrieved successfully",
                data: result,
                status: true,
            });
        } else {
            logger.warn("No Survey Questions list found", {
                username: user_name,
                reqdetails: "surveys-getSurveyQuestions",
            });
            return res.status(400).json({
                message: "No Survey Questions list found",
                status: false,
                data: [],
            });
        }
    } catch (err) {
        logger.error("Error fetching Survey Questions list", {
            error: err.message,
            stack: err.stack,
            username: req.user?.user_name,
            reqdetails: "surveys-getSurveyQuestions",
        });
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const addSurveyQuestions = async (req, res, next) => {
    let knex = null;
    try {
        const { temp_id, ques_txt, ques_type, options } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Add Survey Questions Request Received", {
            username: user_name,
            reqdetails: "surveys-addSurveyQuestions",
        });

        if (!temp_id || !ques_txt || !ques_type) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "surveys-addSurveyQuestions",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('survey_questions')
            .where({ template_id: temp_id, question_text: ques_txt, question_type: ques_type })
            .first();

        if (exists) {
            logger.warn("Duplicate Entry detected", {
                username: user_name,
                reqdetails: "surveys-addSurveyQuestions",
            });
            return res.status(400).json({
                message: "Duplicate Entry detected",
                status: false,
            });
        }

        const insertResult = await knex('survey_questions')
            .insert({
                template_id: temp_id,
                question_text: ques_txt,
                question_type: ques_type,
                options: options
            });

        if (insertResult) {
            logger.info("Survey Questions inserted successfully", {
                username: user_name,
                reqdetails: "surveys-addSurveyQuestions",
            });
            return res.status(200).json({
                message: "Survey Questions inserted successfully",
                status: true,
            });
        } else {
            logger.error("Failed to insert Survey Questions", {
                username: user_name,
                reqdetails: "surveys-addSurveyQuestions",
            });
            return res.status(500).json({
                message: "Failed to insert Survey Questions",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error inserting Survey Questions:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const editSurveyQuestions = async (req, res, next) => {
    let knex = null;
    try {
        const { id, temp_id, ques_txt, ques_type, options } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Edit Survey Questions Request Received", {
            username: user_name,
            reqdetails: "surveys-editSurveyQuestions",
        });

        if (!id || !temp_id || !ques_txt || !ques_type) {
            logger.error("Mandatory fields are missing for Edit Survey Questions", {
                username: user_name,
                reqdetails: "surveys-editSurveyQuestions",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('survey_questions')
            .where({ template_id: temp_id, question_text: ques_txt, question_type: ques_type })
            .first();

        if (!exists) {
            logger.warn("No Data Found!", {
                username: user_name,
                reqdetails: "surveys-editSurveyQuestions",
            });
            return res.status(400).json({
                message: "No Data Found!",
                status: false,
            });
        }

        const updateResult = await knex("survey_questions")
            .update({
                template_id: temp_id,
                question_text: ques_txt,
                question_type: ques_type,
                options: options
            })
            .where({ id });

        if (updateResult) {
            logger.info("Survey Questions updated successfully", {
                username: user_name,
                reqdetails: "surveys-editSurveyQuestions",
            });
            return res.status(200).json({
                message: "Survey Questions updated successfully",
                status: true,
            });
        } else {
            logger.error("Survey Questions not found or update failed", {
                username: user_name,
                reqdetails: "surveys-editSurveyQuestions",
            });
            return res.status(400).json({
                message: "Survey Questions not found or update failed",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error updating Survey Questions:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const deleteSurveyQuestions = async (req, res, next) => {
    let knex = null;
    try {
        const { id } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Delete Survey Questions Request Received", {
            username: user_name,
            reqdetails: "surveys-deleteSurveyQuestions",
        });

        if (!id) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "surveys-deleteSurveyQuestions",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const record = await knex("survey_questions")
            .select("*")
            .where({ id })
            .first();

        if (!record) {
            logger.error("Record not found", {
                username: user_name,
                reqdetails: "surveys-deleteSurveyQuestions",
            });
            return res.status(400).json({
                message: "Record not found",
                status: false,
            });
        }

        const deleteRes = await knex("survey_questions")
            .update({ required: "0" })
            .where({ id: id });

        if (deleteRes) {
            logger.info("Survey Questions deleted successfully", {
                username: user_name,
                reqdetails: "surveys-deleteSurveyQuestions",
            });
            return res.status(200).json({
                message: "Survey Questions deleted successfully",
                status: true,
            });
        } else {
            logger.error("Survey Questions not found or delete failed", {
                username: user_name,
                reqdetails: "surveys-deleteSurveyQuestions",
            });
            return res.status(400).json({
                message: "Survey Questions not found or delete failed",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error deleting Survey Questions:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};