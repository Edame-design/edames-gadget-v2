const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

const {
  requireAuth,
} = require("../middleware/auth");

const {
  validatePasswordChange,
} = require("../middleware/validation");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CUSTOMER — CHANGE PASSWORD
|--------------------------------------------------------------------------
*/

router.put(
  "/password",
  requireAuth,
  validatePasswordChange,
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      /*
      |--------------------------------------------------------------------------
      | LOAD CURRENT USER
      |--------------------------------------------------------------------------
      */

      const user =
        await User.findById(
          req.user.userId,
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User account no longer exists",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | ACCOUNT STATUS
      |--------------------------------------------------------------------------
      */

      if (!user.isActive) {
        return res.status(403).json({
          message:
            "Your account has been deactivated",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | VERIFY CURRENT PASSWORD
      |--------------------------------------------------------------------------
      */

      const passwordMatches =
        await bcrypt.compare(
          currentPassword,
          user.passwordHash,
        );

      if (!passwordMatches) {
        return res.status(401).json({
          message:
            "Current password is incorrect",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PREVENT PASSWORD REUSE
      |--------------------------------------------------------------------------
      */

      const samePassword =
        await bcrypt.compare(
          newPassword,
          user.passwordHash,
        );

      if (samePassword) {
        return res.status(400).json({
          message:
            "New password must be different from your current password",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | HASH NEW PASSWORD
      |--------------------------------------------------------------------------
      */

      const newPasswordHash =
        await bcrypt.hash(
          newPassword,
          12,
        );

      user.passwordHash =
        newPasswordHash;

      await user.save();

      return res.status(200).json({
        message:
          "Password changed successfully",
      });
    } catch (error) {
      console.error(
        "Customer password change error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to change password",
      });
    }
  },
);

module.exports = router;