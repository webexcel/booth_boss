import createKnexInstance from "../../../configs/db.js";
import { logger } from "../../../configs/winston.js";

export const getPermissions = async (req, res, next) => {
    let knex = null;
    try {
        const { dbname, user_name } = req.user;

        logger.info("Permissions list Request Received", {
            username: user_name,
            reqdetails: "permissions-getPermissions",
        });

        knex = await createKnexInstance(dbname);

        const result = await knex('permissions')
            .where({ 'status': '0' });

        if (result && result.length > 0) {
            logger.info("Permissions list retrieved successfully", {
                username: user_name,
                reqdetails: "permissions-getPermissions",
            });
            return res.status(200).json({
                message: "Permissions list retrieved successfully",
                data: result,
                status: true,
            });
        } else {
            logger.warn("No Permissions list found", {
                username: user_name,
                reqdetails: "permissions-getPermissions",
            });
            return res.status(400).json({
                message: "No Permissions list found",
                status: false,
                data: [],
            });
        }
    } catch (err) {
        logger.error("Error fetching Permissions list", {
            error: err.message,
            stack: err.stack,
            username: req.user?.user_name,
            reqdetails: "permissions-getPermissions",
        });
        next(err);
    } finally {
        if (knex) {
            await knex.destroy();
        }
    }
};

export const addPermissions = async (req, res, next) => {
    let knex = null;
    try {
        const { per_name, description } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Add Permission Request Received", {
            username: user_name,
            reqdetails: "permissions-addPermissions",
        });

        if (!per_name) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "permissions-addPermissions",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('permissions')
            .where({ permission: per_name })
            .first();

        if (exists) {
            logger.warn("Duplicate Entry detected", {
                username: user_name,
                reqdetails: "permissions-addPermissions",
            });
            return res.status(400).json({
                message: "Duplicate Entry detected",
                status: false,
            });
        }

        const insertResult = await knex('permissions')
            .insert({
                permission: per_name,
                description
            });

        if (insertResult) {
            logger.info("Permission inserted successfully", {
                username: user_name,
                reqdetails: "permissions-addPermissions",
            });
            return res.status(200).json({
                message: "Permission inserted successfully",
                status: true,
            });
        } else {
            logger.error("Failed to insert Permission", {
                username: user_name,
                reqdetails: "permissions-addPermissions",
            });
            return res.status(500).json({
                message: "Failed to insert Permission",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error inserting Permission:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const editPermissions = async (req, res, next) => {
    let knex = null;
    try {
        const { id, per_name, description } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Edit Permission Request Received", {
            username: user_name,
            reqdetails: "permissions-editPermissions",
        });

        if (!id || !per_name) {
            logger.error("Mandatory fields are missing for Edit Permission", {
                username: user_name,
                reqdetails: "permissions-editPermissions",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('permissions')
            .where({ id: id, status: "0" })
            .first();

        if (!exists) {
            logger.warn("No Data Found!", {
                username: user_name,
                reqdetails: "permissions-editPermissions",
            });
            return res.status(400).json({
                message: "No Data Found!",
                status: false,
            });
        }

        const updateResult = await knex("permissions")
            .update({
                permission: per_name,
                description
            })
            .where({ id });

        if (updateResult) {
            logger.info("Permission updated successfully", {
                username: user_name,
                reqdetails: "permissions-editPermissions",
            });
            return res.status(200).json({
                message: "Permission updated successfully",
                status: true,
            });
        } else {
            logger.error("Permission not found or update failed", {
                username: user_name,
                reqdetails: "permissions-editPermissions",
            });
            return res.status(400).json({
                message: "Permission not found or update failed",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error updating Permission:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const deletePermissions = async (req, res, next) => {
    let knex = null;
    try {
        const { id } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Delete Permission Request Received", {
            username: user_name,
            reqdetails: "permissions-deletePermissions",
        });

        if (!id) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "permissions-deletePermissions",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const record = await knex("permissions")
            .select("*")
            .where({ id })
            .first();

        if (!record) {
            logger.error("Record not found", {
                username: user_name,
                reqdetails: "permissions-deletePermissions",
            });
            return res.status(400).json({
                message: "Record not found",
                status: false,
            });
        }

        const deleteRes = await knex("permissions")
            .update({ status: "1" })
            .where({ id: id });

        if (deleteRes) {
            logger.info("Permission deleted successfully", {
                username: user_name,
                reqdetails: "permissions-deletePermissions",
            });
            return res.status(200).json({
                message: "Permission deleted successfully",
                status: true,
            });
        } else {
            logger.error("Permission not found or delete failed", {
                username: user_name,
                reqdetails: "permissions-deletePermissions",
            });
            return res.status(400).json({
                message: "Permission not found or delete failed",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error deleting Permission:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const getRolePermissions = async (req, res, next) => {
    let knex = null;
    try {
        const { dbname, user_name } = req.user;

        logger.info("Get Role Permissions Request Received", {
            username: user_name,
            reqdetails: "permissions-getRolePermissions",
        });

        knex = await createKnexInstance(dbname);

        const result = await knex("role_permissions")
            .leftJoin("roles", "role_permissions.role_id", "roles.id")
            .leftJoin("permissions", "role_permissions.permission_id", "permissions.id")
            .select(
                "role_permissions.id",
                "role_permissions.role_id",
                "roles.name as role_name",
                "role_permissions.permission_id",
                "permissions.permission as permission_name"
            )
            .where({ "role_permissions.status": "0" });

        const grouped = result.reduce((acc, row) => {
            if (!acc[row.role_id]) {
                acc[row.role_id] = {
                    role_id: row.role_id,
                    role_name: row.role_name,
                    permissions: []
                };
            }

            acc[row.role_id].permissions.push({
                id: row.id,
                permission_id: row.permission_id,
                permission_name: row.permission_name
            });

            return acc;
        }, {});

        if (result.length > 0) {
            logger.info("Role-Permission fetched successfully", {
                username: user_name,
                reqdetails: "permissions-getRolePermissions",
            });
            return res.status(200).json({
                message: "Role-Permission fetched successfully",
                status: true,
                data: grouped
            });
        } else {
            logger.info("No Role-Permission fetched", {
                username: user_name,
                reqdetails: "permissions-getRolePermissions",
            });
            return res.status(400).json({
                message: "No Role-Permission fetched",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error fetching Role-Permission:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const setRolePermissions = async (req, res, next) => {
    let knex = null;
    try {
        const { role, permissionIds } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Set Role Permissions Request Received", {
            username: user_name,
            reqdetails: "permissions-setRolePermissions",
        });

        if (!role || !permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "permissions-setRolePermissions",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const existing = await knex("role_permissions")
            .where({ role_id: role, status: "0" })
            .whereIn("permission_id", permissionIds)
            .pluck("permission_id");

        const newPermissions = permissionIds.filter(id => !existing.includes(id));

        if (newPermissions.length > 0) {
            const data = newPermissions.map(id => ({
                role_id: role,
                permission_id: id
            }));

            await knex("role_permissions").insert(data);

            logger.info("Role-Permission assigned successfully", {
                username: user_name,
                reqdetails: "permissions-setRolePermissions",
            });
            return res.status(200).json({
                message: "Role-Permission assigned successfully",
                status: true,
            });
        } else {
            logger.info("No Role-Permission assigned", {
                username: user_name,
                reqdetails: "permissions-setRolePermissions",
            });
            return res.status(400).json({
                message: "No Role-Permission assigned",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error assigning Role-Permission:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const deleteRolePermissions = async (req, res, next) => {
    let knex = null;
    try {
        const { id } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Delete Role Permissions Request Received", {
            username: user_name,
            reqdetails: "permissions-deleteRolePermissions",
        });

        if (!id) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "permissions-deleteRolePermissions",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const existing = await knex("role_permissions")
            .where({ "id": id, "status": "0" })
            .first();

        if (!existing) {
            logger.warn("No Record Found", {
                username: user_name,
                reqdetails: "permissions-deleteRolePermissions",
            });
            return res.status(400).json({
                message: "No Record Found",
                status: false,
            });
        }

        const deleteRes = await knex("role_permissions")
            .update({ status: "1" })
            .where({ id: id });

        if (deleteRes) {
            logger.info("Role-Permission deleted successfully", {
                username: user_name,
                reqdetails: "permissions-deleteRolePermissions",
            });
            return res.status(200).json({
                message: "Role-Permission deleted successfully",
                status: true,
            });
        } else {
            logger.info("No Role-Permission deleted", {
                username: user_name,
                reqdetails: "permissions-deleteRolePermissions",
            });
            return res.status(400).json({
                message: "No Role-Permission deleted",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error deleteing Role-Permission:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};