import { ObjectId } from "mongoose";

export type SendEmailParams = {
	_id: ObjectId;
	email: string;
	isPasswordReset?: boolean;
};
