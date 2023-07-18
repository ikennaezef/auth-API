import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
	},
	expiresAt: {
		type: Date,
		required: true,
	},
});

const otpVerification = mongoose.model(
	"otpVerification",
	otpVerificationSchema
);

export default otpVerification;
