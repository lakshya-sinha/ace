import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
import { Course } from "../models/course.models.js";
import { Enrollment } from "../models/enrollment.models.js";
import mongoose from "mongoose";

const registerStudent = asyncHandler(async (req, res) => {
  console.log("someone access this route");
  const {
    email, username, password, fullName, contactNo,
    isEnglishTyping, isHindiTyping, dob, mothersName, fathersName, gender,
    courseId,
  } = req.body;

  // multipart/form-data sends everything as strings, so convert
  const discountPercent = Number(req.body.discountPercent ?? 0);

  // 1. Validate
  if (!email || !username || !password) {
    throw new ApiError(400, "email, username and password are required");
  }
  if (Number.isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    throw new ApiError(400, "discountPercent must be between 0 and 100");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists.");
  }

  // 2. Check the course BEFORE creating the user
  let course = null;
  if (courseId) {
    course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      throw new ApiError(404, "Course not found or inactive");
    }
  }

  // 3. Uploaded files
  const avatarFile = req.files?.avatar?.[0];
  const signatureFile = req.files?.signature?.[0];
  const avatar = avatarFile
    ? { url: `students/images/${avatarFile.filename}`, localPath: avatarFile.path }
    : undefined;
  const signature = signatureFile
    ? { url: `students/signature/${signatureFile.filename}`, localPath: signatureFile.path }
    : undefined;

  // 4. Create the user (no fee fields here anymore)
  const user = await User.create({
    email,
    username,
    password,
    fullName,
    type: "student",           // forced, never taken from req.body
    isEmailVerified: true,
    contactNo,
    isEnglishTyping,
    isHindiTyping,
    dob,
    mothersName,
    fathersName,
    gender,
    ...(avatar && { avatar }),
    ...(signature && { signature }),
  });

  // 5. Create the enrollment (course + discount) in its own collection
  let enrollment = null;
  if (course) {
    try {
      enrollment = await Enrollment.create({
        student: user._id,
        course: course._id,
        discountPercent,
      });
      await enrollment.populate("course", "title price");
    } catch (err) {
      await User.findByIdAndDelete(user._id); // don't leave a student without the course they were given
      throw new ApiError(500, "Could not assign the course, registration rolled back");
    }
  }

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: createdUser,
        enrollment: enrollment && {
          enrollmentId: enrollment._id,
          courseTitle: enrollment.course.title,
          coursePrice: enrollment.course.price,
          discountPercent: enrollment.discountPercent,
          finalFee: enrollment.finalFee,
          due: enrollment.due,
          feeStatus: enrollment.feeStatus,
        },
      },
      "Student registered successfully"
    )
  );
});

// "English Typing Basic" -> "english-typing-basic"
const makeSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createCourse = asyncHandler(async (req, res) => {
  const { title, description, language, durationInMonths } = req.body;
  const price = Number(req.body.price);

  if (!title || req.body.price === undefined) {
    throw new ApiError(400, "title and price are required");
  }
  if (Number.isNaN(price) || price < 0) {
    throw new ApiError(400, "price must be a valid number, 0 or more");
  }
  if (language && !["english", "hindi", "both"].includes(language)) {
    throw new ApiError(400, "language must be english, hindi or both");
  }

  const slug = makeSlug(req.body.slug || title);
  if (!slug) throw new ApiError(400, "Could not generate a valid slug");

  const exists = await Course.findOne({ slug });
  if (exists) {
    throw new ApiError(409, "A course with this slug already exists");
  }

  const course = await Course.create({
    title,
    slug,
    description,
    language,
    durationInMonths: durationInMonths ? Number(durationInMonths) : undefined,
    price,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, course, "Course created successfully"));
});

const getAllCourses = asyncHandler(async (req, res) => {
  const filter = req.query.active === "true" ? { isActive: true } : {};
  const courses = await Course.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, courses, "Courses fetched"));
});

const updateCourse = asyncHandler(async (req, res) => {
  const { title, description, language, durationInMonths, price, isActive } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (language !== undefined) updates.language = language;
  if (durationInMonths !== undefined) updates.durationInMonths = Number(durationInMonths);
  if (price !== undefined) updates.price = Number(price);
  if (isActive !== undefined) updates.isActive = isActive === true || isActive === "true";

  const course = await Course.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!course) throw new ApiError(404, "Course not found");

  return res.status(200).json(new ApiResponse(200, course, "Course updated"));
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidId = (id, label = "id") => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, `Invalid ${label}`);
};

const SAFE_USER_FIELDS =
  "-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry";

// Turns a list of enrollments into the fee summary the frontend needs
const buildFeeSummary = (enrollments) => {
  const active = enrollments.filter((e) => e.status !== "cancelled");
  return {
    courses: enrollments.map((e) => ({
      enrollmentId: e._id,
      course: e.course,
      status: e.status,
      enrolledOn: e.enrolledOn,
      discountPercent: e.discountPercent,
      finalFee: e.finalFee,
      totalPaid: e.totalPaid,
      due: e.due,
      feeStatus: e.feeStatus,
      installments: e.installments,
    })),
    totalFee: active.reduce((s, e) => s + e.finalFee, 0),
    totalPaid: active.reduce((s, e) => s + e.totalPaid, 0),
    totalDue: active.reduce((s, e) => s + e.due, 0),
  };
};

// 1. VIEW ALL STUDENTS  (?page=1&limit=20&search=rahul&courseId=...)
const getAllStudents = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const { search, courseId } = req.query;

  const filter = { type: "student" };

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { username: regex },
      { email: regex },
      { fullName: regex },
      { contactNo: regex },
    ];
  }

  if (courseId) {
    assertValidId(courseId, "courseId");
    const studentIds = await Enrollment.find({
      course: courseId,
      status: { $ne: "cancelled" },
    }).distinct("student");
    filter._id = { $in: studentIds };
  }

  const [students, total] = await Promise.all([
    User.find(filter)
      .select(SAFE_USER_FIELDS)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  // One query for all enrollments on this page (avoids a query per student)
  const enrollments = await Enrollment.find({
    student: { $in: students.map((s) => s._id) },
  }).populate("course", "title price");

  const byStudent = {};
  for (const e of enrollments) {
    (byStudent[e.student.toString()] ||= []).push(e);
  }

  const data = students.map((s) => {
    const fees = buildFeeSummary(byStudent[s._id.toString()] || []);
    return {
      ...s.toJSON(),
      courses: fees.courses.map((c) => c.course?.title),
      totalFee: fees.totalFee,
      totalPaid: fees.totalPaid,
      totalDue: fees.totalDue,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { students: data, page, limit, total, totalPages: Math.ceil(total / limit) },
      "Students fetched"
    )
  );
});

// 2. VIEW ONE STUDENT (full details + enrollments + installments)
const getStudentDetails = asyncHandler(async (req, res) => {
  assertValidId(req.params.id, "student id");

  const student = await User.findOne({ _id: req.params.id, type: "student" }).select(SAFE_USER_FIELDS);
  if (!student) throw new ApiError(404, "Student not found");

  const enrollments = await Enrollment.find({ student: student._id })
    .populate("course", "title price language durationInMonths")
    .populate("installments.receivedBy", "fullName username");

  return res.status(200).json(
    new ApiResponse(
      200,
      { ...student.toJSON(), enrollments: undefined, fees: buildFeeSummary(enrollments) },
      "Student details fetched"
    )
  );
});

// 3. UPDATE STUDENT (profile only, never fees/password/type)
const updateStudent = asyncHandler(async (req, res) => {
  assertValidId(req.params.id, "student id");

  const student = await User.findOne({ _id: req.params.id, type: "student" });
  if (!student) throw new ApiError(404, "Student not found");

  const allowed = [
    "fullName", "email", "username", "contactNo", "gender", "dob",
    "fathersName", "mothersName", "isEnglishTyping", "isHindiTyping",
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  // Duplicate check for email / username
  const orConditions = [];
  if (updates.email) orConditions.push({ email: updates.email.toLowerCase().trim() });
  if (updates.username) orConditions.push({ username: updates.username.toLowerCase().trim() });
  if (orConditions.length) {
    const clash = await User.findOne({ _id: { $ne: student._id }, $or: orConditions });
    if (clash) throw new ApiError(409, "Email or username already in use");
  }

  // Optional new images
  const avatarFile = req.files?.avatar?.[0];
  const signatureFile = req.files?.signature?.[0];
  if (avatarFile) {
    updates.avatar = { url: `students/images/${avatarFile.filename}`, localPath: avatarFile.path };
  }
  if (signatureFile) {
    updates.signature = { url: `students/signature/${signatureFile.filename}`, localPath: signatureFile.path };
  }

  student.set(updates);
  await student.save(); // runs schema validation (gender enum, dob cast, etc.)

  const updated = await User.findById(student._id).select(SAFE_USER_FIELDS);
  return res.status(200).json(new ApiResponse(200, updated, "Student updated"));
});

// 4. ASSIGN ANOTHER COURSE TO A STUDENT
const assignCourseToStudent = asyncHandler(async (req, res) => {
  assertValidId(req.params.id, "student id");
  const { courseId } = req.body;
  const discountPercent = Number(req.body.discountPercent ?? 0);

  if (!courseId) throw new ApiError(400, "courseId is required");
  assertValidId(courseId, "courseId");
  if (Number.isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    throw new ApiError(400, "discountPercent must be between 0 and 100");
  }

  const [student, course] = await Promise.all([
    User.findOne({ _id: req.params.id, type: "student" }),
    Course.findById(courseId),
  ]);
  if (!student) throw new ApiError(404, "Student not found");
  if (!course || !course.isActive) throw new ApiError(404, "Course not found or inactive");

  let enrollment = await Enrollment.findOne({ student: student._id, course: course._id });

  if (enrollment) {
    if (enrollment.status !== "cancelled") {
      throw new ApiError(409, "Student is already enrolled in this course");
    }
    // Re-enroll: reactivate the cancelled one (old payments stay on record)
    enrollment.status = "active";
    enrollment.discountPercent = discountPercent;
    enrollment.enrolledOn = new Date();
    await enrollment.save();
  } else {
    enrollment = await Enrollment.create({
      student: student._id,
      course: course._id,
      discountPercent,
    });
  }

  await enrollment.populate("course", "title price");

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        enrollmentId: enrollment._id,
        courseTitle: enrollment.course.title,
        coursePrice: enrollment.course.price,
        discountPercent: enrollment.discountPercent,
        finalFee: enrollment.finalFee,
        due: enrollment.due,
        feeStatus: enrollment.feeStatus,
      },
      "Course assigned to student"
    )
  );
});

// 5. RECORD A STUDENT INSTALLMENT (for one enrollment)
const addStudentInstallment = asyncHandler(async (req, res) => {
  const { id, enrollmentId } = req.params;
  assertValidId(id, "student id");
  assertValidId(enrollmentId, "enrollment id");

  const amount = Number(req.body.amount);
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    throw new ApiError(400, "amount must be a number greater than 0");
  }

  // Makes sure the enrollment really belongs to this student
  const enrollment = await Enrollment.findOne({ _id: enrollmentId, student: id });
  if (!enrollment) throw new ApiError(404, "Enrollment not found for this student");

  try {
    await enrollment.addInstallment({
      amount,
      paidOn: req.body.paidOn ? new Date(req.body.paidOn) : undefined,
      mode: req.body.mode,
      note: req.body.note,
      receivedBy: req.user._id,
    });
  } catch (err) {
    throw new ApiError(400, err.message);
  }

  const latest = enrollment.installments.at(-1);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        installment: latest,
        finalFee: enrollment.finalFee,
        totalPaid: enrollment.totalPaid,
        due: enrollment.due,
        feeStatus: enrollment.feeStatus,
        status: enrollment.status,
      },
      "Installment recorded"
    )
  );
});


export {   createCourse, getAllCourses, updateCourse, registerStudent,
  getAllStudents, getStudentDetails, updateStudent,
  assignCourseToStudent, addStudentInstallment
};

