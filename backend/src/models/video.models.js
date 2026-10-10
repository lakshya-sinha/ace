import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  list: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true,
  }
})

export const Video = mongoose.model("Video", videoSchema);

