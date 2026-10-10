import { User } from "../models/user.models.js";
import { Enrollment } from "../models/enrollment.models.js";

export async function currentUser(userId) {
  const user = await User.findById(userId).select(
    "-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry",
  );
  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

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
  return userData;

}
