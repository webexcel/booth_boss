import createKnexInstance from "../../../configs/db.js";
import { logger } from "../../../configs/winston.js";
import bcrypt from 'bcrypt';

export const getUsers = async (req, res, next) => {
    let knex = null;
    try {
        const { dbname, user_name } = req.user;

        logger.info("Users list Request Received", {
            username: user_name,
            reqdetails: "users-getUsers",
        });

        knex = await createKnexInstance(dbname);

        const result = await knex('users')
            .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
            .leftJoin('roles', 'user_roles.role_id', 'roles.id')
            .select('users.id', "users.email", "users.full_name", "users.phone", "user_roles.role_id", "roles.name")
            .where({ 'users.is_active': '1' });

        if (result && result.length > 0) {
            logger.info("Users list retrieved successfully", {
                username: user_name,
                reqdetails: "users-getUsers",
            });
            return res.status(200).json({
                message: "Users list retrieved successfully",
                data: result,
                status: true,
            });
        } else {
            logger.warn("No Users list found", {
                username: user_name,
                reqdetails: "users-getUsers",
            });
            return res.status(400).json({
                message: "No Users list found",
                status: false,
            });
        }
    } catch (err) {
        logger.error("Error fetching Users list", {
            error: err.message,
            stack: err.stack,
            username: req.user?.user_name,
            reqdetails: "users-getUsers",
        });
        next(err);
    } finally {
        if (knex) {
            await knex.destroy();
        }
    }
};

export const addUsers = async (req, res, next) => {
    let knex = null;
    try {
        const { email, password, full_name, phone } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Add User Request Received", {
            username: user_name,
            reqdetails: "users-addUsers",
        });

        if (!email || !password || !full_name || !phone) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "users-addUsers",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('users')
            .select('*')
            .where({ email: email, is_active: "1" })
            .first();

        if (exists) {
            logger.warn("Duplicate Entry detected", {
                username: user_name,
                reqdetails: "users-addUsers",
            });
            return res.status(0).json({
                message: "Duplicate Entry detected",
                status: false,
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const insertResult = await knex('users')
            .insert({
                email: email,
                password_hash: hashedPassword,
                full_name: full_name,
                phone: phone,
            });

        if (insertResult) {
            logger.info("User inserted successfully", {
                username: user_name,
                reqdetails: "users-addUsers",
            });
            return res.status(200).json({
                message: "User inserted successfully",
                status: true,
            });
        } else {
            logger.error("Failed to insert User", {
                username: user_name,
                reqdetails: "users-addUsers",
            });
            return res.status(500).json({
                message: "Failed to insert User",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error inserting User:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const editUsers = async (req, res, next) => {
    let knex = null;
    try {
        const { id, email, full_name, phone } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Edit User Request Received", {
            username: user_name,
            reqdetails: "users-editUsers",
        });

        if (!id || !email || !full_name || !phone) {
            logger.error("Mandatory fields are missing for Edit User", {
                username: user_name,
                reqdetails: "users-editUsers",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('users')
            .select('*')
            .where({ id: id, is_active: "1" })
            .first();

        if (!exists) {
            logger.warn("No Data Found!", {
                username: user_name,
                reqdetails: "users-editUsers",
            });
            return res.status(400).json({
                message: "No Data Found!",
                status: false,
            });
        }

        const updateResult = await knex("users")
            .update({
                email: email,
                full_name: full_name,
                phone: phone,
            })
            .where({ id });

        if (updateResult) {
            logger.info("User updated successfully", {
                username: user_name,
                reqdetails: "users-editUsers",
            });
            return res.status(200).json({
                message: "User updated successfully",
                status: true,
            });
        } else {
            logger.error("User not found or update failed", {
                username: user_name,
                reqdetails: "users-editUsers",
            });
            return res.status(400).json({
                message: "User not found or update failed",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error updating User:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const deleteUsers = async (req, res, next) => {
    let knex = null;
    try {
        const { id } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Delete User Request Received", {
            username: user_name,
            reqdetails: "users-deleteUsers",
        });

        if (!id) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "users-deleteUsers",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const record = await knex("users")
            .select("*")
            .where({ id, is_active: "1" })
            .first();

        if (!record) {
            logger.error("Record not found", {
                username: user_name,
                reqdetails: "users-deleteUsers",
            });
            return res.status(400).json({
                message: "Record not found",
                status: false,
            });
        }

        const deleteRes = await knex("users")
            .update({ is_active: "0" })
            .where({ id: id });

        if (deleteRes) {
            logger.info("User deleted successfully", {
                username: user_name,
                reqdetails: "users-deleteUsers",
            });
            return res.status(200).json({
                message: "User deleted successfully",
                status: true,
            });
        } else {
            logger.error("User not found or delete failed", {
                username: user_name,
                reqdetails: "users-deleteUsers",
            });
            return res.status(400).json({
                message: "User not found or delete failed",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error deleting User:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const resetPassword = async (req, res, next) => {
    let knex = null;
    try {
        const { id, password } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Update User Password Request Received", {
            username: user_name,
            reqdetails: "users-resetPassword",
        });

        if (!id || !password) {
            logger.error("Mandatory fields are missing for Update User Password", {
                username: user_name,
                reqdetails: "users-resetPassword",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const record = await knex("users")
            .select("*")
            .where({ id, is_active: "1" })
            .first();

        if (!record) {
            logger.error("Record not found", {
                username: user_name,
                reqdetails: "users-deleteUsers",
            });
            return res.status(400).json({
                message: "Record not found",
                status: false,
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const updateResult = await knex("users").update({
            "password_hash": hashedPassword
        }).where({ id: id });

        if (updateResult) {
            logger.info("User Password updated successfully", {
                username: user_name,
                reqdetails: "users-resetPassword",
            });
            return res.status(200).json({
                message: "User Password updated successfully",
                status: true,
            });
        } else {
            logger.error("User Password update failed", {
                username: user_name,
                reqdetails: "users-resetPassword",
            });
            return res.status(400).json({
                message: "User Password update failed",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error updating User Password:", error);
        next(error);
    } finally {
        if (knex) {
            await knex.destroy();
        }
    }
};

export const changePassword = async (req, res, next) => {
    let knex = null;
    try {
        const { id, oldPass, newPass } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Change User Password Request Received", {
            username: user_name,
            reqdetails: "users-changePassword",
        });

        if (!id || !oldPass || !newPass) {
            logger.error("Mandatory fields are missing for Change User Password", {
                username: user_name,
                reqdetails: "users-changePassword",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const empRes = await knex("users").select().where({ id: id, is_active: "1" }).first();

        if (empRes) {
            const isMatch = await bcrypt.compare(oldPass, empRes.password_hash);

            if (isMatch) {
                const isSamePassword = await bcrypt.compare(oldPass, newPass);
                if (isSamePassword) {
                    logger.error("User Old password and new password is same", {
                        username: user_name,
                        reqdetails: "users-changePassword",
                    });
                    return res.status(400).json({
                        message: "User Old password and new password is same",
                        status: false,
                    });
                }
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(newPass, saltRounds);

                const updateResult = await knex("users").update({ "password_hash": hashedPassword }).where({ id: id });

                if (updateResult) {
                    logger.info("User Password changed successfully", {
                        username: user_name,
                        reqdetails: "users-changePassword",
                    });
                    return res.status(200).json({
                        message: "User Password changed successfully",
                        status: true,
                    });
                } else {
                    logger.error("User password change failed", {
                        username: user_name,
                        reqdetails: "users-changePassword",
                    });
                    return res.status(400).json({
                        message: "User password change failed",
                        status: false,
                    });
                }
            } else {
                logger.error("User Password Not Matched", {
                    username: user_name,
                    reqdetails: "users-changePassword",
                });
                return res.status(400).json({
                    message: "User Password Not Matched",
                    status: false,
                });
            }
        } else {
            logger.error("User Not Found", {
                username: user_name,
                reqdetails: "users-changePassword",
            });
            return res.status(400).json({
                message: "User Not Found",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error while changing User Password:", error);
        next(error);
    } finally {
        if (knex) {
            await knex.destroy();
        }
    }
};