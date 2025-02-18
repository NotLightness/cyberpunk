import rateLimit from "express-rate-limit"

// General rate limiter for all routes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

// Stricter rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login attempts per hour
  message: "Too many login attempts from this IP, please try again after an hour.",
  standardHeaders: true,
  legacyHeaders: false,
})

// API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 requests per 5 minutes
  message: "Too many API requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

