const AppError = require('../utils/appError');

const handleCastErrorDB = err=>{
    const message = `Invalid ${err.path}: ${err.val}.`;
    return new AppError(message, 400);
}

const handleDuplicateFieldDB = err =>{
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
    console.log(value);
    const message = `Duplicate field value ${value} Please use another value`;
    return new AppError(message, 400)
}

const handleValidationErrorDB = err =>{
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400)   
}

const handleJWTError = () => new AppError('Invalid token. Please login again', 401);

const handleJWTExpiredError = () => new AppError('Your token is expirde! Please login again', 401);

const sendErrorDev = (err,res)=>{
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}


module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500,
    err.status = err.status || 'error'

        let error = {...err};
        
        if(error.name === 'CastError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldDB(error);
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);
    
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        sendErrorDev(error,res);
    
}