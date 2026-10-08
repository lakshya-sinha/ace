// models/user.model.js
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://placehold.co/200x200`,
        localPath: "",
      },
    },
    signature: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://placehold.co/200x200`,
        localPath: "",
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },

    // Who the user is: used in login to decide whether to load fees
    type: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },

    // Profile
    contactNo: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    dob: { type: Date, set: (value) => (value === "" ? undefined : value) },
    careOfTitle: { type: String, enum: ["father", "guardian"] },
    careOfName: { type: String, trim: true },
    careOfNumber: { type: String, trim: true },
    spouseName: {type: String, trim: true},
    fathersName: { type: String, trim: true },
    mothersName: { type: String, trim: true },
    isEnglishTyping: { type: Boolean, default: false },
    isHindiTyping: { type: Boolean, default: false },
    address: { type: String, trim: true },
    matricBoard: { type: String, trim: true },
    matricSchool: { type: String, trim: true },
    matricPassingYear: {
      type: Number,
      set: (value) => (value === "" ? undefined : value),
    },
    matricPercentage: { type: String, trim: true },
    interBoard: { type: String, trim: true },
    interSchool: { type: String, trim: true },
    interPassingYear: {
      type: Number,
      set: (value) => (value === "" ? undefined : value),
    },
    interPercentage: { type: String, trim: true },
    graduationBoard: { type: String, trim: true },
    graduationCollege: { type: String, trim: true },
    graduationPassingYear: {
      type: Number,
      set: (value) => (value === "" ? undefined : value),
    },
    graduationPercentage: { type: String, trim: true },
    otherBoard: { type: String, trim: true },
    otherCollege: { type: String, trim: true },
    otherPassingYear: {
      type: Number,
      set: (value) => (value === "" ? undefined : value),
    },
    otherPercentage: { type: String, trim: true },
    aadhaarNo: {
      type: String,
      trim: true,
      set: (value) => (value === "" ? undefined : value),
      match: [/^\d{12}$/, "Aadhaar number must contain exactly 12 digits"],
    },
    locked: {type: Boolean},
    createdBy: {type: String, enum: ["admin", "teacher"]},
    remarks: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Optional: lets you do User.findById(id).populate("enrollments")
// (Enrollment is its own collection, linked by Enrollment.student)
userSchema.virtual("enrollments", {
  ref: "Enrollment",
  localField: "_id",
  foreignField: "student",
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 min
  return { unHashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);
