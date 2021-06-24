const express = require("express");
const connectDB = require("./config/db");
const userRouter = require("./routes/userRoutes");
const app = express();

connectDB();

app.use(express.json({ extended: false }));

app.use("/api", userRouter);

module.exports = app;