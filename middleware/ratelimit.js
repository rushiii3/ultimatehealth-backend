const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const rateLimitResponse = (code, message) => ({
  success: false,
  error: { code, message },
});

const baseConfig = {
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip);

    return `${ip}-${req.body?.email || req.user?.id || 'guest'}`;
  },

  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
      },
    });
  },
};

/**
 * Global limiter - whole app
 */
const globalLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: 300, // 300 requests / 15 min
});


/**
 * Login limiter
 * Prevent brute force
 */
const loginLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  skipSuccessfulRequests: true,
});

/**
 * Register limiter
 * Prevent account spam
 */
const registerLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
});

/**
 * Forgot password limiter
 * Prevent reset abuse
 */
const forgotPasswordLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
});

/**
 * OTP verification limiter
 * Prevent OTP brute force
 */
const otpLimiter = rateLimit({
  ...baseConfig,
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5,
  skipSuccessfulRequests: true,
});

/**
 * Resend OTP limiter
 * Prevent spam sending
 */
const resendOtpLimiter = rateLimit({
  ...baseConfig,
  windowMs: 10 * 60 * 1000, // 10 min
  max: 3,
});


/**
 * User actions (POST/PUT/DELETE)
 */
const mutationLimiter = rateLimit({
  ...baseConfig,
  windowMs: 5 * 60 * 1000,
  max: 30,
});

/**
 * Search endpoints
 */
const searchLimiter = rateLimit({
  ...baseConfig,
  windowMs: 1 * 60 * 1000,
  max: 20,
});

/**
 * File uploads
 */
const uploadLimiter = rateLimit({
  ...baseConfig,
  windowMs: 10 * 60 * 1000,
  max: 10,
});

/**
 * download/report generation
 */
const heavyOperationLimiter = rateLimit({
  ...baseConfig,
  windowMs: 30 * 60 * 1000,
  max: 5,
});

module.exports = {
  globalLimiter,
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  otpLimiter,
  resendOtpLimiter,
};