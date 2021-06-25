const app = require('./app');
// const globalError = requie('./utils/appError');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
    console.log(`Server is running on ${PORT}`);
});