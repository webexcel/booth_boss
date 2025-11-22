import express from "express";
import { login, getRegisteredToken } from "../../controller/authentication/auth.controller.js";

const authRoutes = express.Router();

authRoutes.post("/login", login);

authRoutes.post("/getToken", getRegisteredToken);

export default authRoutes;
