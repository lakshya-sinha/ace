import { User } from "../models/user.models.js";
import { Enrollment } from "../models/enrollment.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";


const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();


    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };

  } catch (err) {
    console.error("TOKEN ERROR:", err);   // add this
    throw new ApiError(500, "Something went wrong when accessing token ");
  }

}

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, fullName, type, contactNo, isEnglishTyping, isHindiTyping, Dob, mothersName, fathersName, gender, discount, installment  } = req.body

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })
  if (existedUser) {
    throw new ApiError(409, "User with email or username is already exists.")
  }
  const avatarFile = req.files?.avatar?.[0];
  const signatureFile = req.files?.signature?.[0];
  const avatar = avatarFile
    ? {
        url: `/images/${avatarFile.filename}`,
        localPath: avatarFile.path,
      }
    : undefined;
  const signature = signatureFile
    ? {
        url: `/images/${signatureFile.filename}`,
        localPath: signatureFile.path,
    }
    : undefined;

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: true,
    fullName, 
    type, 
    contactNo, 
    isEnglishTyping, 
    isHindiTyping,
    Dob, 
    mothersName,
    fathersName,
    gender,
    discount,
    installment,
    ...(avatar && { avatar }),
    ...(signature && { signature }),
  });

  const { unHashedToken,
    hashedToken,
    tokenExpiry
  } = user.generateTemporaryToken()

  await user.save({ validateBeforeSave: false });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering a user ")
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, { user: createdUser },
        "User registered successfully and verification email has been be send on your email!")
    )
})


const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email) {
    throw new ApiError(400, "email is required!");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User does not exists");
  }


  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id);


  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )


  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged In successfully")
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: "" } },
    {
      new: true
    }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, {}, "User logged out")
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry"
  );
  if (!user) throw new ApiError(404, "User not found");

  const userData = user.toJSON();

  // Enrollments are loaded for every user type. Admins/teachers simply get an empty list.
  const enrollments = await Enrollment.find({ student: user._id })
    .populate("course", "title price language durationInMonths material")
    .populate("installments.receivedBy", "fullName username");

  userData.enrollments = enrollments.map((e) => ({
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
  }));

  const active = enrollments.filter((e) => e.status !== "cancelled");
  userData.fees = {
    totalFee: active.reduce((sum, e) => sum + e.finalFee, 0),
    totalPaid: active.reduce((sum, e) => sum + e.totalPaid, 0),
    totalDue: active.reduce((sum, e) => sum + e.due, 0),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, userData, "Current User fetched Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refersh Token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshTokens(user._id)

    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken }
        )
      )

  } catch (error) {
    throw new ApiError(401, "Invalid Refresh Token")
  }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {

  const { oldPassword, newPaessword } = req.body;
  const user = await User.findById(req.user?.id);
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(
      400,
      "Invalid old password"
    )
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "password changed successfully"
      )
    )
})

export {
  registerUser,
  login,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
  changeCurrentPassword,
};
