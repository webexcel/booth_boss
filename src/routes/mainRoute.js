import express from "express";
import authRoutes from "./authentication/auth.route.js";
import constituenciesRoutes from "./master/constituencies.route.js";
import blocksRoutes from "./master/blocks.route.js";
import boothsRoutes from "./master/booths.route.js";
import partsRoutes from "./master/parts.route.js";
import usersRoutes from "./users/users.route.js";
import permissionsRoutes from "./permissions/permissions.route.js";
import rolesRoutes from "./permissions/roles.route.js";
import votersRoutes from "./votersManagement/voters.route.js";
import taskRoutes from "./tasks/task.route.js";
import surveyTemplateRoutes from "./survey/surveyTemplate.route.js";
import surveysRoutes from "./survey/surveys.route.js";

const mainRoutes = express.Router();

mainRoutes.use("/auth", authRoutes);

// Master Routes

mainRoutes.use("/master/blocks", blocksRoutes);

mainRoutes.use("/master/booths", boothsRoutes);

mainRoutes.use("/master/constituencies", constituenciesRoutes);

mainRoutes.use("/master/parts", partsRoutes);

// Users Routes

mainRoutes.use("/users", usersRoutes);

// Permissions Routes

mainRoutes.use("/permissions", permissionsRoutes);

mainRoutes.use("/roles", rolesRoutes);

// Voters Management Routes

mainRoutes.use("/voters", votersRoutes);

// Task Management Routes

mainRoutes.use("/task", taskRoutes);

// Survey Routes

mainRoutes.use("/surveyTemplate", surveyTemplateRoutes);

mainRoutes.use("/surveys", surveysRoutes);

export default mainRoutes;
