import createKnexInstance from "../../../configs/db.js";
import { logger } from "../../../configs/winston.js";

export const getBooths = async (req, res, next) => {
    let knex = null;
    try {
        const { dbname, user_name } = req.user;

        logger.info("Booths list Request Received", {
            username: user_name,
            reqdetails: "booths-getBooths",
        });

        knex = await createKnexInstance(dbname);

        const result = await knex('booths')
            .leftJoin('blocks', 'booths.block_id', 'blocks.id')
            .select('booths.id', 'booths.block_id', 'blocks.name', 'booths.code', 'booths.name', 'booths.location_point')
            .where({ 'booths.status': '0' });

        if (result && result.length > 0) {
            logger.info("Booths list retrieved successfully", {
                username: user_name,
                reqdetails: "booths-getBooths",
            });
            return res.status(200).json({
                message: "Booths list retrieved successfully",
                data: result,
                status: true,
            });
        } else {
            logger.warn("No Booths list found", {
                username: user_name,
                reqdetails: "booths-getBooths",
            });
            return res.status(400).json({
                message: "No Booths list found",
                status: false,
                data: [],
            });
        }
    } catch (err) {
        logger.error("Error fetching Booths list", {
            error: err.message,
            stack: err.stack,
            username: req.user?.user_name,
            reqdetails: "booths-getBooths",
        });
        next(err);
    } finally {
        if (knex) {
            await knex.destroy();
        }
    }
};

export const addBooths = async (req, res, next) => {
    let knex = null;
    try {
        const { block_id, code, name, loc_point } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Add Booths Request Received", {
            username: user_name,
            reqdetails: "booths-addBooths",
        });

        if (!block_id || !code || !name) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "booths-addBooths",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        if (!Array.isArray(loc_point) || loc_point.length === 0) {
            loc_point = [0, 0];
        } else if (loc_point.length === 1) {
            loc_point.push(0);
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('booths')
            .select('*')
            .where({ block_id: block_id, code, name, status: '0' })
            .first();

        if (exists) {
            logger.warn("Duplicate Entry detected", {
                username: user_name,
                reqdetails: "booths-addBooths",
            });
            return res.status(400).json({
                message: "Duplicate Entry detected",
                status: false,
            });
        }

        const insertResult = await knex('booths')
            .insert({
                block_id: block_id,
                code: code,
                name: name,
                location_point: (loc_point[0] === 0 && loc_point[1] === 0) ? null : knex.raw("POINT(?, ?)", [loc_point[0], loc_point[1]])
            });

        if (insertResult) {
            logger.info("Booths inserted successfully", {
                username: user_name,
                reqdetails: "booths-addBooths",
            });
            return res.status(200).json({
                message: "Booths inserted successfully",
                status: true,
            });
        } else {
            logger.error("Failed to insert Booths", {
                username: user_name,
                reqdetails: "booths-addBooths",
            });
            return res.status(500).json({
                message: "Failed to insert Booths",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error inserting Booths:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const editBooths = async (req, res, next) => {
    let knex = null;
    try {
        const { id, block_id, code, name, loc_point } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Edit Booths Request Received", {
            username: user_name,
            reqdetails: "booths-editBooths",
        });

        if (!id || !block_id || !code || !name) {
            logger.error("Mandatory fields are missing for Edit Booths", {
                username: user_name,
                reqdetails: "booths-editBooths",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        if (!Array.isArray(loc_point) || loc_point.length === 0) {
            loc_point = [0, 0];
        } else if (loc_point.length === 1) {
            loc_point.push(0);
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('booths')
            .select('*')
            .where({ id: id, status: "0" })
            .first();

        if (!exists) {
            logger.warn("No Data Found!", {
                username: user_name,
                reqdetails: "booths-editBooths",
            });
            return res.status(400).json({
                message: "No Data Found!",
                status: false,
            });
        }

        const oldType = exists.att_type;

        const updateResult = await knex("booths")
            .update({
                block_id: block_id,
                code: code,
                name: name,
                location_point: (loc_point[0] === 0 && loc_point[1] === 0) ? null : knex.raw("POINT(?, ?)", [loc_point[0], loc_point[1]])
            })
            .where({ id });

        if (updateResult) {
            logger.info("Booths updated successfully", {
                username: user_name,
                reqdetails: "booths-editBooths",
            });
            return res.status(200).json({
                message: "Booths updated successfully",
                status: true,
            });
        } else {
            logger.error("Booths not found or update failed", {
                username: user_name,
                reqdetails: "booths-editBooths",
            });
            return res.status(400).json({
                message: "Booths not found or update failed",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error updating Booths:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const deleteBooths = async (req, res, next) => {
    let knex = null;
    try {
        const { id } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Delete Booths Request Received", {
            username: user_name,
            reqdetails: "booths-deleteBooths",
        });

        if (!id) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "booths-deleteBooths",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const record = await knex("booths")
            .select("*")
            .where({ id })
            .first();

        if (!record) {
            logger.error("Record not found", {
                username: user_name,
                reqdetails: "booths-deleteBooths",
            });
            return res.status(400).json({
                message: "Record not found",
                status: false,
            });
        }

        const deleteRes = await knex("booths")
            .update({ status: "1" })
            .where({ id: id });

        if (deleteRes) {
            logger.info("Booths deleted successfully", {
                username: user_name,
                reqdetails: "booths-deleteBooths",
            });
            return res.status(200).json({
                message: "Booths deleted successfully",
                status: true,
            });
        } else {
            logger.error("Booths not found or delete failed", {
                username: user_name,
                reqdetails: "booths-deleteBooths",
            });
            return res.status(400).json({
                message: "Booths not found or delete failed",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error deleting Booths:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};