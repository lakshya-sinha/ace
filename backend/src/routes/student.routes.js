import { Router } from "express";
import { healthcheck } from "../controllers/student.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyStudent, verifyCourse } from "../middlewares/auth.middleware.js";
import { getVideo } from '../controllers/student.controller.js'

const router = Router();


router
  .route('/video/:course/:category/:group')
  .get(verifyJWT, verifyStudent, verifyCourse, getVideo)


router.route("/healthcheck").get(verifyJWT, verifyStudent, healthcheck);


export default router;
