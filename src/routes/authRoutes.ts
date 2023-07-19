import express from "express";
import {
	forgotPassword,
	login,
	register,
	resendOTP,
	verifyPasswordReset,
	verifyUser,
} from "../controllers/authControllers";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/resend-otp", resendOTP);

router.post("/verify-otp", verifyUser);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-password", verifyPasswordReset);

export default router;
