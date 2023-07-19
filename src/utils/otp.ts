import bcrypt from "bcrypt";
import OtpVerification from "../models/otpVerificationModel";
import { ObjectId } from "mongoose";

export const createOTP = async (
	userId: ObjectId,
	lifetime: number = 1800000
) => {
	const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
	const hashedOTP = await bcrypt.hash(otp, 10);

	const newOTP = await OtpVerification.create({
		userId,
		otp: hashedOTP,
		createdAt: Date.now(),
		expiresAt: Date.now() + lifetime,
	});

	if (!newOTP) {
		throw Error("OTP could not be created!");
	} else {
		return otp;
	}
};

export const verifyOTP = async (userId: string, otp: string) => {
	if (!userId || !otp) {
		throw Error("Please enter userId and OTP!");
	}

	const otpExists = await OtpVerification.findOne({ userId });
	if (!otpExists) {
		throw Error("Record does not exist! Please register or login.");
	}

	if (new Date(Date.now()) > otpExists.expiresAt) {
		throw Error("The OTP has expired! Please request for another one.");
	}

	const validOTP = await bcrypt.compare(otp, otpExists.otp);
	if (!validOTP) {
		throw Error("Invalid OTP!");
	} else {
		return validOTP;
	}
};
