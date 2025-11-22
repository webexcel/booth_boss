import createKnexInstance from "../../../configs/db.js";
import { logger } from "../../../configs/winston.js";

export const getBlocks = async (req, res, next) => {
    let knex = null;
    try {
        const { dbname, user_name } = req.user;

        logger.info("Blocks list Request Received", {
            username: user_name,
            reqdetails: "blocks-getBlocks",
        });

        knex = await createKnexInstance(dbname);

        const result = await knex('blocks')
            .leftJoin('constituencies', 'blocks.constituency_id', 'constituencies.id')
            .select('blocks.id', 'blocks.constituency_id', 'constituencies.name', 'blocks.code', 'blocks.name')
            .where({ 'blocks.status': '0' });

        if (result && result.length > 0) {
            logger.info("Blocks list retrieved successfully", {
                username: user_name,
                reqdetails: "blocks-getBlocks",
            });
            return res.status(200).json({
                message: "Blocks list retrieved successfully",
                data: result,
                status: true,
            });
        } else {
            logger.warn("No Blocks list found", {
                username: user_name,
                reqdetails: "blocks-getBlocks",
            });
            return res.status(400).json({
                message: "No Blocks list found",
                status: false,
                data: [],
            });
        }
    } catch (err) {
        logger.error("Error fetching Blocks list", {
            error: err.message,
            stack: err.stack,
            username: req.user?.user_name,
            reqdetails: "blocks-getBlocks",
        });
        next(err);
    } finally {
        if (knex) {
            await knex.destroy();
        }
    }
};

export const addBlocks = async (req, res, next) => {
    let knex = null;
    try {
        const { con_id, code, name } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Add Block Request Received", {
            username: user_name,
            reqdetails: "blocks-addBlocks",
        });

        if (!con_id || !code || !name) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "blocks-addBlocks",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('blocks')
            .where({ constituency_id: con_id, code, name })
            .first();

        if (exists) {
            logger.warn("Duplicate Entry detected", {
                username: user_name,
                reqdetails: "blocks-addBlocks",
            });
            return res.status(400).json({
                message: "Duplicate Entry detected",
                status: false,
            });
        }

        const insertResult = await knex('blocks')
            .insert({
                constituency_id: con_id,
                code: code,
                name: name
            });

        if (insertResult) {
            logger.info("Block inserted successfully", {
                username: user_name,
                reqdetails: "blocks-addBlocks",
            });
            return res.status(200).json({
                message: "Block inserted successfully",
                status: true,
            });
        } else {
            logger.error("Failed to insert Block", {
                username: user_name,
                reqdetails: "blocks-addBlocks",
            });
            return res.status(500).json({
                message: "Failed to insert Block",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error inserting Block:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const editBlocks = async (req, res, next) => {
    let knex = null;
    try {
        const { id, con_id, code, name } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Edit Block Request Received", {
            username: user_name,
            reqdetails: "blocks-editBlocks",
        });

        if (!id || !con_id || !code || !name) {
            logger.error("Mandatory fields are missing for Edit Block", {
                username: user_name,
                reqdetails: "blocks-editBlocks",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('blocks')
            .where({ id: id, status: "0" })
            .first();

        if (!exists) {
            logger.warn("No Data Found!", {
                username: user_name,
                reqdetails: "blocks-editBlocks",
            });
            return res.status(400).json({
                message: "No Data Found!",
                status: false,
            });
        }

        const updateResult = await knex("blocks")
            .update({
                constituency_id: con_id,
                code,
                name
            })
            .where({ id });

        if (updateResult) {
            logger.info("Block updated successfully", {
                username: user_name,
                reqdetails: "blocks-editBlocks",
            });
            return res.status(200).json({
                message: "Block updated successfully",
                status: true,
            });
        } else {
            logger.error("Block not found or update failed", {
                username: user_name,
                reqdetails: "blocks-editBlocks",
            });
            return res.status(400).json({
                message: "Block not found or update failed",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error updating Block:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const deleteBlocks = async (req, res, next) => {
    let knex = null;
    try {
        const { id } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Delete Block Request Received", {
            username: user_name,
            reqdetails: "blocks-deleteBlocks",
        });

        if (!id) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "blocks-deleteBlocks",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const record = await knex("blocks")
            .select("*")
            .where({ id })
            .first();

        if (!record) {
            logger.error("Record not found", {
                username: user_name,
                reqdetails: "blocks-deleteBlocks",
            });
            return res.status(400).json({
                message: "Record not found",
                status: false,
            });
        }

        const deleteRes = await knex("blocks")
            .update({ status: "1" })
            .where({ id: id });

        if (deleteRes) {
            logger.info("Block deleted successfully", {
                username: user_name,
                reqdetails: "blocks-deleteBlocks",
            });
            return res.status(200).json({
                message: "Block deleted successfully",
                status: true,
            });
        } else {
            logger.error("Block not found or delete failed", {
                username: user_name,
                reqdetails: "blocks-deleteBlocks",
            });
            return res.status(400).json({
                message: "Block not found or delete failed",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error deleting Block:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};