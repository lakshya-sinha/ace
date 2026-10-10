import { asyncHandler } from "../utils/async-handler.js"
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/api-response.js"

const healthcheck = asyncHandler((req, res) => {
  res.status(200).json(new ApiResponse(200, "everythign is alright."));
});



const getVideo = asyncHandler(async (req, res) => {
  const { course, category, group } = req.params;
  let videos;
  if (category == "NA") {
    videos = await Video.find({ course })
  } else if (group == "NA") {
    videos = await Video.find({ course, category });
  } else {
    videos = await Video.find({ course, category, group })
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { videos }, "video fetched successfully"))
})

export { healthcheck, getVideo };
