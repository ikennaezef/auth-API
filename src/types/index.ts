import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongoose";

export type SendEmailParams = {
	_id: ObjectId;
	email: string;
	isPasswordReset?: boolean;
};

export type ExtendedReq = Request & { email?: string };

export type ExtendedPayload =
	| (string & { email: string })
	| (JwtPayload & { email: string });
