const rateLimit = require("express-rate-limit");

const publicApiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 300,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  headers: true,
});

const authApiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  headers: true,
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10, 
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
  headers: true,
});

module.exports = { publicApiLimiter, authApiLimiter, authLimiter };
