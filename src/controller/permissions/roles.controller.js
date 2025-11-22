import createKnexInstance from "../../../configs/db.js";
import { logger } from "../../../configs/winston.js";

export const getRoles = async (req, res, next) => {
    let knex = null;
    try {
        const { dbname, user_name } = req.user;

        logger.info("Roles list Request Received", {
            username: user_name,
            reqdetails: "roles-getRoles",
        });

        knex = await createKnexInstance(dbname);

        const result = await knex('roles')
            .select('id', 'name', 'description')
            .where({ 'status': '0' });

        if (result && result.length > 0) {
            logger.info("Roles list retrieved successfully", {
                username: user_name,
                reqdetails: "roles-getRoles",
            });
            return res.status(200).json({
                message: "Roles list retrieved successfully",
                data: result,
                status: true,
            });
        } else {
            logger.warn("No Roles list found", {
                username: user_name,
                reqdetails: "roles-getRoles",
            });
            return res.status(400).json({
                message: "No Roles list found",
                status: false,
                data: [],
            });
        }
    } catch (err) {
        logger.error("Error fetching Roles list", {
            error: err.message,
            stack: err.stack,
            username: req.user?.user_name,
            reqdetails: "roles-getRoles",
        });
        next(err);
    } finally {
        if (knex) {
            await knex.destroy();
        }
    }
};

export const addRoles = async (req, res, next) => {
    let knex = null;
    try {
        const { name, description } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Add Role Request Received", {
            username: user_name,
            reqdetails: "roles-addRoles",
        });

        if (!name) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "roles-addRoles",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('roles')
            .where({ name })
            .first();

        if (exists) {
            logger.warn("Duplicate Entry detected", {
                username: user_name,
                reqdetails: "roles-addRoles",
            });
            return res.status(400).json({
                message: "Duplicate Entry detected",
                status: false,
            });
        }

        const insertResult = await knex('roles')
            .insert({
                name: name,
                description
            });

        if (insertResult) {
            logger.info("Role inserted successfully", {
                username: user_name,
                reqdetails: "roles-addRoles",
            });
            return res.status(200).json({
                message: "Role inserted successfully",
                status: true,
            });
        } else {
            logger.error("Failed to insert Role", {
                username: user_name,
                reqdetails: "roles-addRoles",
            });
            return res.status(500).json({
                message: "Failed to insert Role",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error inserting Role:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const editRoles = async (req, res, next) => {
    let knex = null;
    try {
        const { id, name, description } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Edit Role Request Received", {
            username: user_name,
            reqdetails: "roles-editRoles",
        });

        if (!id || !name) {
            logger.error("Mandatory fields are missing for Edit Role", {
                username: user_name,
                reqdetails: "roles-editRoles",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('roles')
            .where({ id: id, status: "0" })
            .first();

        if (!exists) {
            logger.warn("No Data Found!", {
                username: user_name,
                reqdetails: "roles-editRoles",
            });
            return res.status(400).json({
                message: "No Data Found!",
                status: false,
            });
        }

        const updateResult = await knex("roles")
            .update({
                name,
                description
            })
            .where({ id });

        if (updateResult) {
            logger.info("Role updated successfully", {
                username: user_name,
                reqdetails: "roles-editRoles",
            });
            return res.status(200).json({
                message: "Role updated successfully",
                status: true,
            });
        } else {
            logger.error("Role not found or update failed", {
                username: user_name,
                reqdetails: "roles-editRoles",
            });
            return res.status(400).json({
                message: "Role not found or update failed",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error updating Role:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const deleteRoles = async (req, res, next) => {
    let knex = null;
    try {
        const { id } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Delete Role Request Received", {
            username: user_name,
            reqdetails: "roles-deleteRoles",
        });

        if (!id) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "roles-deleteRoles",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const record = await knex("roles")
            .select("*")
            .where({ id })
            .first();

        if (!record) {
            logger.error("Record not found", {
                username: user_name,
                reqdetails: "roles-deleteRoles",
            });
            return res.status(400).json({
                message: "Record not found",
                status: false,
            });
        }

        const deleteRes = await knex("roles")
            .update({ status: "1" })
            .where({ id: id });

        if (deleteRes) {
            logger.info("Role deleted successfully", {
                username: user_name,
                reqdetails: "roles-deleteRoles",
            });
            return res.status(200).json({
                message: "Role deleted successfully",
                status: true,
            });
        } else {
            logger.error("Role not found or delete failed", {
                username: user_name,
                reqdetails: "roles-deleteRoles",
            });
            return res.status(400).json({
                message: "Role not found or delete failed",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error deleting Role:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const getUserRole = async (req, res, next) => {
    let knex = null;
    try {
        const { dbname, user_name } = req.user;

        logger.info("Get User Role Request Received", {
            username: user_name,
            reqdetails: "roles-getUserRole",
        });

        knex = await createKnexInstance(dbname);

        const result = await knex("user_roles")
            .leftJoin("roles", "user_roles.role_id", "roles.id")
            .leftJoin("users", "user_roles.user_id", "users.id")
            .select(
                "user_roles.id",
                "user_roles.role_id",
                "roles.name as role_name",
                "user_roles.user_id",
                "users.full_name as name"
            )
            .where({ "user_roles.status": "0" });

        if (result.length > 0) {
            logger.info("User Role fetched successfully", {
                username: user_name,
                reqdetails: "roles-getUserRole",
            });
            return res.status(200).json({
                message: "User Role fetched successfully",
                status: true,
                data: result
            });
        } else {
            logger.info("No User Role fetched", {
                username: user_name,
                reqdetails: "roles-getUserRole",
            });
            return res.status(400).json({
                message: "No User Role fetched",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error fetching User Role:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const setUserRole = async (req, res, next) => {
    let knex = null;
    try {
        const { user, role } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Set User-Role Request Received", {
            username: user_name,
            reqdetails: "roles-setUserRole",
        });

        if (!user || !role) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "roles-setUserRole",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const existing = await knex("user_roles")
            .where({ role_id: role, status: "0", user_id: user })
            .first();

        if (existing) {
            logger.info("Already User-Role assigned", {
                username: user_name,
                reqdetails: "roles-setUserRole",
            });
            return res.status(400).json({
                message: "Already User-Role assigned",
                status: false,
            });
        }

        const user_exist = await knex("user_roles")
            .select("*")
            .where({ status: "0", user_id: user })
            .first();

        let insertResult;
        if (user_exist) {
            insertResult = await knex("user_roles").update({
                "role_id": role
            })
                .where({ "id": user_exist.id });
        } else {
            insertResult = await knex("user_roles").insert({
                "user_id": user,
                "role_id": role
            });
        }

        if (insertResult) {
            logger.info("User-Role assigned successfully", {
                username: user_name,
                reqdetails: "roles-setUserRole",
            });
            return res.status(200).json({
                message: "User-Role assigned successfully",
                status: true,
            });
        } else {
            logger.info("No User-Role assigned", {
                username: user_name,
                reqdetails: "roles-setUserRole",
            });
            return res.status(400).json({
                message: "No User-Role assigned",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error assigning User-Role:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const deleteUserRole = async (req, res, next) => {
    let knex = null;
    try {
        const { id } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Delete User-Role Request Received", {
            username: user_name,
            reqdetails: "roles-deleteUserRole",
        });

        if (!id) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "roles-deleteUserRole",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const existing = await knex("user_roles")
            .where({ "id": id, "status": "0" });

        if (!existing) {
            logger.warn("No Record Found", {
                username: user_name,
                reqdetails: "roles-deleteUserRole",
            });
            return res.status(400).json({
                message: "No Record Found",
                status: false,
            });
        }

        const deleteRes = await knex("user_roles")
            .update({ status: "1" })
            .where({ id: id });

        if (deleteRes) {
            logger.info("User-Role deleted successfully", {
                username: user_name,
                reqdetails: "roles-deleteUserRole",
            });
            return res.status(200).json({
                message: "User-Role deleted successfully",
                status: true,
            });
        } else {
            logger.info("No User-Role deleted", {
                username: user_name,
                reqdetails: "roles-deleteUserRole",
            });
            return res.status(400).json({
                message: "No User-Role deleted",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error deleteing User-Role:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};