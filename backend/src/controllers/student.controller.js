import { asyncHandler } from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"

const healthcheck = asyncHandler((req, res) => {
    res.status(200).json(new ApiResponse(200, "everythign is alright."));
});

export {healthcheck};