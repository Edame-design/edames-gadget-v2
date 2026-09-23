const express = require("express");

const DeliveryZone =
  require("../models/deliveryZone");

const {
  calculateDeliveryFee,
} = require("../services/deliveryService");

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CUSTOMER — CALCULATE DELIVERY FEE
|--------------------------------------------------------------------------
*/

router.get(
  "/quote",
  requireAuth,
  async (req, res) => {
    try {
      const {
        state,
        city,
      } = req.query;

      if (!state || !city) {
        return res.status(400).json({
          message:
            "State and city are required",
        });
      }

      const result =
        await calculateDeliveryFee({
          state,
          city,
        });

      return res.json(result);
    } catch (error) {
      console.error(
        "Delivery quote error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to calculate delivery fee",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — GET ALL DELIVERY PRICES
|--------------------------------------------------------------------------
*/

router.get(
  "/admin",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const zones =
        await DeliveryZone.find()
          .sort({
            type: 1,
            state: 1,
            city: 1,
          });

      return res.json(zones);
    } catch (error) {
      console.error(
        "Get delivery zones error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load delivery pricing",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — CREATE DELIVERY PRICE
|--------------------------------------------------------------------------
*/

router.post(
  "/admin",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        type,
        state,
        city,
        fee,
      } = req.body;

      if (
        !["state", "city"].includes(
          type,
        )
      ) {
        return res.status(400).json({
          message:
            "Delivery pricing type must be state or city",
        });
      }

      if (
        !state ||
        !String(state).trim()
      ) {
        return res.status(400).json({
          message:
            "State is required",
        });
      }

      if (
        type === "city" &&
        (!city ||
          !String(city).trim())
      ) {
        return res.status(400).json({
          message:
            "City is required for city pricing",
        });
      }

      const numericFee =
        Number(fee);

      if (
        !Number.isFinite(
          numericFee,
        ) ||
        numericFee < 0
      ) {
        return res.status(400).json({
          message:
            "Delivery fee must be a valid non-negative number",
        });
      }

      const zone =
        await DeliveryZone.create({
          type,

          state:
            String(state).trim(),

          city:
            type === "city"
              ? String(city).trim()
              : null,

          fee: numericFee,

          isActive: true,
        });

      return res.status(201).json({
        message:
          "Delivery price created successfully",

        zone,
      });
    } catch (error) {
      console.error(
        "Create delivery zone error:",
        error.message,
      );

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          message:
            "A delivery price already exists for this location",
        });
      }

      return res.status(500).json({
        message:
          "Unable to create delivery price",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — UPDATE DELIVERY PRICE
|--------------------------------------------------------------------------
*/

router.put(
  "/admin/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        fee,
        isActive,
      } = req.body;

      const update = {};

      if (fee !== undefined) {
        const numericFee =
          Number(fee);

        if (
          !Number.isFinite(
            numericFee,
          ) ||
          numericFee < 0
        ) {
          return res.status(400).json({
            message:
              "Delivery fee must be a valid non-negative number",
          });
        }

        update.fee =
          numericFee;
      }

      if (
        isActive !== undefined
      ) {
        update.isActive =
          Boolean(isActive);
      }

      const zone =
        await DeliveryZone.findByIdAndUpdate(
          req.params.id,
          update,
          {
            new: true,
            runValidators: true,
          },
        );

      if (!zone) {
        return res.status(404).json({
          message:
            "Delivery price not found",
        });
      }

      return res.json({
        message:
          "Delivery price updated successfully",

        zone,
      });
    } catch (error) {
      console.error(
        "Update delivery zone error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to update delivery price",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — DELETE DELIVERY PRICE
|--------------------------------------------------------------------------
*/

router.delete(
  "/admin/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const zone =
        await DeliveryZone.findByIdAndDelete(
          req.params.id,
        );

      if (!zone) {
        return res.status(404).json({
          message:
            "Delivery price not found",
        });
      }

      return res.json({
        message:
          "Delivery price deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete delivery zone error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to delete delivery price",
      });
    }
  },
);

module.exports = router;