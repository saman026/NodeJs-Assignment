const express = require("express");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(express.json({ extended: false }));

app.use("/api/users", require("./routes/users"));
app.use("/api/users", require("./routes/auth"));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
    console.log(`Server is running on ${PORT}`);
});