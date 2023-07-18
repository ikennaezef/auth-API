import bcrypt from "bcrypt";
import otpVerification from "../models/otpVerificationModel";
import { ObjectId } from "mongoose";

export const createOTP = async (userId: ObjectId) => {
	const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
	const hashedOTP = await bcrypt.hash(otp, 10);

	const newOTP = await otpVerification.create({
		userId,
		otp: hashedOTP,
		createdAt: Date.now(),
		expiresAt: Date.now() + 1800000,
	});

	if (!newOTP) {
		throw Error("OTP could not be created!");
	} else {
		return otp;
	}
};
