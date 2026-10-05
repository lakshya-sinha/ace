import {Router} from "express";
import {verifyJWT, verifyAdmin} from '../middlewares/auth.middleware.js';
import {registerStudent, createCourse, getAllCourses, updateCourse, getAllStudents, getStudentDetails, updateStudent, assignCourseToStudent, addStudentInstallment, } from '../controllers/admin.controller.js';
import {uploadImg} from '../middlewares/upload.middleware.js';

const router = Router();


router.route("/registerStudent").post(verifyJWT, verifyAdmin, uploadImg.fields([
    { name: "avatar", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  registerStudent,
)

router.route("/courses").post(verifyJWT, verifyAdmin, createCourse);
router.route("/courses").get(verifyJWT, verifyAdmin, getAllCourses);
router.route("/courses/:id").patch(verifyJWT, verifyAdmin, updateCourse);


router.get("/students", verifyJWT, verifyAdmin, getAllStudents);
router.get("/students/:id", verifyJWT, verifyAdmin, getStudentDetails);
router.patch("/students/:id", verifyJWT, verifyAdmin, uploadImg.fields([{ name: "avatar", maxCount: 1 }, { name: "signature", maxCount: 1 }]), updateStudent);

router.post("/students/:id/enrollments", verifyJWT, verifyAdmin, assignCourseToStudent);
router.post("/students/:id/enrollments/:enrollmentId/installments", verifyJWT, verifyAdmin, addStudentInstallment);

export default router;
