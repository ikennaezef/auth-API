import express, { Application } from "express";
require("dotenv").config();

const app: Application = express();

app.get("/", (req, res) => {
	res.send("TS API");
});

app.listen(1234, () => console.log("SERVER RUNNING ON 1234..."));
