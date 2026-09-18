const express = require("express");

const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");

const {
  requireAuth,
  requireAdmin
} = require("../middleware/auth");

const router = express.Router();

router.get(
  "/admin/overview",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const [
        productCount,
        customerCount,
        orderCount,
        revenueResult,
        unitsResult,
        statusResult,
        recentOrders,
        topProducts
      ] = await Promise.all([
        Product.countDocuments({
          isActive: true
        }),

        User.countDocuments({
          role: "customer"
        }),

        Order.countDocuments(),

        Order.aggregate([
          {
            $match: {
              status: {
                $ne: "cancelled"
              }
            }
          },
          {
            $group: {
              _id: null,
              revenue: {
                $sum: "$total"
              }
            }
          }
        ]),

        Order.aggregate([
          {
            $match: {
              status: {
                $ne: "cancelled"
              }
            }
          },
          {
            $unwind: "$items"
          },
          {
            $group: {
              _id: null,
              units: {
                $sum: "$items.quantity"
              }
            }
          }
        ]),

        Order.aggregate([
          {
            $group: {
              _id: "$status",
              count: {
                $sum: 1
              }
            }
          }
        ]),

        Order.find()
          .populate(
            "userId",
            "name email"
          )
          .sort({
            createdAt: -1
          })
          .limit(5)
          .select(
            "userId total status paymentStatus createdAt items"
          ),

        Order.aggregate([
          {
            $match: {
              status: {
                $ne: "cancelled"
              }
            }
          },
          {
            $unwind: "$items"
          },
          {
            $group: {
              _id: "$items.productId",

              name: {
                $first: "$items.name"
              },

              unitsSold: {
                $sum: "$items.quantity"
              },

              revenue: {
                $sum: "$items.subtotal"
              }
            }
          },
          {
            $sort: {
              unitsSold: -1
            }
          },
          {
            $limit: 5
          }
        ])
      ]);

      const revenue =
        revenueResult[0]?.revenue || 0;

      const unitsSold =
        unitsResult[0]?.units || 0;

      const orderStatuses = {
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      };

      for (const item of statusResult) {
        if (
          Object.prototype.hasOwnProperty.call(
            orderStatuses,
            item._id
          )
        ) {
          orderStatuses[item._id] =
            item.count;
        }
      }

      return res.json({
        overview: {
          revenue,
          orders: orderCount,
          customers: customerCount,
          products: productCount,
          unitsSold
        },

        orderStatuses,

        recentOrders,

        topProducts
      });
    } catch (error) {
      console.error(
        "Get analytics overview error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load analytics"
      });
    }
  }
);

module.exports = router;