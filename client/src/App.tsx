import {
  BrowserRouter,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { Header } from "./components/Header";
import Footer from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { Home } from "./pages/Home";
import Shop from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";

import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import CustomerOrderDetail from "./pages/CustomerOrderDetail";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductNew from "./pages/admin/AdminProductNew";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import Inventory from "./pages/admin/Inventory";
import Categories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/AdminOrders";
import Customers from "./pages/admin/Customers";
import Analytics from "./pages/admin/Analytics";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminSettings from "./pages/admin/AdminSettings";

import AccountSettings from "./pages/AccountSettings";

import {
  getProduct,
  getProducts,
  type Product,
} from "./lib/api";

/* =========================================================
   STOREFRONT LAYOUT
========================================================= */

function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      {children}

      <Footer />
    </>
  );
}

/* =========================================================
   HOME ROUTE
========================================================= */

function HomeRoute() {
  const {
    data: products = [],
    isLoading,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  if (isLoading) {
    return (
      <main className="container-page pt-28 pb-16 md:pt-32">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-sm font-medium text-slate-500">
            Loading products...
          </p>
        </div>
      </main>
    );
  }

  return <Home products={products} />;
}

/* =========================================================
   PRODUCT ROUTE
========================================================= */

function ProductRoute() {
  const { id } = useParams();

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => getProduct(id!),
    enabled: Boolean(id),
  });

  const {
    data: products = [],
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  if (isLoading) {
    return (
      <main className="container-page pt-28 pb-16 md:pt-32">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-sm font-medium text-slate-500">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="container-page pt-28 pb-16 md:pt-32">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">
            Product not found
          </h1>

          <p className="mt-2 text-slate-500">
            We couldn't find the product you're looking for.
          </p>
        </div>
      </main>
    );
  }

  const relatedProducts = products.filter(
    (item) =>
      item._id !== product._id &&
      item.category === product.category,
  );

  return (
    <ProductDetail
      product={product}
      related={relatedProducts}
    />
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            PUBLIC STOREFRONT
        ================================================= */}

        <Route
          path="/"
          element={
            <StorefrontLayout>
              <HomeRoute />
            </StorefrontLayout>
          }
        />

        <Route
          path="/shop"
          element={
            <StorefrontLayout>
              <Shop />
            </StorefrontLayout>
          }
        />

        <Route
          path="/product/:id"
          element={
            <StorefrontLayout>
              <ProductRoute />
            </StorefrontLayout>
          }
        />

        <Route
          path="/cart"
          element={
            <StorefrontLayout>
              <Cart />
            </StorefrontLayout>
          }
        />

        {/* =================================================
            AUTHENTICATION
        ================================================= */}

        <Route
          path="/login"
          element={
            <StorefrontLayout>
              <Login />
            </StorefrontLayout>
          }
        />

        <Route
          path="/register"
          element={
            <StorefrontLayout>
              <Register />
            </StorefrontLayout>
          }
        />

        {/* =================================================
            CUSTOMER-PROTECTED ROUTES
        ================================================= */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/account"
            element={<Account />}
          />

          <Route
            path="/account/settings"
            element={<AccountSettings />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/account/orders"
            element={<Orders />}
          />

          <Route
            path="/account/orders/:id"
            element={<CustomerOrderDetail />}
          />

          <Route
            path="/order-confirmation/:id"
            element={<OrderConfirmation />}
          />

        </Route>

        {/* =================================================
            ADMIN-PROTECTED ROUTES
        ================================================= */}

        <Route
          element={
            <ProtectedRoute adminOnly />
          }
        >

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/products"
            element={<AdminProducts />}
          />

          <Route
            path="/admin/products/new"
            element={<AdminProductNew />}
          />

          <Route
            path="/admin/products/:id/edit"
            element={<AdminProductEdit />}
          />

          <Route
            path="/admin/inventory"
            element={<Inventory />}
          />

          <Route
            path="/admin/categories"
            element={<Categories />}
          />

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />

          <Route
            path="/admin/orders/:id"
            element={<AdminOrderDetail />}
          />

          <Route
            path="/admin/customers"
            element={<Customers />}
          />

          <Route
            path="/admin/analytics"
            element={<Analytics />}
          />

          <Route
            path="/admin/settings"
            element={<AdminSettings />}
          />

        </Route>

        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={
            <StorefrontLayout>
              <HomeRoute />
            </StorefrontLayout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}