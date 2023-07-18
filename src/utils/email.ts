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
	{ _id, email }: SendEmailParams,
	res: Response
) => {
	const otp = await createOTP(_id);
	await transporter.sendMail(
		{
			from: process.env.AUTH_EMAIL,
			to: email,
			subject: "Verify Your Email",
			html: `<p>Hello, use this code <b>${otp}</b> to verify your email. This code expires in <b>30 minutes</b></p>`,
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
