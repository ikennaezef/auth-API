import express from "express";
import { login, register, sendOTP } from "../controllers/authControllers";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/sendotp", sendOTP);

export default router;
