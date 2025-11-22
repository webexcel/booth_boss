import createKnexInstance from "../../../configs/db.js";
import { logger } from "../../../configs/winston.js";

export const getTasks = async (req, res, next) => {
    let knex = null;
    try {
        const { dbname, user_name } = req.user;

        logger.info("Tasks list Request Received", {
            username: user_name,
            reqdetails: "task-getTasks",
        });

        knex = await createKnexInstance(dbname);

        const result = await knex('tasks')
            .leftJoin('task_assignments', 'tasks.id', 'task_assignments.task_id')
            .leftJoin('users', 'task_assignments.assignee_id', 'users.id')
            .select(
                'tasks.id',
                'tasks.title',
                'tasks.description',
                'tasks.priority',
                'tasks.due_at',
                'task_assignments.assignee_id',
                'users.full_name'
            )
            .where({ 'users.is_active': '1' })
            .whereNot({ 'tasks.status': 'deleted' });

        const grouped = result.reduce((acc, row) => {
            if (!acc[row.id]) {
                acc[row.id] = {
                    id: row.id,
                    title: row.title,
                    description: row.description,
                    priority: row.priority,
                    due_date: row.due_date,
                    assignees: []
                };
            }

            if (row.assignee_id) {
                acc[row.id].assignees.push({
                    assignee_id: row.assignee_id,
                    full_name: row.full_name
                });
            }

            return acc;
        }, {});

        const finalResponse = Object.values(grouped);

        if (result && result.length > 0) {
            logger.info("Tasks list retrieved successfully", {
                username: user_name,
                reqdetails: "task-getTasks",
            });
            return res.status(200).json({
                message: "Tasks list retrieved successfully",
                data: finalResponse,
                status: true,
            });
        } else {
            logger.warn("No Tasks list found", {
                username: user_name,
                reqdetails: "task-getTasks",
            });
            return res.status(400).json({
                message: "No Tasks list found",
                status: false,
                data: [],
            });
        }
    } catch (err) {
        logger.error("Error fetching Tasks list", {
            error: err.message,
            stack: err.stack,
            username: req.user?.user_name,
            reqdetails: "task-getTasks",
        });
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const addTask = async (req, res, next) => {
    let knex = null;
    try {
        const { title, description, priority, due_date } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Add Tasks Request Received", {
            username: user_name,
            reqdetails: "task-addTask",
        });

        if (!title || !priority || !due_date) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "task-addTask",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('tasks')
            .select("*")
            .where({ title })
            .whereNot({ "status": "deleted" })
            .first();

        if (exists) {
            logger.warn("Duplicate Entry detected", {
                username: user_name,
                reqdetails: "task-addTask",
            });
            return res.status(400).json({
                message: "Duplicate Entry detected",
                status: false,
            });
        }

        const insertResult = await knex('tasks')
            .insert({
                title, description, priority, due_at: due_date
            });

        if (insertResult) {
            logger.info("Tasks inserted successfully", {
                username: user_name,
                reqdetails: "task-addTask",
            });
            return res.status(200).json({
                message: "Tasks inserted successfully",
                status: true,
            });
        } else {
            logger.error("Failed to insert Tasks", {
                username: user_name,
                reqdetails: "task-addTask",
            });
            return res.status(500).json({
                message: "Failed to insert Tasks",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error inserting Tasks:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const editTask = async (req, res, next) => {
    let knex = null;
    try {
        const { id, title, description, priority, due_date } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Edit Tasks Request Received", {
            username: user_name,
            reqdetails: "task-editTask",
        });

        if (!id || !title || !priority || !due_date) {
            logger.error("Mandatory fields are missing for Edit Tasks", {
                username: user_name,
                reqdetails: "task-editTask",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('tasks')
            .where({ id: id })
            .whereNot({ "status": "deleted" })
            .first();

        if (!exists) {
            logger.warn("No Data Found!", {
                username: user_name,
                reqdetails: "task-editTask",
            });
            return res.status(400).json({
                message: "No Data Found!",
                status: false,
            });
        }

        const updateResult = await knex("tasks")
            .update({
                title, description, priority, due_at: due_date
            })
            .where({ id });

        if (updateResult) {
            logger.info("Tasks updated successfully", {
                username: user_name,
                reqdetails: "task-editTask",
            });
            return res.status(200).json({
                message: "Tasks updated successfully",
                status: true,
            });
        } else {
            logger.error("Tasks not found or update failed", {
                username: user_name,
                reqdetails: "task-editTask",
            });
            return res.status(400).json({
                message: "Tasks not found or update failed",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error updating Tasks:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const deleteTask = async (req, res, next) => {
    let knex = null;
    try {
        const { id } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Delete Tasks Request Received", {
            username: user_name,
            reqdetails: "task-deleteTask",
        });

        if (!id) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "task-deleteTask",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const record = await knex("tasks")
            .select("*")
            .where({ id })
            .first();

        if (!record) {
            logger.error("Record not found", {
                username: user_name,
                reqdetails: "task-deleteTask",
            });
            return res.status(400).json({
                message: "Record not found",
                status: false,
            });
        }

        const deleteRes = await knex("tasks")
            .update({ status: "deleted" })
            .where({ id: id });

        await knex("task_assignments")
            .update({ status: "deleted" })
            .where({ task_id: id });

        if (deleteRes) {
            logger.info("Tasks deleted successfully", {
                username: user_name,
                reqdetails: "task-deleteTask",
            });
            return res.status(200).json({
                message: "Tasks deleted successfully",
                status: true,
            });
        } else {
            logger.error("Tasks not found or delete failed", {
                username: user_name,
                reqdetails: "task-deleteTask",
            });
            return res.status(400).json({
                message: "Tasks not found or delete failed",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error deleting Tasks:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const assignTask = async (req, res, next) => {
    let knex = null;
    try {
        const { task_id, assign_ids } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Add Tasks Request Received", {
            username: user_name,
            reqdetails: "task-assignTask",
        });

        if (!task_id || !assign_ids || !Array.isArray(assign_ids) || assign_ids.length === 0) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "task-assignTask",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('tasks')
            .select("*")
            .where({ id: task_id })
            .whereNot({ "status": "deleted" })
            .first();

        if (!exists) {
            logger.warn("No Record Found", {
                username: user_name,
                reqdetails: "task-assignTask",
            });
            return res.status(400).json({
                message: "No Record Found",
                status: false,
            });
        }

        const existingAssignees = await knex("task_assignments")
            .where({ task_id })
            .whereNot({ status: "deleted" })
            .pluck("assignee_id");

        const newAssignees = assign_ids.filter(id => !existingAssignees.includes(id));

        if (newAssignees.length > 0) {
            const insertData = newAssignees.map(id => ({
                task_id: task_id,
                assignee_id: id
            }));

            await knex("task_assignments").insert(insertData);
        }

        logger.info("Tasks Assigned successfully", {
            username: user_name,
            reqdetails: "task-assignTask",
        });
        return res.status(200).json({
            message: "Tasks Assigned successfully",
            status: true,
        });
    } catch (error) {
        console.error("Error Assigning Tasks:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const updateTaskStatus = async (req, res, next) => {
    let knex = null;
    try {
        const { id, status } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Update Task status Request Received", {
            username: user_name,
            reqdetails: "task-updateTaskStatus",
        });

        if (!id || !status) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "task-updateTaskStatus",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const record = await knex("tasks")
            .select("*")
            .where({ id })
            .whereNot("status", "deleted")
            .first();

        if (!record) {
            logger.error("Record not found", {
                username: user_name,
                reqdetails: "task-updateTaskStatus",
            });
            return res.status(400).json({
                message: "Record not found",
                status: false,
            });
        }

        const updateRes = await knex("tasks")
            .update({ status })
            .where({ id: id });

        await knex("task_assignments")
            .update({ status })
            .where({ task_id: id });

        if (updateRes) {
            logger.info("Tasks Status updated successfully", {
                username: user_name,
                reqdetails: "task-updateTaskStatus",
            });
            return res.status(200).json({
                message: "Tasks Status updated successfully",
                status: true,
            });
        } else {
            logger.error("Tasks Status updating failed", {
                username: user_name,
                reqdetails: "task-updateTaskStatus",
            });
            return res.status(400).json({
                message: "Tasks Status updating failed",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error updating Tasks Status:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};