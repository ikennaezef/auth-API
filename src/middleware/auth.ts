import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ExtendedPayload, ExtendedReq } from "../types";

export const verifyToken = async (
	req: ExtendedReq,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({ message: "Authorization missing!" });
	}

	if (!authHeader.startsWith("Bearer")) {
		return res.status(401).json({ message: "Invalid authorization format!" });
	}

	const authToken = authHeader.split(" ")[1];
	try {
		const { email } = jwt.verify(
			authToken,
			process.env.JWT_SECRET!
		) as ExtendedPayload;
		req.email! = email;
		next();
	} catch (error: any) {
		if (error.name == "TokenExpiredError") {
			res.status(401).json({ message: "Auth token expired!" });
		} else {
			res.status(401).json({ message: "Invalid authorization!" });
		}
	}
};
