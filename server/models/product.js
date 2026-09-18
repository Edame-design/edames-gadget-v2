const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | BASIC PRODUCT INFORMATION
    |--------------------------------------------------------------------------
    */

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 220
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000
    },

    /*
    |--------------------------------------------------------------------------
    | PRICING
    |--------------------------------------------------------------------------
    */

    price: {
      type: Number,
      required: true,
      min: 0
    },

    /*
    |--------------------------------------------------------------------------
    | IMAGE
    |--------------------------------------------------------------------------
    |
    | For now this stores the image path/URL.
    |
    | Later:
    | Admin uploads image
    |       ↓
    | Image storage
    |       ↓
    | URL returned
    |       ↓
    | MongoDB stores URL here
    |
    */

    image: {
      type: String,
      default: ""
    },

    /*
    |--------------------------------------------------------------------------
    | CATEGORY
    |--------------------------------------------------------------------------
    |
    | We are temporarily keeping this as a string.
    | Later we will create a dedicated Category model.
    |
    */

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    /*
    |--------------------------------------------------------------------------
    | INVENTORY
    |--------------------------------------------------------------------------
    */

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },

    /*
    |--------------------------------------------------------------------------
    | PRODUCT STATUS
    |--------------------------------------------------------------------------
    |
    | false means archived.
    |
    | We archive products instead of permanently deleting
    | them so historical orders remain meaningful.
    |
    */

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Product",
  productSchema
);