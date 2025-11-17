import createKnexInstance from "../../../configs/db.js";
import { logger } from "../../../configs/winston.js";

export const getParts = async (req, res, next) => {
    let knex = null;
    try {
        const { dbname, user_name } = req.user;

        logger.info("Parts list Request Received", {
            username: user_name,
            reqdetails: "parts-getParts",
        });

        knex = await createKnexInstance(dbname);

        const result = await knex('parts')
            .leftJoin('booths', 'parts.booth_id', 'booths.id')
            .select('parts.id', 'parts.booth_id', 'booths.name', 'parts.code', 'parts.name')
            .where({ 'parts.status': '0' });

        if (result && result.length > 0) {
            logger.info("Parts list retrieved successfully", {
                username: user_name,
                reqdetails: "parts-getParts",
            });
            return res.status(200).json({
                message: "Parts list retrieved successfully",
                data: result,
                status: true,
            });
        } else {
            logger.warn("No Parts list found", {
                username: user_name,
                reqdetails: "parts-getParts",
            });
            return res.status(400).json({
                message: "No Parts list found",
                status: false,
            });
        }
    } catch (err) {
        logger.error("Error fetching Parts list", {
            error: err.message,
            stack: err.stack,
            username: req.user?.user_name,
            reqdetails: "parts-getParts",
        });
        next(err);
    } finally {
        if (knex) {
            await knex.destroy();
        }
    }
};

export const addParts = async (req, res, next) => {
    let knex = null;
    try {
        const { booth_id, code, name } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Add Parts Request Received", {
            username: user_name,
            reqdetails: "parts-addParts",
        });

        if (!booth_id || !code || !name) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "parts-addParts",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('parts')
            .select('*')
            .where({ booth_id: booth_id, code: code, name: name, status: "0" })
            .first();

        if (exists) {
            logger.warn("Duplicate Entry detected", {
                username: user_name,
                reqdetails: "parts-addParts",
            });
            return res.status(400).json({
                message: "Duplicate Entry detected",
                status: false,
            });
        }

        const existing = await knex("parts")
            .where({ code })
            .first();

        if (existing) {
            return res.status(400).json({
                message: "Code already exists. Please use a different code."
            });
        }

        const insertResult = await knex('parts')
            .insert({
                booth_id: booth_id,
                code: code,
                name: name
            });

        if (insertResult) {
            logger.info("Parts inserted successfully", {
                username: user_name,
                reqdetails: "parts-addParts",
            });
            return res.status(200).json({
                message: "Parts inserted successfully",
                status: true,
            });
        } else {
            logger.error("Failed to insert Parts", {
                username: user_name,
                reqdetails: "parts-addParts",
            });
            return res.status(500).json({
                message: "Failed to insert Parts",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error inserting Parts:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const editParts = async (req, res, next) => {
    let knex = null;
    try {
        const { id, booth_id, code, name } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Edit Parts Request Received", {
            username: user_name,
            reqdetails: "parts-editParts",
        });

        if (!id || !booth_id || !code || !name) {
            logger.error("Mandatory fields are missing for Edit Parts", {
                username: user_name,
                reqdetails: "parts-editParts",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('parts')
            .select('*')
            .where({ id: id, status: "0" })
            .first();

        if (!exists) {
            logger.warn("No Data Found!", {
                username: user_name,
                reqdetails: "parts-editParts",
            });
            return res.status(400).json({
                message: "No Data Found!",
                status: false,
            });
        }

        const existing = await knex("parts")
            .where({ code })
            .whereNot({ id })
            .first();

        if (existing) {
            return res.status(400).json({
                message: "Code already exists. Please use a different code."
            });
        }

        const updateResult = await knex("parts")
            .update({
                booth_id: booth_id,
                code: code,
                name: name
            })
            .where({ id });

        if (updateResult) {
            logger.info("Parts updated successfully", {
                username: user_name,
                reqdetails: "parts-editParts",
            });
            return res.status(200).json({
                message: "Parts updated successfully",
                status: true,
            });
        } else {
            logger.error("Parts not found or update failed", {
                username: user_name,
                reqdetails: "parts-editParts",
            });
            return res.status(400).json({
                message: "Parts not found or update failed",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error updating Parts:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const deleteParts = async (req, res, next) => {
    let knex = null;
    try {
        const { id } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Delete Parts Request Received", {
            username: user_name,
            reqdetails: "parts-deleteParts",
        });

        if (!id) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "parts-deleteParts",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const record = await knex("parts")
            .select("*")
            .where({ id })
            .first();

        if (!record) {
            logger.error("Record not found", {
                username: user_name,
                reqdetails: "parts-deleteParts",
            });
            return res.status(400).json({
                message: "Record not found",
                status: false,
            });
        }

        const deleteRes = await knex("parts")
            .update({ status: "1" })
            .where({ id: id });

        if (deleteRes) {
            logger.info("Parts deleted successfully", {
                username: user_name,
                reqdetails: "parts-deleteParts",
            });
            return res.status(200).json({
                message: "Parts deleted successfully",
                status: true,
            });
        } else {
            logger.error("Parts not found or delete failed", {
                username: user_name,
                reqdetails: "parts-deleteParts",
            });
            return res.status(400).json({
                message: "Parts not found or delete failed",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error deleting Parts:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};