import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    language:    { type: String, enum: ["english", "hindi", "both"] },
    durationInMonths: { type: Number, min: 1 },
    price:       { type: Number, required: true, min: 0 },   
    material: {                                              
      url:       String,
      localPath: String,
    },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
