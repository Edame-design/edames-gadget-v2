require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const {
  apiLimiter,
  authLimiter,
} = require("./middleware/security");

const app = express();

/*
|--------------------------------------------------------------------------
| ENVIRONMENT CHECK
|--------------------------------------------------------------------------
*/

console.log(
  "MONGO_URI exists:",
  !!process.env.MONGO_URI
);

if (!process.env.JWT_SECRET) {
  console.warn(
    "WARNING: JWT_SECRET is not configured."
  );
}

/*
|--------------------------------------------------------------------------
| SECURITY & MIDDLEWARE
|--------------------------------------------------------------------------
*/

/*
 * Adds security-related HTTP headers.
 */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

/*
 * Allows the frontend to communicate
 * with the backend during development.
 */
app.use(cors());

/*
 * Prevents excessively large JSON
 * request bodies.
 */
app.use(
  express.json({
    limit: "1mb",
  }),
);

/*
 * General API rate limiting.
 *
 * Protects the API from excessive
 * repeated requests.
 */
app.use(
  "/api",
  apiLimiter,
);

/*
|--------------------------------------------------------------------------
| STATIC FILES
|--------------------------------------------------------------------------
|
| Keeps the existing image-serving behavior.
|
*/

app.use(
  express.static(
    path.join(__dirname),
  ),
);

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

const categoryRoutes =
  require("./routes/categoryRoutes");

const cartRoutes =
  require("./routes/cartRoutes");

const productRoutes =
  require("./routes/productRoutes");

const authRoutes =
  require("./routes/authRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const userRoutes =
  require("./routes/userRoutes");

const analyticsRoutes =
  require("./routes/analyticsRoutes");

const accountRoutes =
  require("./routes/accountRoutes");

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/cart",
  cartRoutes,
);

app.use(
  "/api/products",
  productRoutes,
);

app.use(
  "/api/account",
  accountRoutes,
);

/*
 * Authentication routes have an
 * additional, stricter rate limiter.
 */
app.use(
  "/api/auth",
  authLimiter,
  authRoutes,
);

app.use(
  "/api/categories",
  categoryRoutes,
);

app.use(
  "/api/orders",
  orderRoutes,
);

app.use(
  "/api/users",
  userRoutes,
);

app.use(
  "/api/analytics",
  analyticsRoutes,
);

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      status: "ok",
      service:
        "Edame's Gadget API",
      database:
        mongoose.connection
          .readyState === 1
          ? "connected"
          : "disconnected",
    });
  },
);

/*
|--------------------------------------------------------------------------
| MONGODB
|--------------------------------------------------------------------------
*/

if (!process.env.MONGO_URI) {
  console.error(
    "MONGO_URI is missing from the environment."
  );
} else {
  console.log(
    "MongoDB host:",
    process.env.MONGO_URI
      .split("@")[1]
      ?.split("/")[0]
  );

  console.log(
    "MongoDB database:",
    process.env.MONGO_URI
      .split("/")
      .pop()
      ?.split("?")[0]
  );

  mongoose
    .connect(
      process.env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 10000,
      },
    )
    .then(() => {
      console.log(
        "MongoDB Connected"
      );

      console.log(
        "Database:",
        mongoose.connection.name
      );
    })
    .catch((err) => {
      console.error(
        "MongoDB CONNECTION FAILED"
      );

      console.error(
        "Error:",
        err.message
      );
    });
}

/*
|--------------------------------------------------------------------------
| SERVER
|--------------------------------------------------------------------------
*/

const PORT =
  process.env.PORT || 10000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  },
);