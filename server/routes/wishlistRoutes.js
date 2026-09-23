const express = require("express");

const Wishlist =
  require("../models/wishlist");

const Product =
  require("../models/product");

const {
  requireAuth,
} = require("../middleware/auth");

const {
  validateObjectIdParam,
} = require("../middleware/validation");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET WISHLIST
|--------------------------------------------------------------------------
|
| GET /api/wishlist
|
| Returns the customer's wishlist with
| full product information.
|
*/

router.get(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const wishlist =
        await Wishlist.findOne({
          userId: req.user.userId,
        }).populate({
          path: "products",
          match: {
            isActive: true,
          },
        });

      if (!wishlist) {
        return res.status(200).json({
          products: [],
        });
      }

      return res.status(200).json({
        products:
          wishlist.products || [],
      });
    } catch (error) {
      console.error(
        "Get wishlist error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load your wishlist",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADD PRODUCT
|--------------------------------------------------------------------------
|
| POST /api/wishlist/:productId
|
*/

router.post(
  "/:productId",
  requireAuth,
  validateObjectIdParam("productId"),
  async (req, res) => {
    try {
      const {
        productId,
      } = req.params;

      const product =
        await Product.findOne({
          _id: productId,
          isActive: true,
        });

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found",
        });
      }

      let wishlist =
        await Wishlist.findOne({
          userId: req.user.userId,
        });

      if (!wishlist) {
        wishlist =
          await Wishlist.create({
            userId:
              req.user.userId,
            products: [
              product._id,
            ],
          });
      } else {
        const alreadySaved =
          wishlist.products.some(
            (id) =>
              id.toString() ===
              productId,
          );

        if (!alreadySaved) {
          wishlist.products.push(
            product._id,
          );

          await wishlist.save();
        }
      }

      const populatedWishlist =
        await Wishlist.findOne({
          userId: req.user.userId,
        }).populate({
          path: "products",
          match: {
            isActive: true,
          },
        });

      return res.status(200).json({
        message:
          "Product added to wishlist",
        products:
          populatedWishlist?.products ||
          [],
      });
    } catch (error) {
      console.error(
        "Add wishlist product error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to add product to wishlist",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| REMOVE PRODUCT
|--------------------------------------------------------------------------
|
| DELETE /api/wishlist/:productId
|
*/

router.delete(
  "/:productId",
  requireAuth,
  validateObjectIdParam("productId"),
  async (req, res) => {
    try {
      const {
        productId,
      } = req.params;

      const wishlist =
        await Wishlist.findOne({
          userId: req.user.userId,
        });

      if (!wishlist) {
        return res.status(200).json({
          message:
            "Product removed from wishlist",
          products: [],
        });
      }

      wishlist.products =
        wishlist.products.filter(
          (id) =>
            id.toString() !==
            productId,
        );

      await wishlist.save();

      const populatedWishlist =
        await Wishlist.findOne({
          userId: req.user.userId,
        }).populate({
          path: "products",
          match: {
            isActive: true,
          },
        });

      return res.status(200).json({
        message:
          "Product removed from wishlist",
        products:
          populatedWishlist?.products ||
          [],
      });
    } catch (error) {
      console.error(
        "Remove wishlist product error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to remove product from wishlist",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| CHECK PRODUCT
|--------------------------------------------------------------------------
|
| GET /api/wishlist/:productId/check
|
| Used by the frontend to determine whether
| the heart should appear active.
|
*/

router.get(
  "/:productId/check",
  requireAuth,
  validateObjectIdParam("productId"),
  async (req, res) => {
    try {
      const {
        productId,
      } = req.params;

      const wishlist =
        await Wishlist.findOne({
          userId: req.user.userId,
        }).lean();

      if (!wishlist) {
        return res.status(200).json({
          isWishlisted: false,
        });
      }

      const isWishlisted =
        wishlist.products.some(
          (id) =>
            id.toString() ===
            productId,
        );

      return res.status(200).json({
        isWishlisted,
      });
    } catch (error) {
      console.error(
        "Check wishlist error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to check wishlist",
      });
    }
  },
);

module.exports = router;