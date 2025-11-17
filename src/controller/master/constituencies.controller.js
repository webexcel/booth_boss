import createKnexInstance from "../../../configs/db.js";
import { logger } from "../../../configs/winston.js";

export const getConstituencies = async (req, res, next) => {
    let knex = null;
    try {
        const { dbname, user_name } = req.user;

        logger.info("Constituencies list Request Received", {
            username: user_name,
            reqdetails: "constituencies-getConstituencies",
        });

        knex = await createKnexInstance(dbname);

        const result = await knex('constituencies')
            .select('id', 'code', 'name')
            .where({ 'status': '0' });

        if (result && result.length > 0) {
            logger.info("Constituencies list retrieved successfully", {
                username: user_name,
                reqdetails: "constituencies-getConstituencies",
            });
            return res.status(200).json({
                message: "Constituencies list retrieved successfully",
                data: result,
                status: true,
            });
        } else {
            logger.warn("No Constituencies list found", {
                username: user_name,
                reqdetails: "constituencies-getConstituencies",
            });
            return res.status(400).json({
                message: "No Constituencies list found",
                status: false,
                data: [],
            });
        }
    } catch (err) {
        logger.error("Error fetching Constituencies list", {
            error: err.message,
            stack: err.stack,
            username: req.user?.user_name,
            reqdetails: "constituencies-getConstituencies",
        });
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const addConstituencies = async (req, res, next) => {
    let knex = null;
    try {
        const { code, name } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Add Constituencies Request Received", {
            username: user_name,
            reqdetails: "constituencies-addConstituencies",
        });

        if (!code || !name) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "constituencies-addConstituencies",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('constituencies')
            .where({ code: code, status: "0", name: name })
            .first();

        if (exists) {
            logger.warn("Duplicate Entry detected", {
                username: user_name,
                reqdetails: "constituencies-addConstituencies",
            });
            return res.status(400).json({
                message: "Duplicate Entry detected",
                status: false,
            });
        }

        const existing = await knex("constituencies")
            .where({ code })
            .first();

        if (existing) {
            return res.status(400).json({
                message: "Code already exists. Please use a different code."
            });
        }

        const insertResult = await knex('constituencies')
            .insert({
                code: code,
                name: name,
            });

        if (insertResult) {
            logger.info("Constituencies inserted successfully", {
                username: user_name,
                reqdetails: "constituencies-addConstituencies",
            });
            return res.status(200).json({
                message: "Constituencies inserted successfully",
                status: true,
            });
        } else {
            logger.error("Failed to insert Constituencies", {
                username: user_name,
                reqdetails: "constituencies-addConstituencies",
            });
            return res.status(500).json({
                message: "Failed to insert Constituencies",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error inserting Constituencies:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const editConstituencies = async (req, res, next) => {
    let knex = null;
    try {
        const { id, code, name } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Edit Constituencies Request Received", {
            username: user_name,
            reqdetails: "constituencies-editConstituencies",
        });

        if (!id || !code || !name) {
            logger.error("Mandatory fields are missing for Edit Constituencies", {
                username: user_name,
                reqdetails: "constituencies-editConstituencies",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('constituencies')
            .where({ id: id, status: "0" })
            .first();

        if (!exists) {
            logger.warn("No Data Found!", {
                username: user_name,
                reqdetails: "constituencies-editConstituencies",
            });
            return res.status(400).json({
                message: "No Data Found!",
                status: false,
            });
        }

        const existing = await knex("constituencies")
            .where({ code })
            .whereNot({ id })
            .first();

        if (existing) {
            return res.status(400).json({
                message: "Code already exists. Please use a different code."
            });
        }

        const updateResult = await knex("constituencies")
            .update({
                code: code,
                name: name,
            })
            .where({ id });

        if (updateResult) {
            logger.info("Constituencies updated successfully", {
                username: user_name,
                reqdetails: "constituencies-editConstituencies",
            });
            return res.status(200).json({
                message: "Constituencies updated successfully",
                status: true,
            });
        } else {
            logger.error("Constituencies not found or update failed", {
                username: user_name,
                reqdetails: "constituencies-editConstituencies",
            });
            return res.status(400).json({
                message: "Constituencies not found or update failed",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error updating Constituencies:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const deleteConstituencies = async (req, res, next) => {
    let knex = null;
    try {
        const { id } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Delete Constituencies Request Received", {
            username: user_name,
            reqdetails: "constituencies-deleteConstituencies",
        });

        if (!id) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "constituencies-deleteConstituencies",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const record = await knex("constituencies")
            .select("*")
            .where({ id })
            .first();

        if (!record) {
            logger.error("Record not found", {
                username: user_name,
                reqdetails: "constituencies-deleteConstituencies",
            });
            return res.status(400).json({
                message: "Record not found",
                status: false,
            });
        }

        const deleteRes = await knex("constituencies")
            .update({ status: "1" })
            .where({ id: id });

        if (deleteRes) {
            logger.info("Constituencies deleted successfully", {
                username: user_name,
                reqdetails: "constituencies-deleteConstituencies",
            });
            return res.status(200).json({
                message: "Constituencies deleted successfully",
                status: true,
            });
        } else {
            logger.error("Constituencies not found or delete failed", {
                username: user_name,
                reqdetails: "constituencies-deleteConstituencies",
            });
            return res.status(400).json({
                message: "Constituencies not found or delete failed",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error deleting Constituencies:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};