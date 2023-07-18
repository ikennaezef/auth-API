import express, { Application, Request, Response } from "express";
import authRouter from "./routes/authRoutes";
import { connectDb } from "./db/connect";
require("dotenv").config();

const PORT = process.env.PORT || 3001;

const app: Application = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
	res.send("<h1>Authentication API</h1>");
});

app.use("/api/v1/auth", authRouter);

const start = async () => {
	try {
		await connectDb(process.env.MONGO_URI!);
		app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}...`));
	} catch (error) {
		console.log("COULD NOT START SERVER", error);
	}
};

start();
