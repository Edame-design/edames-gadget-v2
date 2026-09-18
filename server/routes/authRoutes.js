const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const {
  validateRegistration,
  validateLogin,
} = require("../middleware/validation");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| TOKEN
|--------------------------------------------------------------------------
*/

/**
 * Create a JWT for an authenticated user.
 */
function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured",
    );
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
}

/*
|--------------------------------------------------------------------------
| PUBLIC USER
|--------------------------------------------------------------------------
|
| Never return passwordHash to the client.
|
|--------------------------------------------------------------------------
*/

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
|
| POST /api/auth/register
|
| Validation happens BEFORE the route handler.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/register",
  validateRegistration,
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      /*
       * Normalize values before
       * storing them.
       */
      const cleanName =
        name.trim();

      const cleanEmail =
        email.trim().toLowerCase();

      /*
       * Check whether an account
       * already exists.
       */
      const existingUser =
        await User.findOne({
          email: cleanEmail,
        });

      if (existingUser) {
        return res.status(409).json({
          message:
            "An account with this email already exists",
        });
      }

      /*
       * Hash the password.
       *
       * Plain-text passwords are
       * never stored in MongoDB.
       */
      const passwordHash =
        await bcrypt.hash(
          password,
          12,
        );

      /*
       * Always create normal
       * registrations as customers.
       *
       * The client cannot choose
       * its own role.
       */
      const user =
        await User.create({
          name: cleanName,
          email: cleanEmail,
          passwordHash,
          role: "customer",
          isActive: true,
        });

      /*
       * Create authentication token.
       */
      const token =
        createToken(user);

      return res.status(201).json({
        token,
        user: publicUser(user),
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error.message,
      );

      /*
       * Handle MongoDB duplicate-key
       * protection as well.
       */
      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          message:
            "An account with this email already exists",
        });
      }

      return res.status(500).json({
        message:
          "Unable to create account",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
|
| POST /api/auth/login
|
| Validation happens BEFORE the
| authentication logic.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/login",
  validateLogin,
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      /*
       * Normalize the email so that
       * login behaves consistently.
       */
      const cleanEmail =
        email.trim().toLowerCase();

      /*
       * Find the account.
       */
      const user =
        await User.findOne({
          email: cleanEmail,
        });

      /*
       * Do not reveal whether the
       * email exists.
       */
      if (!user) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }

      /*
       * Prevent deactivated accounts
       * from authenticating.
       */
      if (!user.isActive) {
        return res.status(403).json({
          message:
            "Your account has been deactivated",
        });
      }

      /*
       * Compare the supplied password
       * against the stored bcrypt hash.
       */
      const passwordMatches =
        await bcrypt.compare(
          password,
          user.passwordHash,
        );

      if (!passwordMatches) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }

      /*
       * Authentication successful.
       */
      const token =
        createToken(user);

      return res.status(200).json({
        token,
        user: publicUser(user),
      });
    } catch (error) {
      console.error(
        "Login error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to login",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = router;