const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/auth");

const {
  validateObjectIdParam,
  isValidString,
  isValidEmail,
  isValidPassword,
} = require("../middleware/validation");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN — GET ALL CUSTOMERS
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const users =
        await User.find({
          role: "customer",
        })
          .select(
            "_id name email role isActive createdAt updatedAt",
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json(
        users,
      );
    } catch (error) {
      console.error(
        "Get customers error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load customers",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — UPDATE CUSTOMER STATUS
|--------------------------------------------------------------------------
*/

router.put(
  "/admin/:id/status",
  requireAuth,
  requireAdmin,
  validateObjectIdParam("id"),
  async (req, res) => {
    try {
      const {
        isActive,
      } = req.body;

      /*
      |--------------------------------------------------------------------------
      | BOOLEAN VALIDATION
      |--------------------------------------------------------------------------
      */

      if (
        typeof isActive !==
        "boolean"
      ) {
        return res.status(400).json({
          message:
            "isActive must be a boolean",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | FIND CUSTOMER
      |--------------------------------------------------------------------------
      */

      const user =
        await User.findById(
          req.params.id,
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | NEVER CHANGE ADMIN STATUS THROUGH CUSTOMER ENDPOINT
      |--------------------------------------------------------------------------
      */

      if (
        user.role !==
        "customer"
      ) {
        return res.status(403).json({
          message:
            "This endpoint can only modify customer accounts",
        });
      }

      user.isActive =
        isActive;

      await user.save();

      return res.status(200).json({
        message:
          isActive
            ? "Customer account activated successfully"
            : "Customer account deactivated successfully",

        user: {
          _id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          isActive:
            user.isActive,

          createdAt:
            user.createdAt,

          updatedAt:
            user.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "Update customer status error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to update customer status",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — UPDATE OWN PROFILE
|--------------------------------------------------------------------------
*/

router.put(
  "/admin/me",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        name,
        email,
      } = req.body;

      const errors = [];

      /*
      |--------------------------------------------------------------------------
      | NAME
      |--------------------------------------------------------------------------
      */

      if (
        !isValidString(
          name,
          1,
          100,
        )
      ) {
        errors.push(
          "Name must be between 1 and 100 characters",
        );
      }

      /*
      |--------------------------------------------------------------------------
      | EMAIL
      |--------------------------------------------------------------------------
      */

      if (
        !isValidEmail(email)
      ) {
        errors.push(
          "A valid email address is required",
        );
      }

      if (
        errors.length > 0
      ) {
        return res.status(400).json({
          message:
            "Profile validation failed",
          errors,
        });
      }

      const cleanName =
        name.trim();

      const cleanEmail =
        email.trim().toLowerCase();

      /*
      |--------------------------------------------------------------------------
      | LOAD ADMIN
      |--------------------------------------------------------------------------
      */

      const admin =
        await User.findById(
          req.user.userId,
        );

      if (!admin) {
        return res.status(404).json({
          message:
            "Administrator account no longer exists",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | VERIFY ROLE
      |--------------------------------------------------------------------------
      */

      if (
        admin.role !==
        "admin"
      ) {
        return res.status(403).json({
          message:
            "Administrator access required",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | DUPLICATE EMAIL CHECK
      |--------------------------------------------------------------------------
      */

      const existingUser =
        await User.findOne({
          email: cleanEmail,
          _id: {
            $ne:
              admin._id,
          },
        });

      if (existingUser) {
        return res.status(409).json({
          message:
            "An account with this email already exists",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE
      |--------------------------------------------------------------------------
      */

      admin.name =
        cleanName;

      admin.email =
        cleanEmail;

      await admin.save();

      return res.status(200).json({
        message:
          "Administrator profile updated successfully",

        user: {
          id:
            admin._id.toString(),

          name:
            admin.name,

          email:
            admin.email,

          role:
            admin.role,
        },
      });
    } catch (error) {
      console.error(
        "Update admin profile error:",
        error.message,
      );

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
          "Unable to update administrator profile",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — CHANGE OWN PASSWORD
|--------------------------------------------------------------------------
*/

router.put(
  "/admin/me/password",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      const errors = [];

      /*
      |--------------------------------------------------------------------------
      | CURRENT PASSWORD
      |--------------------------------------------------------------------------
      */

      if (
        typeof currentPassword !==
          "string" ||
        currentPassword.length ===
          0
      ) {
        errors.push(
          "Current password is required",
        );
      }

      /*
      |--------------------------------------------------------------------------
      | NEW PASSWORD
      |--------------------------------------------------------------------------
      */

      if (
        !isValidPassword(
          newPassword,
        )
      ) {
        errors.push(
          "New password must be between 8 and 128 characters",
        );
      }

      if (
        errors.length > 0
      ) {
        return res.status(400).json({
          message:
            "Password validation failed",
          errors,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | LOAD ADMIN
      |--------------------------------------------------------------------------
      */

      const admin =
        await User.findById(
          req.user.userId,
        );

      if (!admin) {
        return res.status(404).json({
          message:
            "Administrator account no longer exists",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | VERIFY ROLE
      |--------------------------------------------------------------------------
      */

      if (
        admin.role !==
        "admin"
      ) {
        return res.status(403).json({
          message:
            "Administrator access required",
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
          admin.passwordHash,
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
          admin.passwordHash,
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

      admin.passwordHash =
        newPasswordHash;

      await admin.save();

      return res.status(200).json({
        message:
          "Administrator password changed successfully",
      });
    } catch (error) {
      console.error(
        "Admin password change error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to change administrator password",
      });
    }
  },
);

module.exports = router;