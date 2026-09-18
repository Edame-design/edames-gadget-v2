const jwt = require("jsonwebtoken");
const User = require("../models/user");

/**
 * Verify that the request contains a valid JWT.
 *
 * The decoded token is attached to req.user so
 * protected routes can identify the authenticated user.
 */
async function requireAuth(req, res, next) {
  try {
    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message:
          "Invalid authentication format",
      });
    }

    const token =
      authorization.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        message:
          "Authentication token missing",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is not configured",
      );

      return res.status(500).json({
        message:
          "Authentication service is not configured",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    if (!decoded.userId) {
      return res.status(401).json({
        message:
          "Invalid authentication token",
      });
    }

    /*
     * Verify that the user still exists and
     * is still active.
     *
     * This is important because a JWT can remain
     * valid until it expires even after an admin
     * disables the user's account.
     */
    const user = await User.findById(
      decoded.userId,
    ).select(
      "_id name email role isActive",
    );

    if (!user) {
      return res.status(401).json({
        message:
          "User account no longer exists",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account has been deactivated",
      });
    }

    /*
     * Never trust the role supplied by the
     * frontend or an old token.
     *
     * We use the current role stored in MongoDB.
     */
    req.user = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message:
          "Authentication token has expired",
      });
    }

    if (
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        message:
          "Invalid authentication token",
      });
    }

    console.error(
      "Authentication error:",
      error.message,
    );

    return res.status(500).json({
      message:
        "Authentication service error",
    });
  }
}

/**
 * Restrict a route to administrators.
 *
 * This middleware must be used AFTER requireAuth.
 */
function requireAdmin(
  req,
  res,
  next,
) {
  if (!req.user) {
    return res.status(401).json({
      message:
        "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message:
        "Administrator access required",
    });
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};