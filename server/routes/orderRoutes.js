const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/order");
const Product = require("../models/product");

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/auth");

const {
  validateObjectIdParam,
} = require("../middleware/validation");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const ALLOWED_PAYMENT_METHODS = [
  "cash_on_delivery",
  "bank_transfer",
  "online",
];

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const ALLOWED_TRANSITIONS = {
  pending: [
    "confirmed",
    "cancelled",
  ],

  confirmed: [
    "processing",
    "cancelled",
  ],

  processing: [
    "shipped",
    "cancelled",
  ],

  shipped: [
    "delivered",
  ],

  delivered: [],

  cancelled: [],
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function isValidObjectId(value) {
  return (
    typeof value === "string" &&
    mongoose.Types.ObjectId.isValid(
      value,
    )
  );
}

function cleanString(value) {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function isNonEmptyString(
  value,
  maxLength = 255,
) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <=
      maxLength
  );
}

function isPositiveInteger(
  value,
) {
  return (
    Number.isInteger(value) &&
    value > 0
  );
}

function validateShippingAddress(
  shippingAddress,
) {
  const errors = [];

  if (
    !shippingAddress ||
    typeof shippingAddress !==
      "object" ||
    Array.isArray(shippingAddress)
  ) {
    return [
      "Shipping address is required",
    ];
  }

  if (
    !isNonEmptyString(
      shippingAddress.fullName,
      100,
    )
  ) {
    errors.push(
      "Shipping full name is required",
    );
  }

  if (
    !isNonEmptyString(
      shippingAddress.phone,
      30,
    )
  ) {
    errors.push(
      "Shipping phone number is required",
    );
  }

  if (
    !isNonEmptyString(
      shippingAddress.address,
      300,
    )
  ) {
    errors.push(
      "Shipping address is required",
    );
  }

  if (
    !isNonEmptyString(
      shippingAddress.city,
      100,
    )
  ) {
    errors.push(
      "Shipping city is required",
    );
  }

  if (
    !isNonEmptyString(
      shippingAddress.state,
      100,
    )
  ) {
    errors.push(
      "Shipping state is required",
    );
  }

  return errors;
}

function validateCheckoutBody(
  body,
) {
  const errors = [];

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return [
      "Request body must be an object",
    ];
  }

  const {
    items,
    shippingAddress,
    paymentMethod,
  } = body;

  /*
  |--------------------------------------------------------------------------
  | ITEMS
  |--------------------------------------------------------------------------
  */

  if (
    !Array.isArray(items)
  ) {
    errors.push(
      "Order items must be an array",
    );
  } else if (
    items.length === 0
  ) {
    errors.push(
      "Order must contain at least one item",
    );
  } else if (
    items.length > 100
  ) {
    errors.push(
      "Order cannot contain more than 100 different items",
    );
  } else {
    const productIds =
      new Set();

    items.forEach(
      (item, index) => {
        if (
          !item ||
          typeof item !==
            "object" ||
          Array.isArray(item)
        ) {
          errors.push(
            `Item ${index + 1} is invalid`,
          );

          return;
        }

        if (
          !isValidObjectId(
            item.productId,
          )
        ) {
          errors.push(
            `Item ${index + 1} has an invalid product ID`,
          );
        } else {
          if (
            productIds.has(
              item.productId,
            )
          ) {
            errors.push(
              `Item ${index + 1} contains a duplicate product`,
            );
          }

          productIds.add(
            item.productId,
          );
        }

        if (
          !isPositiveInteger(
            item.quantity,
          )
        ) {
          errors.push(
            `Item ${index + 1} quantity must be a positive integer`,
          );
        }

        /*
        |--------------------------------------------------------------------------
        | DEFENSIVE QUANTITY LIMIT
        |--------------------------------------------------------------------------
        |
        | The customer should never be able to request an absurd quantity.
        |
        */

        if (
          Number.isInteger(
            item.quantity,
          ) &&
          item.quantity > 100000
        ) {
          errors.push(
            `Item ${index + 1} quantity exceeds the maximum allowed`,
          );
        }
      },
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SHIPPING
  |--------------------------------------------------------------------------
  */

  errors.push(
    ...validateShippingAddress(
      shippingAddress,
    ),
  );

  /*
  |--------------------------------------------------------------------------
  | PAYMENT METHOD
  |--------------------------------------------------------------------------
  */

  if (
    !ALLOWED_PAYMENT_METHODS.includes(
      paymentMethod,
    )
  ) {
    errors.push(
      "Invalid payment method",
    );
  }

  return errors;
}

/*
|--------------------------------------------------------------------------
| CUSTOMER — CREATE ORDER
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Price, product name and image are NEVER trusted from the client.
|
| The client only tells us:
|
|   productId
|   quantity
|
| The server gets the real product information from MongoDB.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  requireAuth,
  async (req, res) => {
    const validationErrors =
      validateCheckoutBody(
        req.body,
      );

    if (
      validationErrors.length > 0
    ) {
      return res.status(400).json({
        message:
          "Order validation failed",
        errors:
          validationErrors,
      });
    }

    const {
      items,
      shippingAddress,
      paymentMethod,
    } = req.body;

    const session =
      await mongoose.startSession();

    try {
      let createdOrder = null;

      await session.withTransaction(
        async () => {
          /*
          |--------------------------------------------------------------------------
          | LOAD PRODUCTS FROM DATABASE
          |--------------------------------------------------------------------------
          */

          const productIds =
            items.map(
              (item) =>
                item.productId,
            );

          const products =
            await Product.find({
              _id: {
                $in: productIds,
              },
              isActive: true,
            }).session(session);

          /*
          |--------------------------------------------------------------------------
          | VERIFY EVERY PRODUCT EXISTS
          |--------------------------------------------------------------------------
          */

          if (
            products.length !==
            productIds.length
          ) {
            throw new Error(
              "One or more products are unavailable",
            );
          }

          const productMap =
            new Map(
              products.map(
                (product) => [
                  product._id.toString(),
                  product,
                ],
              ),
            );

          const orderItems = [];

          let subtotal = 0;

          /*
          |--------------------------------------------------------------------------
          | VERIFY STOCK + BUILD SNAPSHOTS
          |--------------------------------------------------------------------------
          */

          for (
            const item of items
          ) {
            const product =
              productMap.get(
                item.productId,
              );

            if (!product) {
              throw new Error(
                "One or more products are unavailable",
              );
            }

            if (
              product.stock <
              item.quantity
            ) {
              throw new Error(
                `Insufficient stock for ${product.name}`,
              );
            }

            const itemSubtotal =
              product.price *
              item.quantity;

            subtotal +=
              itemSubtotal;

            /*
            |--------------------------------------------------------------------------
            | SNAPSHOT PRODUCT INFORMATION
            |--------------------------------------------------------------------------
            |
            | This protects historical orders from future product changes.
            |
            */

            orderItems.push({
              productId:
                product._id,

              name:
                product.name,

              image:
                product.image,

              price:
                product.price,

              quantity:
                item.quantity,

              subtotal:
                itemSubtotal,
            });
          }

          /*
          |--------------------------------------------------------------------------
          | SHIPPING FEE
          |--------------------------------------------------------------------------
          |
          | Current system uses a fixed shipping fee.
          | This can later become location-based.
          |
          */

          const shippingFee = 0;

          const total =
            subtotal +
            shippingFee;

          /*
          |--------------------------------------------------------------------------
          | CREATE ORDER
          |--------------------------------------------------------------------------
          */

          const orders =
            await Order.create(
              [
                {
                  userId:
                    req.user.userId,

                  items:
                    orderItems,

                  subtotal,

                  shippingFee,

                  total,

                  status:
                    "pending",

                  paymentStatus:
                    "pending",

                  paymentMethod,

                  shippingAddress: {
                    fullName:
                      cleanString(
                        shippingAddress.fullName,
                      ),

                    phone:
                      cleanString(
                        shippingAddress.phone,
                      ),

                    address:
                      cleanString(
                        shippingAddress.address,
                      ),

                    city:
                      cleanString(
                        shippingAddress.city,
                      ),

                    state:
                      cleanString(
                        shippingAddress.state,
                      ),
                  },
                },
              ],
              {
                session,
              },
            );

          createdOrder =
            orders[0];

          /*
          |--------------------------------------------------------------------------
          | REDUCE STOCK
          |--------------------------------------------------------------------------
          */

          for (
            const item of items
          ) {
            const updatedProduct =
              await Product.findOneAndUpdate(
                {
                  _id:
                    item.productId,

                  isActive:
                    true,

                  stock: {
                    $gte:
                      item.quantity,
                  },
                },
                {
                  $inc: {
                    stock:
                      -item.quantity,
                  },
                },
                {
                  new: true,
                  session,
                },
              );

            if (
              !updatedProduct
            ) {
              throw new Error(
                "Stock changed while processing your order. Please try again.",
              );
            }
          }
        },
      );

      return res.status(201).json(
        createdOrder,
      );
    } catch (error) {
      console.error(
        "Create order error:",
        error.message,
      );

      /*
      |--------------------------------------------------------------------------
      | USER-FACING VALIDATION / BUSINESS ERRORS
      |--------------------------------------------------------------------------
      */

      const knownErrors = [
        "One or more products are unavailable",
        "Stock changed while processing your order. Please try again.",
      ];

      if (
        knownErrors.includes(
          error.message,
        ) ||
        error.message.startsWith(
          "Insufficient stock for ",
        )
      ) {
        return res.status(409).json({
          message:
            error.message,
        });
      }

      return res.status(500).json({
        message:
          "Unable to create order",
      });
    } finally {
      await session.endSession();
    }
  },
);

/*
|--------------------------------------------------------------------------
| CUSTOMER — GET MY ORDERS
|--------------------------------------------------------------------------
*/

router.get(
  "/my",
  requireAuth,
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          userId:
            req.user.userId,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json(
        orders,
      );
    } catch (error) {
      console.error(
        "Get customer orders error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load your orders",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| CUSTOMER — GET SINGLE OWN ORDER
|--------------------------------------------------------------------------
*/

router.get(
  "/my/:id",
  requireAuth,
  validateObjectIdParam("id"),
  async (req, res) => {
    try {
      const order =
        await Order.findOne({
          _id: req.params.id,
          userId:
            req.user.userId,
        });

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      return res.status(200).json(
        order,
      );
    } catch (error) {
      console.error(
        "Get customer order error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load order",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — GET ALL ORDERS
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const orders =
        await Order.find()
          .populate(
            "userId",
            "name email",
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json(
        orders,
      );
    } catch (error) {
      console.error(
        "Get admin orders error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load orders",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — GET SINGLE ORDER
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/:id",
  requireAuth,
  requireAdmin,
  validateObjectIdParam("id"),
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id,
        ).populate(
          "userId",
          "name email",
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      return res.status(200).json(
        order,
      );
    } catch (error) {
      console.error(
        "Get admin order error:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to load order",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN — UPDATE ORDER STATUS
|--------------------------------------------------------------------------
*/

router.put(
  "/admin/:id/status",
  requireAuth,
  requireAdmin,
  validateObjectIdParam("id"),
  async (req, res) => {
    const {
      status,
    } = req.body;

    if (
      typeof status !==
        "string" ||
      !ORDER_STATUSES.includes(
        status,
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid order status",
      });
    }

    const session =
      await mongoose.startSession();

    try {
      let updatedOrder = null;

      await session.withTransaction(
        async () => {
          const order =
            await Order.findById(
              req.params.id,
            ).session(session);

          if (!order) {
            throw new Error(
              "ORDER_NOT_FOUND",
            );
          }

          const currentStatus =
            order.status;

          if (
            currentStatus ===
            status
          ) {
            throw new Error(
              "ORDER_ALREADY_STATUS",
            );
          }

          const allowedNextStatuses =
            ALLOWED_TRANSITIONS[
              currentStatus
            ] || [];

          if (
            !allowedNextStatuses.includes(
              status,
            )
          ) {
            throw new Error(
              `ORDER_INVALID_TRANSITION:${currentStatus}:${status}`,
            );
          }

          /*
          |--------------------------------------------------------------------------
          | CANCELLATION
          |--------------------------------------------------------------------------
          |
          | Restore stock when an order is cancelled.
          |
          */

          if (
            status ===
              "cancelled"
          ) {
            for (
              const item of order.items
            ) {
              await Product.findByIdAndUpdate(
                item.productId,
                {
                  $inc: {
                    stock:
                      item.quantity,
                  },
                },
                {
                  session,
                },
              );
            }
          }

          order.status =
            status;

          /*
          |--------------------------------------------------------------------------
          | PAYMENT STATUS
          |--------------------------------------------------------------------------
          |
          | Cancelling an order does not automatically mean a payment was
          | refunded. A real payment gateway will control this later.
          |
          */

          if (
            status ===
              "cancelled" &&
            order.paymentStatus ===
              "paid"
          ) {
            /*
            |--------------------------------------------------------------------------
            | TODO:
            |
            | Connect payment provider refund logic here.
            |--------------------------------------------------------------------------
            */
          }

          updatedOrder =
            await order.save({
              session,
            });
        },
      );

      return res.status(200).json(
        updatedOrder,
      );
    } catch (error) {
      console.error(
        "Update order status error:",
        error.message,
      );

      if (
        error.message ===
        "ORDER_NOT_FOUND"
      ) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      if (
        error.message ===
        "ORDER_ALREADY_STATUS"
      ) {
        return res.status(400).json({
          message:
            "Order already has this status",
        });
      }

      if (
        error.message.startsWith(
          "ORDER_INVALID_TRANSITION:",
        )
      ) {
        return res.status(409).json({
          message:
            "This order status transition is not allowed",
        });
      }

      return res.status(500).json({
        message:
          "Unable to update order status",
      });
    } finally {
      await session.endSession();
    }
  },
);

/*
|--------------------------------------------------------------------------
| CUSTOMER — CANCEL OWN ORDER
|--------------------------------------------------------------------------
*/

router.put(
  "/my/:id/cancel",
  requireAuth,
  validateObjectIdParam("id"),
  async (req, res) => {
    const session =
      await mongoose.startSession();

    try {
      let cancelledOrder =
        null;

      await session.withTransaction(
        async () => {
          const order =
            await Order.findOne({
              _id: req.params.id,
              userId:
                req.user.userId,
            }).session(session);

          if (!order) {
            throw new Error(
              "ORDER_NOT_FOUND",
            );
          }

          if (
            ![
              "pending",
              "confirmed",
            ].includes(
              order.status,
            )
          ) {
            throw new Error(
              "ORDER_CANNOT_CANCEL",
            );
          }

          /*
          |--------------------------------------------------------------------------
          | RESTORE STOCK
          |--------------------------------------------------------------------------
          */

          for (
            const item of order.items
          ) {
            await Product.findByIdAndUpdate(
              item.productId,
              {
                $inc: {
                  stock:
                    item.quantity,
                },
              },
              {
                session,
              },
            );
          }

          order.status =
            "cancelled";

          /*
          |--------------------------------------------------------------------------
          | PAYMENT
          |--------------------------------------------------------------------------
          |
          | Payment refund remains separate from cancellation.
          |
          */

          cancelledOrder =
            await order.save({
              session,
            });
        },
      );

      return res.status(200).json(
        cancelledOrder,
      );
    } catch (error) {
      console.error(
        "Customer cancellation error:",
        error.message,
      );

      if (
        error.message ===
        "ORDER_NOT_FOUND"
      ) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      if (
        error.message ===
        "ORDER_CANNOT_CANCEL"
      ) {
        return res.status(409).json({
          message:
            "This order can no longer be cancelled",
        });
      }

      return res.status(500).json({
        message:
          "Unable to cancel order",
      });
    } finally {
      await session.endSession();
    }
  },
);

module.exports = router;