const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    image: {
      type: String,
      default: ""
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return (
            Array.isArray(items) &&
            items.length > 0
          );
        },
        message:
          "Order must contain at least one item"
      }
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    // --------------------------------------------------
    // DELIVERY
    // --------------------------------------------------

    deliveryMethod: {
      type: String,
      enum: [
        "pickup",
        "delivery"
      ],
      default: "delivery"
    },

    deliveryState: {
      type: String,
      trim: true,
      default: null
    },

    deliveryCity: {
      type: String,
      trim: true,
      default: null
    },

    deliveryZoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryZone",
      default: null
    },

    estimatedDeliveryFee: {
      type: Number,
      min: 0,
      default: 0
    },

    quotedDeliveryFee: {
      type: Number,
      min: 0,
      default: null
    },

    finalDeliveryFee: {
      type: Number,
      min: 0,
      default: 0
    },

    deliveryFeeStatus: {
      type: String,
      enum: [
        "not_required",
        "estimated",
        "quote_required",
        "quoted",
        "finalized"
      ],
      default: "not_required"
    },

    deliveryPaymentStatus: {
      type: String,
      enum: [
        "not_required",
        "pending",
        "paid",
        "refunded"
      ],
      default: "not_required"
    },

    // --------------------------------------------------
    // EXISTING SHIPPING FEE
    // --------------------------------------------------

    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    total: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ],
      default: "pending"
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded"
      ],
      default: "pending"
    },

    paymentMethod: {
      type: String,
      enum: [
        "cash_on_delivery",
        "bank_transfer",
        "online"
      ],
      default: "cash_on_delivery"
    },

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      },

      phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30
      },

      address: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
      },

      city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      },

      state: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Order",
  orderSchema
);