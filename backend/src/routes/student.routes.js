import {Router} from "express";
import {healthcheck} from "../controllers/student.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyStudent } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/healthcheck").get(verifyJWT, verifyStudent, healthcheck);


export default router;