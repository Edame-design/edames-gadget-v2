const express = require("express");

const Category = require("../models/category");

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/auth");

const {
  validateCategoryCreate,
  validateCategoryUpdate,
  validateObjectIdParam,
} = require("../middleware/validation");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function normalizeName(value) {
  return value.trim();
}

function normalizeSlug(value) {
  return value
    .trim()
    .toLowerCase();
}

/*
|--------------------------------------------------------------------------
| PUBLIC — GET ACTIVE CATEGORIES
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  async (req, res) => {
    try {
      const categories =
        await Category.find({
          isActive: true,
        }).sort({
          name: 1,
        });

      return res.status(200).json(
        categories,
      );
    } catch (error) {
      console.error(
        "Get categories error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load categories",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — GET ALL CATEGORIES
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const categories =
        await Category.find().sort({
          createdAt: -1,
        });

      return res.status(200).json(
        categories,
      );
    } catch (error) {
      console.error(
        "Get admin categories error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load categories",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| PUBLIC — GET SINGLE CATEGORY
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  validateObjectIdParam("id"),
  async (req, res) => {
    try {
      const category =
        await Category.findOne({
          _id: req.params.id,
          isActive: true,
        });

      if (!category) {
        return res.status(404).json({
          message:
            "Category not found",
        });
      }

      return res.status(200).json(
        category,
      );
    } catch (error) {
      console.error(
        "Get category error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load category",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — CREATE CATEGORY
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateCategoryCreate,
  async (req, res) => {
    try {
      const {
        name,
        slug,
        description,
        isActive,
      } = req.body;

      const cleanName =
        normalizeName(name);

      const cleanSlug =
        normalizeSlug(slug);

      const cleanDescription =
        description === undefined
          ? ""
          : description.trim();

      /*
      |--------------------------------------------------------------------------
      | CHECK DUPLICATE NAME
      |--------------------------------------------------------------------------
      */

      const existingName =
        await Category.findOne({
          name: cleanName,
        });

      if (existingName) {
        return res.status(409).json({
          message:
            "A category with this name already exists",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CHECK DUPLICATE SLUG
      |--------------------------------------------------------------------------
      */

      const existingSlug =
        await Category.findOne({
          slug: cleanSlug,
        });

      if (existingSlug) {
        return res.status(409).json({
          message:
            "A category with this slug already exists",
        });
      }

      const category =
        await Category.create({
          name: cleanName,
          slug: cleanSlug,
          description:
            cleanDescription,
          isActive:
            isActive === undefined
              ? true
              : isActive,
        });

      return res.status(201).json(
        category,
      );
    } catch (error) {
      console.error(
        "Create category error:",
        error.message,
      );

      /*
      |--------------------------------------------------------------------------
      | MONGODB DUPLICATE KEY
      |--------------------------------------------------------------------------
      */

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          message:
            "A category with this name or slug already exists",
        });
      }

      return res.status(500).json({
        message:
          "Unable to create category",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — UPDATE CATEGORY
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateObjectIdParam("id"),
  validateCategoryUpdate,
  async (req, res) => {
    try {
      const {
        name,
        slug,
        description,
        isActive,
      } = req.body;

      const updates = {};

      /*
      |--------------------------------------------------------------------------
      | NORMALIZE PROVIDED FIELDS
      |--------------------------------------------------------------------------
      */

      if (
        name !== undefined
      ) {
        updates.name =
          normalizeName(name);
      }

      if (
        slug !== undefined
      ) {
        updates.slug =
          normalizeSlug(slug);
      }

      if (
        description !==
        undefined
      ) {
        updates.description =
          description.trim();
      }

      if (
        isActive !== undefined
      ) {
        updates.isActive =
          isActive;
      }

      /*
      |--------------------------------------------------------------------------
      | EMPTY UPDATE PROTECTION
      |--------------------------------------------------------------------------
      */

      if (
        Object.keys(updates)
          .length === 0
      ) {
        return res.status(400).json({
          message:
            "At least one category field must be provided",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | DUPLICATE NAME CHECK
      |--------------------------------------------------------------------------
      */

      if (
        updates.name !==
        undefined
      ) {
        const existingName =
          await Category.findOne({
            name: updates.name,
            _id: {
              $ne: req.params.id,
            },
          });

        if (existingName) {
          return res.status(409).json({
            message:
              "A category with this name already exists",
          });
        }
      }

      /*
      |--------------------------------------------------------------------------
      | DUPLICATE SLUG CHECK
      |--------------------------------------------------------------------------
      */

      if (
        updates.slug !==
        undefined
      ) {
        const existingSlug =
          await Category.findOne({
            slug: updates.slug,
            _id: {
              $ne: req.params.id,
            },
          });

        if (existingSlug) {
          return res.status(409).json({
            message:
              "A category with this slug already exists",
          });
        }
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE
      |--------------------------------------------------------------------------
      */

      const category =
        await Category.findByIdAndUpdate(
          req.params.id,
          updates,
          {
            new: true,
            runValidators: true,
          },
        );

      if (!category) {
        return res.status(404).json({
          message:
            "Category not found",
        });
      }

      return res.status(200).json(
        category,
      );
    } catch (error) {
      console.error(
        "Update category error:",
        error.message,
      );

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          message:
            "A category with this name or slug already exists",
        });
      }

      return res.status(500).json({
        message:
          "Unable to update category",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — SOFT DELETE / ARCHIVE CATEGORY
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateObjectIdParam("id"),
  async (req, res) => {
    try {
      const category =
        await Category.findById(
          req.params.id,
        );

      if (!category) {
        return res.status(404).json({
          message:
            "Category not found",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PREVENT REPEATED ARCHIVING
      |--------------------------------------------------------------------------
      */

      if (!category.isActive) {
        return res.status(400).json({
          message:
            "Category is already archived",
        });
      }

      category.isActive =
        false;

      await category.save();

      return res.status(200).json({
        message:
          "Category archived successfully",
        category,
      });
    } catch (error) {
      console.error(
        "Archive category error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to archive category",
      });
    }
  },
);

module.exports = router;