import { Response } from "express";
require("dotenv").config();
import nodemailer from "nodemailer";
import { createOTP } from "./otp";
import { SendEmailParams } from "../types";

const transporter = nodemailer.createTransport({
	service: "gmail",
	secure: true,
	auth: {
		user: process.env.AUTH_EMAIL,
		pass: process.env.AUTH_PASSWORD,
	},
});

export const sendMail = async (
	{ _id, email, isPasswordReset }: SendEmailParams,
	res: Response
) => {
	// 10 minutes OTP validity for password resets
	const otp = isPasswordReset
		? await createOTP(_id, 600000)
		: await createOTP(_id);

	await transporter.sendMail(
		{
			from: process.env.AUTH_EMAIL,
			to: email,
			subject: isPasswordReset ? "Reset Your Password" : "Verify Your Email",
			html: isPasswordReset
				? `<p>Hello, you have requested for a password reset. Use this code <b>${otp}</b> to reset your password. This code expires in <b>10 minutes</b></p>`
				: `<p>Hello, use this code <b>${otp}</b> to verify your email. This code expires in <b>30 minutes</b></p>`,
		},
		(err, info) => {
			if (err) {
				console.log("An error occured:", err.message);
				return res
					.status(500)
					.json({ message: "An error occured, email not sent!" });
			} else {
				res.status(200).json({
					status: "PENDING",
					message: "OTP has been sent!",
					data: {
						_id,
						email,
					},
				});
			}
		}
	);
};
