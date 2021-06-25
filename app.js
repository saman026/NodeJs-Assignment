const express = require("express");
const connectDB = require("./config/db");
const userRouter = require("./routes/userRoutes");
const app = express();
const globalError = require("./controllers/errorController");
const AppError = require("./utils/appError");
connectDB();

app.use(express.json({ extended: false }));

app.use("/api", userRouter);
app.use(globalError);

app.all('*', (req,res,next)=>{
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    })
    // next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;