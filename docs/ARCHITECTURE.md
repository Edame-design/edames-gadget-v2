# Edame's Gadget V2 — Architecture

## Migration strategy
This is an evolution of the existing Edame's Gadget prototype, not a replacement.

### Preserve from V1
- MongoDB/Mongoose product model and existing product records
- Existing product imagery
- Express product/cart API concepts
- Git history and lessons learned

### V2 target
- React + TypeScript + Vite + Tailwind CSS
- Express API, progressively refactored into controllers/services/validators
- MongoDB + Mongoose
- User authentication + OTP verification
- Role-based admin authorization
- Products, categories, carts, orders, payments, reviews, wishlist, coupons
- Admin product/inventory/order management
- Automated tests and CI/CD

## First implementation slice
The client now provides a responsive, mobile-first storefront shell using the existing product imagery and existing `/api/products` endpoint. If the API is unavailable, the UI falls back to local preview data so design work is not blocked.

## Next slices
1. Product listing/search/filtering
2. Product detail route
3. Cart API scoped to a user/session
4. Authentication and authorization
5. Admin dashboard + product CRUD
6. Orders + checkout/payment
7. Security hardening
8. Tests + CI/CD
