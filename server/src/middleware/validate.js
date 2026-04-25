import mongoose from 'mongoose';
import mongoSanitize from 'express-mongo-sanitize';

// Validate ObjectId middleware
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid ${paramName}` });
    }
    next();
  };
};

export const sanitizeRequests = mongoSanitize();
