const express = require("express");

const Product = require("../models/product");

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/auth");

const {
  validateProductCreate,
  validateProductUpdate,
  validateObjectIdParam,
} = require("../middleware/validation");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

/**
 * Normalize a product slug.
 */
function normalizeSlug(value) {
  return value
    .trim()
    .toLowerCase();
}

/**
 * Check whether a value is a
 * non-negative finite number.
 */



/*
|--------------------------------------------------------------------------
| PUBLIC — GET ACTIVE PRODUCTS
|--------------------------------------------------------------------------
|
| GET /api/products
|
| Customers should only see products
| that are currently active.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  async (req, res) => {
    try {
      const products =
        await Product.find({
          isActive: true,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json(
        products,
      );
    } catch (error) {
      console.error(
        "Get products error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load products",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — GET ALL PRODUCTS
|--------------------------------------------------------------------------
|
| GET /api/products/admin/all
|
| Admin needs to see both active
| and archived products.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const products =
        await Product.find().sort({
          createdAt: -1,
        });

      return res.status(200).json(
        products,
      );
    } catch (error) {
      console.error(
        "Get admin products error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load products",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| PUBLIC — GET SINGLE PRODUCT
|--------------------------------------------------------------------------
|
| GET /api/products/:id
|
| Only active products are exposed
| publicly.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  validateObjectIdParam("id"),
  async (req, res) => {
    try {
      const product =
        await Product.findOne({
          _id: req.params.id,
          isActive: true,
        });

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found",
        });
      }

      return res.status(200).json(
        product,
      );
    } catch (error) {
      console.error(
        "Get product error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load product",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — CREATE PRODUCT
|--------------------------------------------------------------------------
|
| POST /api/products
|
| Validation happens before the
| database operation.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateProductCreate,
  async (req, res) => {
    try {
      const {
        name,
        slug,
        description,
        price,
        image,
        category,
        stock,
        isActive,
      } = req.body;

      const cleanName =
        name.trim();

      const cleanSlug =
        normalizeSlug(slug);

      const cleanDescription =
        description === undefined
          ? ""
          : description.trim();

      const cleanCategory =
        category.trim();

      /*
       * Check for an existing slug
       * before attempting to create.
       */
      const existingProduct =
        await Product.findOne({
          slug: cleanSlug,
        });

      if (existingProduct) {
        return res.status(409).json({
          message:
            "A product with this slug already exists",
        });
      }

      const product =
        await Product.create({
          name: cleanName,
          slug: cleanSlug,
          description:
            cleanDescription,
          price,
          image:
            image === undefined
              ? ""
              : image.trim(),
          category:
            cleanCategory,
          stock,
          isActive:
            isActive === undefined
              ? true
              : isActive,
        });

      return res.status(201).json(
        product,
      );
    } catch (error) {
      console.error(
        "Create product error:",
        error.message,
      );

      /*
       * MongoDB duplicate-key
       * protection.
       */
      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          message:
            "A product with this slug already exists",
        });
      }

      return res.status(500).json({
        message:
          "Unable to create product",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — UPDATE PRODUCT
|--------------------------------------------------------------------------
|
| PUT /api/products/:id
|
| The ID and request body are
| validated independently.
|
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateObjectIdParam("id"),
  validateProductUpdate,
  async (req, res) => {
    try {
      const {
        name,
        slug,
        description,
        price,
        image,
        category,
        stock,
        isActive,
      } = req.body;

      /*
       * Build the update object
       * from fields actually supplied.
       *
       * This prevents accidental
       * overwriting of fields that
       * weren't part of the request.
       */
      const updates = {};

      if (
        name !== undefined
      ) {
        updates.name =
          name.trim();
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
        price !== undefined
      ) {
        updates.price =
          price;
      }

      if (
        image !== undefined
      ) {
        updates.image =
          image.trim();
      }

      if (
        category !== undefined
      ) {
        updates.category =
          category.trim();
      }

      if (
        stock !== undefined
      ) {
        updates.stock =
          stock;
      }

      if (
        isActive !== undefined
      ) {
        updates.isActive =
          isActive;
      }

      /*
       * Do not allow an empty update.
       */
      if (
        Object.keys(updates)
          .length === 0
      ) {
        return res.status(400).json({
          message:
            "At least one product field must be provided",
        });
      }

      /*
       * If the slug is changing,
       * make sure another product
       * isn't already using it.
       */
      if (
        updates.slug !==
        undefined
      ) {
        const existingProduct =
          await Product.findOne({
            slug: updates.slug,
            _id: {
              $ne: req.params.id,
            },
          });

        if (existingProduct) {
          return res.status(409).json({
            message:
              "A product with this slug already exists",
          });
        }
      }

      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          updates,
          {
            new: true,
            runValidators: true,
          },
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found",
        });
      }

      return res.status(200).json(
        product,
      );
    } catch (error) {
      console.error(
        "Update product error:",
        error.message,
      );

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          message:
            "A product with this slug already exists",
        });
      }

      return res.status(500).json({
        message:
          "Unable to update product",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — SOFT DELETE PRODUCT
|--------------------------------------------------------------------------
|
| DELETE /api/products/:id
|
| We archive the product instead
| of permanently deleting it.
|
| This protects historical order
| references.
|
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateObjectIdParam("id"),
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id,
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found",
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          message:
            "Product is already archived",
        });
      }

      product.isActive =
        false;

      await product.save();

      return res.status(200).json({
        message:
          "Product archived successfully",
        product,
      });
    } catch (error) {
      console.error(
        "Archive product error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to archive product",
      });
    }
  },
);

module.exports = router;