import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel";
import { sendMail } from "../utils/email";

export const register = async (req: Request, res: Response) => {
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

	const hashedPassword = await bcrypt.hash(password, 10);
	const newUser = await User.create({
		username,
		email,
		password: hashedPassword,
		isVerified: false,
	});

	if (!newUser) {
		return res.status(500).json({ message: "User not registered!" });
	}

	await sendMail({ _id: newUser.id, email }, res);
};

export const login = async (req: Request, res: Response) => {
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
};

export const sendOTP = async (req: Request, res: Response) => {
	res.send("Send OTP");
};
