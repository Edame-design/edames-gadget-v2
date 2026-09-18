const express = require("express");
const mongoose = require("mongoose");

const Cart = require("../models/cart");
const Product = require("../models/product");

const {
  requireAuth,
} = require("../middleware/auth");

const {
  validateObjectIdParam,
} = require("../middleware/validation");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET CURRENT CUSTOMER CART
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const cart =
        await Cart.findOne({
          userId: req.user.userId,
        }).populate(
          "items.productId",
        );

      if (!cart) {
        return res.status(200).json({
          _id: null,
          userId: req.user.userId,
          items: [],
        });
      }

      return res.status(200).json(
        cart,
      );
    } catch (error) {
      console.error(
        "Get cart error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load cart",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADD ITEM TO CART
|--------------------------------------------------------------------------
*/

router.post(
  "/items",
  requireAuth,
  async (req, res) => {
    try {
      const {
        productId,
        quantity = 1,
      } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          productId,
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid product ID",
        });
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 100000
      ) {
        return res.status(400).json({
          message:
            "Quantity must be a positive integer",
        });
      }

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

      let cart =
        await Cart.findOne({
          userId: req.user.userId,
        });

      if (!cart) {
        cart = new Cart({
          userId:
            req.user.userId,
          items: [],
        });
      }

      const existingItem =
        cart.items.find(
          (item) =>
            item.productId.toString() ===
            productId,
        );

      const currentQuantity =
        existingItem
          ? existingItem.quantity
          : 0;

      const newQuantity =
        currentQuantity + quantity;

      if (
        newQuantity >
        product.stock
      ) {
        return res.status(400).json({
          message:
            `Only ${product.stock} units of this product are available`,
        });
      }

      if (existingItem) {
        existingItem.quantity =
          newQuantity;
      } else {
        cart.items.push({
          productId,
          quantity,
        });
      }

      await cart.save();

      await cart.populate(
        "items.productId",
      );

      return res.status(200).json(
        cart,
      );
    } catch (error) {
      console.error(
        "Add cart item error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to add item to cart",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| UPDATE CART ITEM
|--------------------------------------------------------------------------
*/

router.put(
  "/items/:productId",
  requireAuth,
  validateObjectIdParam(
    "productId",
  ),
  async (req, res) => {
    try {
      const {
        productId,
      } = req.params;

      const {
        quantity,
      } = req.body;

      if (
        !Number.isInteger(quantity) ||
        quantity < 0 ||
        quantity > 100000
      ) {
        return res.status(400).json({
          message:
            "Quantity must be a non-negative integer",
        });
      }

      const cart =
        await Cart.findOne({
          userId: req.user.userId,
        });

      if (!cart) {
        return res.status(404).json({
          message:
            "Cart not found",
        });
      }

      const itemIndex =
        cart.items.findIndex(
          (item) =>
            item.productId.toString() ===
            productId,
        );

      if (itemIndex === -1) {
        return res.status(404).json({
          message:
            "Cart item not found",
        });
      }

      if (quantity === 0) {
        cart.items.splice(
          itemIndex,
          1,
        );

        await cart.save();

        await cart.populate(
          "items.productId",
        );

        return res.status(200).json(
          cart,
        );
      }

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

      if (
        quantity >
        product.stock
      ) {
        return res.status(400).json({
          message:
            `Only ${product.stock} units of this product are available`,
        });
      }

      cart.items[
        itemIndex
      ].quantity = quantity;

      await cart.save();

      await cart.populate(
        "items.productId",
      );

      return res.status(200).json(
        cart,
      );
    } catch (error) {
      console.error(
        "Update cart item error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to update cart item",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| REMOVE ITEM FROM CART
|--------------------------------------------------------------------------
*/

router.delete(
  "/items/:productId",
  requireAuth,
  validateObjectIdParam(
    "productId",
  ),
  async (req, res) => {
    try {
      const {
        productId,
      } = req.params;

      const cart =
        await Cart.findOne({
          userId: req.user.userId,
        });

      if (!cart) {
        return res.status(404).json({
          message:
            "Cart not found",
        });
      }

      const originalLength =
        cart.items.length;

      cart.items =
        cart.items.filter(
          (item) =>
            item.productId.toString() !==
            productId,
        );

      if (
        cart.items.length ===
        originalLength
      ) {
        return res.status(404).json({
          message:
            "Cart item not found",
        });
      }

      await cart.save();

      await cart.populate(
        "items.productId",
      );

      return res.status(200).json(
        cart,
      );
    } catch (error) {
      console.error(
        "Remove cart item error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to remove cart item",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| CLEAR CURRENT CUSTOMER CART
|--------------------------------------------------------------------------
*/

router.delete(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const cart =
        await Cart.findOne({
          userId: req.user.userId,
        });

      if (!cart) {
        return res.status(200).json({
          _id: null,
          userId:
            req.user.userId,
          items: [],
        });
      }

      cart.items = [];

      await cart.save();

      return res.status(200).json(
        cart,
      );
    } catch (error) {
      console.error(
        "Clear cart error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to clear cart",
      });
    }
  },
);

module.exports = router;