import createKnexInstance from "../../../configs/db.js";
import { logger } from "../../../configs/winston.js";

export const getSurveyTemplate = async (req, res, next) => {
    let knex = null;
    try {
        const { dbname, user_name } = req.user;

        logger.info("Survey list Request Received", {
            username: user_name,
            reqdetails: "survey-getSurvey",
        });

        knex = await createKnexInstance(dbname);

        const result = await knex('survey_templates')
            .select('id', 'code', 'title', 'description')
            .where({ 'active': '1' });

        if (result && result.length > 0) {
            logger.info("Survey list retrieved successfully", {
                username: user_name,
                reqdetails: "survey-getSurvey",
            });
            return res.status(200).json({
                message: "Survey list retrieved successfully",
                data: result,
                status: true,
            });
        } else {
            logger.warn("No Survey list found", {
                username: user_name,
                reqdetails: "survey-getSurvey",
            });
            return res.status(400).json({
                message: "No Survey list found",
                status: false,
                data: [],
            });
        }
    } catch (err) {
        logger.error("Error fetching Survey list", {
            error: err.message,
            stack: err.stack,
            username: req.user?.user_name,
            reqdetails: "survey-getSurvey",
        });
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const addSurveyTemplate = async (req, res, next) => {
    let knex = null;
    try {
        const { code, name, description } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Add Survey Request Received", {
            username: user_name,
            reqdetails: "survey-addSurvey",
        });

        if (!code || !name) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "survey-addSurvey",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('survey_templates')
            .where({ code: code, active: "1", title: name })
            .first();

        if (exists) {
            logger.warn("Duplicate Entry detected", {
                username: user_name,
                reqdetails: "survey-addSurvey",
            });
            return res.status(400).json({
                message: "Duplicate Entry detected",
                status: false,
            });
        }

        const existing = await knex("survey_templates")
            .where({ code })
            .first();

        if (existing) {
            return res.status(400).json({
                message: "Code already exists. Please use a different code."
            });
        }

        const insertResult = await knex('survey_templates')
            .insert({
                code: code,
                title: name,
                description
            });

        if (insertResult) {
            logger.info("Survey inserted successfully", {
                username: user_name,
                reqdetails: "survey-addSurvey",
            });
            return res.status(200).json({
                message: "Survey inserted successfully",
                status: true,
            });
        } else {
            logger.error("Failed to insert Survey", {
                username: user_name,
                reqdetails: "survey-addSurvey",
            });
            return res.status(500).json({
                message: "Failed to insert Survey",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error inserting Survey:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const editSurveyTemplate = async (req, res, next) => {
    let knex = null;
    try {
        const { id, code, name, description } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Edit Survey Request Received", {
            username: user_name,
            reqdetails: "survey-editSurvey",
        });

        if (!id || !code || !name) {
            logger.error("Mandatory fields are missing for Edit Survey", {
                username: user_name,
                reqdetails: "survey-editSurvey",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('survey_templates')
            .where({ id: id, active: "1" })
            .first();

        if (!exists) {
            logger.warn("No Data Found!", {
                username: user_name,
                reqdetails: "survey-editSurvey",
            });
            return res.status(400).json({
                message: "No Data Found!",
                status: false,
            });
        }

        const existing = await knex("survey_templates")
            .where({ code })
            .whereNot({ id })
            .first();

        if (existing) {
            return res.status(400).json({
                message: "Code already exists. Please use a different code."
            });
        }

        const updateResult = await knex("survey_templates")
            .update({
                code: code,
                title: name,
                description
            })
            .where({ id });

        if (updateResult) {
            logger.info("Survey updated successfully", {
                username: user_name,
                reqdetails: "survey-editSurvey",
            });
            return res.status(200).json({
                message: "Survey updated successfully",
                status: true,
            });
        } else {
            logger.error("Survey not found or update failed", {
                username: user_name,
                reqdetails: "survey-editSurvey",
            });
            return res.status(400).json({
                message: "Survey not found or update failed",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error updating Survey:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const deleteSurveyTemplate = async (req, res, next) => {
    let knex = null;
    try {
        const { id } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Delete Survey Request Received", {
            username: user_name,
            reqdetails: "survey-deleteSurvey",
        });

        if (!id) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "survey-deleteSurvey",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const record = await knex("survey_templates")
            .select("*")
            .where({ id, active: "1" })
            .first();

        if (!record) {
            logger.error("Record not found", {
                username: user_name,
                reqdetails: "survey-deleteSurvey",
            });
            return res.status(400).json({
                message: "Record not found",
                status: false,
            });
        }

        const deleteRes = await knex("survey_templates")
            .update({ active: "0" })
            .where({ id: id });

        if (deleteRes) {
            logger.info("Survey deleted successfully", {
                username: user_name,
                reqdetails: "survey-deleteSurvey",
            });
            return res.status(200).json({
                message: "Survey deleted successfully",
                status: true,
            });
        } else {
            logger.error("Survey not found or delete failed", {
                username: user_name,
                reqdetails: "survey-deleteSurvey",
            });
            return res.status(400).json({
                message: "Survey not found or delete failed",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error deleting Survey:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};