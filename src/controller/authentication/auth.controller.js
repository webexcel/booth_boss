import responseCode from "../../../constants/responseCode.js";
import createKnexInstance from "../../..//configs/db.js";
import { generateAccessToken } from "../../middleware/auth.middleware.js";
import { logger } from "../../../configs/winston.js";
import message from "../../../constants/messages.js";
import errorStatus from "../../../constants/responseCode.js";
import bcrypt from 'bcrypt';

export const login = async (req, res, next) => {
  let knex = null;
  try {
    const { email, password } = req.body;

    logger.info("User is trying to Login", {
      username: email,
      reqdetails: "login",
    });

    if (!email || !password) {
      return res.status(errorStatus?.FAILURE?.BAD_REQUEST).json({
        status: false,
        message: message?.MANDATORY_ERROR,
      });
    }

    knex = await createKnexInstance("election");

    const user = await knex("users")
      .select("id as employee_id", "full_name as name", "email", "phone", "password_hash")
      .where({ email, "is_active": "1" })
      .first();

    if (!user) {
      logger.info("Login Failed: Invalid Username", { username: email, reqdetails: "login" });
      return res.status(responseCode.FAILURE.DATA_NOT_FOUND).json({
        status: false,
        message: "Invalid Username",
      });
    }

    const { employee_id, name, email: userEmail, password_hash: storedPassword } = user;

    let isMatch = false;
    let needsUpdate = false;

    if (storedPassword.startsWith("$2b$")) {
      // If password is already hashed, compare using bcrypt
      isMatch = await bcrypt.compare(password, storedPassword);
    } else {
      // If password is in plain text, compare directly
      isMatch = password === storedPassword;
      needsUpdate = isMatch;
    }

    if (!isMatch) {
      logger.info("Login Failed: Incorrect Password", { username: email, reqdetails: "login" });
      return res.status(responseCode.FAILURE.DATA_NOT_FOUND).json({
        status: false,
        message: "Incorrect Password",
      });
    }

    logger.info("Logged in Successfully", { username: email, reqdetails: "login" });

    // 🔹 If password was plain text, hash and update it after successful login
    if (needsUpdate) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await knex("election").where({ email }).update({ password_hash: hashedPassword });
      logger.info("Password updated to bcrypt hash for better security", { username: email });
    }

    const token = generateAccessToken({ employee_id, email: userEmail, name, user_name: name, dbname: "election" });

    await knex("users").update({ "token": token }).where("email", email);

    return res.status(responseCode.SUCCESS).json({
      status: true,
      message: "Logged-in Successfully",
      token,
      userdata: { employee_id, email: userEmail, name },
    });
  } catch (error) {
    next(error);
  } finally {
    if (knex) {
      await knex.destroy();
    }
  }
};

export const getRegisteredToken = async (req, res, next) => {
  let knex = null;
  try {
    const { user_id } = req.body;

    logger.info("User is trying to Login", {
      username: user_id,
      reqdetails: "login",
    });

    if (!user_id) {
      return res.status(errorStatus?.FAILURE?.BAD_REQUEST).json({
        status: false,
        message: "User ID is Mandatory",
      });
    }

    knex = await createKnexInstance("election");

    const tokenRes = await knex("users").select("token").where({ "id": user_id }).first();

    if (tokenRes) {
      return res.status(200).json({
        status: true,
        message: "Token Fetched Successfully",
        token: tokenRes.token,
      });
    } else {
      return res.status(400).json({
        status: true,
        message: "No Token Found",
        token: null
      });
    }
  } catch (error) {
    next(error);
  } finally {
    if (knex) {
      await knex.destroy();
    }
  }
};