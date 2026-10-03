import { Router } from "express";
import { registerUser, login, logoutUser, refreshAccessToken, getCurrentUser, changeCurrentPassword, } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator, userLoginValidator, userChangeCurrentPasswordValidator } from "../validators/index.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

//& UnSecure Route
router.route("/register").post(registerUser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/refresh-token").post(refreshAccessToken);


//& Secure Route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);


export default router;
