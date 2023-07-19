import { Request, Response, json } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import OtpVerification from "../models/otpVerificationModel";
import { sendMail } from "../utils/email";
import { verifyOTP } from "../utils/otp";
import { ExtendedReq } from "../types";

export const register = async (req: Request, res: Response) => {
	try {
		const { username, email, password } = req.body;
		if (!username || !email || !password) {
			return res
				.status(400)
				.json({ message: "Please fill the required fields!" });
		}
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res
				.status(400)
				.json({ message: "This email is already registered!" });
		}

		if (password.length < 8) {
			return res
				.status(400)
				.json({ message: "Password must be at least 8 characters!" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await User.create({
			username,
			email,
			password: hashedPassword,
			isVerified: false,
		});

		if (!newUser) {
			return res.status(500).json({ message: "An error occured!" });
		}

		await sendMail({ _id: newUser.id, email }, res);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Please enter email and password!" });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User does not exist!" });
		}

		const comparePassword = await bcrypt.compare(password, user.password!);
		if (!comparePassword) {
			return res.status(400).json({ message: "Invalid credentials!" });
		}

		const userIsVerified = user.isVerified;
		if (!userIsVerified) {
			return res.status(200).json({
				status: "UNVERIFIED",
				message: "User is not verified!",
			});
		} else {
			return res.status(200).json({
				status: "VERIFIED",
				user: {
					id: user._id,
					email: user.email,
					isVerified: true,
				},
			});
		}
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

export const resendOTP = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res
				.status(400)
				.json({ message: "Please enter an email address!" });
		}

		const userExists = await User.findOne({ email });
		if (!userExists) {
			return res
				.status(404)
				.json({ message: "User does not exist! Please sign up." });
		}

		await sendMail({ _id: userExists.id, email }, res);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

export const verifyUser = async (req: Request, res: Response) => {
	try {
		const { email, otp } = req.body;
		if (!email || !otp) {
			return res.status(400).json({ message: "Please enter email and OTP!" });
		}

		const userExists = await User.findOne({ email });
		if (!userExists) {
			return res.status(400).json({ message: "User does not exist!" });
		}

		const userId = userExists.id;
		const validOTP = await verifyOTP(userId, otp);

		if (validOTP) {
			await User.findOneAndUpdate({ email }, { isVerified: true });
			await OtpVerification.deleteMany({ userId });
			res.status(200).json({
				status: "VERIFIED",
				message: "User email has been verified successfully. Proceed to login.",
			});
		}
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ message: "Please enter email!" });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "Account does not exist!" });
		}

		const userId = user.id;
		await sendMail({ _id: userId, email, isPasswordReset: true }, res);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

export const verifyPasswordReset = async (req: Request, res: Response) => {
	try {
		const { email, otp } = req.body;
		if (!email || !otp) {
			return res.status(400).json({ message: "Please enter email and OTP!" });
		}

		const userExists = await User.findOne({ email });
		if (!userExists) {
			return res.status(400).json({ message: "User does not exist!" });
		}

		const userId = userExists.id;
		const validOTP = await verifyOTP(userId, otp);

		if (validOTP) {
			await OtpVerification.deleteMany({ userId });
			const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
				expiresIn: process.env.JWT_LIFETIME_RESET_PASSWORD!,
			});
			res.status(200).json({
				user: { id: userId, email },
				message: "User has been verified. Proceed to reset your pasword.",
				token,
			});
		}
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

export const resetPassword = async (req: ExtendedReq, res: Response) => {
	try {
		const { password, confirmPassword, email } = req.body;
		if (!email || !password || !confirmPassword) {
			return res
				.status(400)
				.json({ message: "Please fill in all the fields!" });
		}

		const userExists = await User.findOne({ email });
		if (!userExists) {
			return res.status(400).json({ message: "User does not exist!" });
		}

		if (confirmPassword != password) {
			return res.status(400).json({ message: "Passwords don't match!" });
		}

		if (password.length < 8) {
			return res
				.status(400)
				.json({ message: "Password must be at least 8 characters!" });
		}

		const emailFromToken = req.email;
		if (email != emailFromToken) {
			return res
				.status(403)
				.json({ message: "You cannot reset another user's password!" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		await User.findOneAndUpdate(
			{ email },
			{ password: hashedPassword },
			{ new: true }
		);

		res
			.status(200)
			.json({ message: "Password reset successful! Proceed to login." });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};
