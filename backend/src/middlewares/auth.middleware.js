import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import jwt from "jsonwebtoken";
import { currentUser } from '../utils/currentUser.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  console.log(token);

  if (!token) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Unauthorized request."));
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken ",
    );
    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Invalid Access token"));
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Invalid Access Token."))
  }
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Uauthhorized request"))
  }

  if (req.user.type !== "admin") {
    return res
      .status(403)
      .json(new ApiResponse(403, {}, "You don't have permission to do this operation."))
  }

  next();
});

export const verifyStudent = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Unauthorized request"))
  }
  if (req.user.type !== "student") {
    return res
      .status(403)
      .json(new ApiResponse(403, {}, "You don't have permission to do this operation"))
  }
  next();
});

export const verifyCourse = asyncHandler(async (req, res, next) => {
  const userData = await currentUser(req.user._id);
  const course = req.params.course;
  let verified = false;
  userData.enrollments.forEach((elem) => {
    console.log(elem, "course", course);
    if (elem.course.title == course) {
      verified = true;
    }
  })
  if (verified) {
    next();
  } else {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, `${course}, Course is not assign to you.`))
  }
})
