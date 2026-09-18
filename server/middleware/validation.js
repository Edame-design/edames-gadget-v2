/*
|--------------------------------------------------------------------------
| REQUEST VALIDATION HELPERS
|--------------------------------------------------------------------------
|
| This file contains reusable validation helpers for API requests.
|
| Validation answers:
|
| "Is the data being sent to this endpoint acceptable?"
|
| It does NOT replace authentication or authorization.
|
| Authentication:
|   Who are you?
|
| Authorization:
|   Are you allowed to do this?
|
| Validation:
|   Is the data you're sending valid?
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| BASIC HELPERS
|--------------------------------------------------------------------------
*/

/**
 * Check whether a value is a non-empty string.
 */
function isNonEmptyString(
  value,
) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

/**
 * Check whether a value is a valid string
 * within a specified length range.
 */
function isValidString(
  value,
  minLength = 1,
  maxLength = 255,
) {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const cleanValue =
    value.trim();

  return (
    cleanValue.length >=
      minLength &&
    cleanValue.length <=
      maxLength
  );
}

/**
 * Check whether a value is a
 * non-negative finite number.
 */
function isNonNegativeNumber(
  value,
) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

/**
 * Check whether a value is a
 * positive integer.
 */
function isPositiveInteger(
  value,
) {
  return (
    Number.isInteger(value) &&
    value > 0
  );
}

/**
 * Check whether a value is a
 * non-negative integer.
 */
function isNonNegativeInteger(
  value,
) {
  return (
    Number.isInteger(value) &&
    value >= 0
  );
}

/**
 * Check whether a value is a valid
 * MongoDB ObjectId.
 */
function isValidObjectId(
  value,
) {
  return (
    typeof value === "string" &&
    /^[a-fA-F0-9]{24}$/.test(
      value,
    )
  );
}

/**
 * Check whether a value looks like
 * a valid email address.
 */
function isValidEmail(
  value,
) {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const email =
    value.trim();

  if (
    email.length > 254
  ) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

/**
 * Check whether a value is a valid
 * URL-friendly slug.
 *
 * Examples:
 *
 * iphone-15-pro
 * samsung-galaxy-s24
 * wireless-earbuds
 */
function isValidSlug(
  value,
) {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const slug =
    value.trim();

  if (
    slug.length < 1 ||
    slug.length > 220
  ) {
    return false;
  }

  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
    slug,
  );
}

/*
|--------------------------------------------------------------------------
| PASSWORD VALIDATION
|--------------------------------------------------------------------------
*/

/**
 * Validate a password.
 *
 * The current application requires
 * at least 8 characters.
 */
function isValidPassword(
  value,
) {
  return (
    typeof value === "string" &&
    value.length >= 8 &&
    value.length <= 128
  );
}

/*
|--------------------------------------------------------------------------
| GENERIC VALIDATION MIDDLEWARE
|--------------------------------------------------------------------------
|
| Usage:
|
| router.post(
|   "/example",
|   validateRequest((req) => {
|     const errors = [];
|
|     if (!isNonEmptyString(req.body.name)) {
|       errors.push("Name is required");
|     }
|
|     return errors;
|   }),
|   handler
| );
|
|--------------------------------------------------------------------------
*/

function validateRequest(
  validator,
) {
  return (
    req,
    res,
    next,
  ) => {
    try {
      const errors =
        validator(req);

      /*
       * A validator must return
       * an array of error messages.
       */
      if (
        !Array.isArray(errors)
      ) {
        console.error(
          "Validation middleware error: validator must return an array",
        );

        return res.status(500).json({
          message:
            "Request validation configuration error",
        });
      }

      /*
       * If validation errors exist,
       * stop the request before it
       * reaches the route handler.
       */
      if (
        errors.length > 0
      ) {
        return res.status(400).json({
          message:
            "Request validation failed",
          errors,
        });
      }

      next();
    } catch (error) {
      console.error(
        "Request validation error:",
        error.message,
      );

      return res.status(400).json({
        message:
          "Invalid request data",
      });
    }
  };
}

/*
|--------------------------------------------------------------------------
| PRODUCT VALIDATION
|--------------------------------------------------------------------------
*/

/**
 * Validate data used when creating
 * a product.
 */
function validateProductCreate(
  req,
  res,
  next,
) {
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

  const errors = [];

  if (
    !isValidString(
      name,
      1,
      200,
    )
  ) {
    errors.push(
      "Product name must be between 1 and 200 characters",
    );
  }

  if (!isValidSlug(slug)) {
    errors.push(
      "Product slug must contain only lowercase letters, numbers and hyphens",
    );
  }

  if (
    description !==
      undefined &&
    !isValidString(
      description,
      0,
      5000,
    )
  ) {
    errors.push(
      "Product description must not exceed 5000 characters",
    );
  }

  if (
    !isNonNegativeNumber(
      price,
    )
  ) {
    errors.push(
      "Product price must be a non-negative number",
    );
  }

  if (
    image !== undefined &&
    typeof image !== "string"
  ) {
    errors.push(
      "Product image must be a string",
    );
  }

  if (
    !isValidString(
      category,
      1,
      100,
    )
  ) {
    errors.push(
      "Product category must be between 1 and 100 characters",
    );
  }

  if (
    !isNonNegativeInteger(
      stock,
    )
  ) {
    errors.push(
      "Product stock must be a non-negative integer",
    );
  }

  if (
    isActive !== undefined &&
    typeof isActive !== "boolean"
  ) {
    errors.push(
      "Product active status must be a boolean",
    );
  }

  if (
    errors.length > 0
  ) {
    return res.status(400).json({
      message:
        "Product validation failed",
      errors,
    });
  }

  next();
}

/**
 * Validate data used when updating
 * a product.
 *
 * Unlike creation, fields are optional.
 */
function validateProductUpdate(
  req,
  res,
  next,
) {
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

  const errors = [];

  if (
    name !== undefined &&
    !isValidString(
      name,
      1,
      200,
    )
  ) {
    errors.push(
      "Product name must be between 1 and 200 characters",
    );
  }

  if (
    slug !== undefined &&
    !isValidSlug(slug)
  ) {
    errors.push(
      "Product slug must contain only lowercase letters, numbers and hyphens",
    );
  }

  if (
    description !==
      undefined &&
    !isValidString(
      description,
      0,
      5000,
    )
  ) {
    errors.push(
      "Product description must not exceed 5000 characters",
    );
  }

  if (
    price !== undefined &&
    !isNonNegativeNumber(
      price,
    )
  ) {
    errors.push(
      "Product price must be a non-negative number",
    );
  }

  if (
    image !== undefined &&
    typeof image !== "string"
  ) {
    errors.push(
      "Product image must be a string",
    );
  }

  if (
    category !== undefined &&
    !isValidString(
      category,
      1,
      100,
    )
  ) {
    errors.push(
      "Product category must be between 1 and 100 characters",
    );
  }

  if (
    stock !== undefined &&
    !isNonNegativeInteger(
      stock,
    )
  ) {
    errors.push(
      "Product stock must be a non-negative integer",
    );
  }

  if (
    isActive !== undefined &&
    typeof isActive !== "boolean"
  ) {
    errors.push(
      "Product active status must be a boolean",
    );
  }

  if (
    errors.length > 0
  ) {
    return res.status(400).json({
      message:
        "Product validation failed",
      errors,
    });
  }

  next();
}

/*
|--------------------------------------------------------------------------
| CATEGORY VALIDATION
|--------------------------------------------------------------------------
*/

/**
 * Validate category creation.
 */
function validateCategoryCreate(
  req,
  res,
  next,
) {
  const {
    name,
    slug,
    description,
    isActive,
  } = req.body;

  const errors = [];

  if (
    !isValidString(
      name,
      1,
      100,
    )
  ) {
    errors.push(
      "Category name must be between 1 and 100 characters",
    );
  }

  if (!isValidSlug(slug)) {
    errors.push(
      "Category slug must contain only lowercase letters, numbers and hyphens",
    );
  }

  if (
    description !==
      undefined &&
    !isValidString(
      description,
      0,
      500,
    )
  ) {
    errors.push(
      "Category description must not exceed 500 characters",
    );
  }

  if (
    isActive !== undefined &&
    typeof isActive !== "boolean"
  ) {
    errors.push(
      "Category active status must be a boolean",
    );
  }

  if (
    errors.length > 0
  ) {
    return res.status(400).json({
      message:
        "Category validation failed",
      errors,
    });
  }

  next();
}

/**
 * Validate category updates.
 */
function validateCategoryUpdate(
  req,
  res,
  next,
) {
  const {
    name,
    slug,
    description,
    isActive,
  } = req.body;

  const errors = [];

  if (
    name !== undefined &&
    !isValidString(
      name,
      1,
      100,
    )
  ) {
    errors.push(
      "Category name must be between 1 and 100 characters",
    );
  }

  if (
    slug !== undefined &&
    !isValidSlug(slug)
  ) {
    errors.push(
      "Category slug must contain only lowercase letters, numbers and hyphens",
    );
  }

  if (
    description !==
      undefined &&
    !isValidString(
      description,
      0,
      500,
    )
  ) {
    errors.push(
      "Category description must not exceed 500 characters",
    );
  }

  if (
    isActive !== undefined &&
    typeof isActive !== "boolean"
  ) {
    errors.push(
      "Category active status must be a boolean",
    );
  }

  if (
    errors.length > 0
  ) {
    return res.status(400).json({
      message:
        "Category validation failed",
      errors,
    });
  }

  next();
}

/*
|--------------------------------------------------------------------------
| ID VALIDATION
|--------------------------------------------------------------------------
*/

/**
 * Validate a MongoDB ObjectId from
 * the request parameters.
 */
function validateObjectIdParam(
  paramName,
) {
  return (
    req,
    res,
    next,
  ) => {
    const value =
      req.params[paramName];

    if (
      !isValidObjectId(value)
    ) {
      return res.status(400).json({
        message:
          `Invalid ${paramName}`,
      });
    }

    next();
  };
}

/*
|--------------------------------------------------------------------------
| AUTHENTICATION VALIDATION
|--------------------------------------------------------------------------
*/

/**
 * Validate registration data.
 */
function validateRegistration(
  req,
  res,
  next,
) {
  const {
    name,
    email,
    password,
  } = req.body;

  const errors = [];

  if (
    !isValidString(
      name,
      1,
      100,
    )
  ) {
    errors.push(
      "Name must be between 1 and 100 characters",
    );
  }

  if (!isValidEmail(email)) {
    errors.push(
      "A valid email address is required",
    );
  }

  if (!isValidPassword(password)) {
    errors.push(
      "Password must be between 8 and 128 characters",
    );
  }

  if (
    errors.length > 0
  ) {
    return res.status(400).json({
      message:
        "Registration validation failed",
      errors,
    });
  }

  next();
}

/**
 * Validate login data.
 */
function validateLogin(
  req,
  res,
  next,
) {
  const {
    email,
    password,
  } = req.body;

  const errors = [];

  if (!isValidEmail(email)) {
    errors.push(
      "A valid email address is required",
    );
  }

  if (
    typeof password !==
      "string" ||
    password.length === 0
  ) {
    errors.push(
      "Password is required",
    );
  }

  if (
    errors.length > 0
  ) {
    return res.status(400).json({
      message:
        "Login validation failed",
      errors,
    });
  }

  next();
}

/**
 * Validate password change requests.
 */
function validatePasswordChange(
  req,
  res,
  next,
) {
  const {
    currentPassword,
    newPassword,
  } = req.body;

  const errors = [];

  if (
    typeof currentPassword !==
      "string" ||
    currentPassword.length ===
      0
  ) {
    errors.push(
      "Current password is required",
    );
  }

  if (
    !isValidPassword(
      newPassword,
    )
  ) {
    errors.push(
      "New password must be between 8 and 128 characters",
    );
  }

  if (
    errors.length > 0
  ) {
    return res.status(400).json({
      message:
        "Password validation failed",
      errors,
    });
  }

  next();
}

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  validateRequest,

  isNonEmptyString,
  isValidString,
  isNonNegativeNumber,
  isPositiveInteger,
  isNonNegativeInteger,
  isValidObjectId,
  isValidEmail,
  isValidSlug,
  isValidPassword,

  validateProductCreate,
  validateProductUpdate,

  validateCategoryCreate,
  validateCategoryUpdate,

  validateObjectIdParam,

  validateRegistration,
  validateLogin,
  validatePasswordChange,
};