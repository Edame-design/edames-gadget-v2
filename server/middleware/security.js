const rateLimit = require("express-rate-limit");

/*
 * General API limiter.
 *
 * This is intentionally fairly generous for now.
 * It protects the API from accidental or abusive
 * request floods without making normal browsing
 * painful.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 300,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  message: {
    message:
      "Too many requests. Please try again later.",
  },
});

/*
 * Authentication limiter.
 *
 * Login and registration are much more sensitive
 * than normal product browsing, so they receive
 * a stricter limit.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 20,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  message: {
    message:
      "Too many authentication attempts. Please try again later.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};