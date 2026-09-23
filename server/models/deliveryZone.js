const mongoose = require("mongoose");

const deliveryZoneSchema =
  new mongoose.Schema(
    {
      type: {
        type: String,
        enum: [
          "state",
          "city",
        ],
        required: true,
        index: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        trim: true,
        default: null,
      },

      fee: {
        type: Number,
        required: true,
        min: 0,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    },
  );

deliveryZoneSchema.index(
  {
    type: 1,
    state: 1,
    city: 1,
  },
  {
    unique: true,
  },
);

module.exports =
  mongoose.model(
    "DeliveryZone",
    deliveryZoneSchema,
  );