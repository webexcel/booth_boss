import responseCode from "../../../constants/responseCode.js";
import createKnexInstance from "../../..//configs/db.js";
import { generateAccessToken } from "../../middleware/auth.middleware.js";
import { logger } from '../../../configs/winston.js'

export const login = async (req, res, next) => {
  let knex = null;
  try {
    const { user_name, password } = req.body;

    logger.info("User is trying to Login", {
      username: user_name,
      reqdetails: "login"
    });

    if (!user_name || !password) {
      return res.status(400);
    }

    knex = await createKnexInstance("admin_webexcel");

    const loginData = await knex("employee")
      .select("emp_id", "emp_name", "admin")
      .where({
        email: user_name,
        Password: password,
      });

    if (loginData.length > 0) {
      logger.info(" Found user details in the Database", {
        username: user_name,
        reqdetails: "login"
      });

      const { emp_name, emp_id, admin } = loginData[0];
      const user = { "dbname": "admin_webexcel", "user_name": emp_name };
      const userdata = { emp_name, emp_id, admin };

      const token = generateAccessToken(user);

      logger.info(" Logged in Successfully", {
        username: user_name,
        reqdetails: "login"
      });
      return res.status(responseCode.SUCCESS).json({
        status: true,
        message: "Login Successfully",
        token: token,
        userdata
      });
    } else {
      logger.info("Login Failed due to incorrect credentials", {
        username: user_name,
        reqdetails: "login"
      });
      return res.status(responseCode.FAILURE.DATA_NOT_FOUND).json({
        status: false,
        message: "Incorrect username or password",
      });
    }
  } catch (error) {
    next(error);
  } finally {
    if (knex) {
      await knex.destroy();
    }
  }
}