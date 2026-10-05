// models/enrollment.model.js
import mongoose, { Schema } from "mongoose";

// 1. Installment schema FIRST (it's used by enrollmentSchema)
const installmentSchema = new Schema({
  number:     { type: Number, required: true },
  amount:     { type: Number, required: true, min: 1 },
  paidOn:     { type: Date, required: true, default: Date.now },
  mode:       { type: String, enum: ["cash", "upi", "card", "bank", "cheque"], default: "cash" },
  receiptNo:  { type: String },
  note:       { type: String },
  receivedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

const enrollmentSchema = new Schema(
  {
    student:         { type: Schema.Types.ObjectId, ref: "User",   required: true, index: true },
    course:          { type: Schema.Types.ObjectId, ref: "Course", required: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    status:          { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
    enrolledOn:      { type: Date, default: Date.now },
    installments:    { type: [installmentSchema], default: [] },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// 3. Virtuals (course must be populated)
enrollmentSchema.virtual("finalFee").get(function () {
  const price = this.course?.price;
  if (price == null) return 0;
  return Math.round(price - (price * this.discountPercent) / 100);
});

enrollmentSchema.virtual("totalPaid").get(function () {
  return this.installments.reduce((sum, i) => sum + i.amount, 0);
});

// due = (course_price - discount%) - installments paid
enrollmentSchema.virtual("due").get(function () {
  return this.finalFee - this.totalPaid;
});

enrollmentSchema.virtual("feeStatus").get(function () {
  if (this.course?.price == null) return "no-course";
  if (this.due <= 0) return "paid";
  return this.totalPaid > 0 ? "partial" : "unpaid";
});

// 4. Method to record a paid installment
enrollmentSchema.methods.addInstallment = async function ({ amount, paidOn, mode, note, receivedBy }) {
  await this.populate("course", "title price");

  if (this.status === "cancelled") throw new Error("Enrollment is cancelled");
  if (!amount || amount <= 0) throw new Error("Amount must be greater than 0");
  if (amount > this.due) throw new Error(`Amount exceeds due (${this.due})`);

  this.installments.push({
    number: this.installments.length + 1,
    amount,
    paidOn: paidOn || new Date(),
    mode,
    note,
    receivedBy,
    receiptNo: `RCPT-${new Date().getFullYear()}-${Date.now()}`,
  });

  if (this.due - amount <= 0) this.status = "completed";
  return this.save();
};

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
