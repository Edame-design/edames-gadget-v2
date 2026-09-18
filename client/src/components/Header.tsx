import {
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  getCart,
} from "../lib/api";

import {
  cartCount,
} from "../lib/cart";

import {
  useAuth,
} from "../context/AuthContext";

const links = [
  ["Shop", "/shop"],
  ["Phones", "/shop?category=Phones"],
  ["Laptops", "/shop?category=Laptops"],
  ["Tablets", "/shop?category=Tablets"],
  ["Wearables", "/shop?category=Wearables"],
  ["Accessories", "/shop?category=Accessories"],
];

export function Header() {
  const [open, setOpen] =
    useState(false);

  const [count, setCount] =
    useState(cartCount());

  const [scrolled, setScrolled] =
    useState(false);

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | LOAD CART COUNT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    const loadCartCount =
      async () => {
        try {
          if (!isAuthenticated) {
            if (mounted) {
              setCount(
                cartCount(),
              );
            }

            return;
          }

          const cart =
            await getCart();

          if (!mounted) {
            return;
          }

          const total =
            cart.items.reduce(
              (
                total,
                item,
              ) =>
                total +
                item.quantity,
              0,
            );

          setCount(total);
        } catch (error) {
          console.error(
            "Unable to load cart count:",
            error,
          );

          if (mounted) {
            setCount(0);
          }
        }
      };

    loadCartCount();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  /*
  |--------------------------------------------------------------------------
  | CART CHANGE LISTENER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const updateCartCount =
      async () => {
        try {
          if (!isAuthenticated) {
            setCount(
              cartCount(),
            );

            return;
          }

          const cart =
            await getCart();

          const total =
            cart.items.reduce(
              (
                total,
                item,
              ) =>
                total +
                item.quantity,
              0,
            );

          setCount(total);
        } catch (error) {
          console.error(
            "Unable to update cart count:",
            error,
          );
        }
      };

    window.addEventListener(
      "cart:changed",
      updateCartCount,
    );

    return () => {
      window.removeEventListener(
        "cart:changed",
        updateCartCount,
      );
    };
  }, [isAuthenticated]);

  /*
  |--------------------------------------------------------------------------
  | SCROLL EFFECT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleScroll =
      () => {
        setScrolled(
          window.scrollY > 20,
        );
      };

    window.addEventListener(
      "scroll",
      handleScroll,
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const handleLogout =
    () => {
      setOpen(false);
      logout();
    };

  return (
    <header
      className={`
        fixed
        left-0
        right-0
        top-0
        z-50
        transition-all
        duration-300
        ${
          scrolled
            ? "bg-[#06101e]/90 shadow-lg backdrop-blur-xl"
            : "bg-[#06101e]/70 backdrop-blur-md"
        }
      `}
    >
      <div className="container-page">
        <div
          className="
            flex
            h-16
            items-center
            justify-between
            gap-4
          "
        >
          {/* LOGO */}

          <Link
            to="/"
            className="
              flex
              shrink-0
              items-center
              gap-2.5
              text-white
            "
            onClick={() =>
              setOpen(false)
            }
          >
            <span
              className="
                grid
                size-9
                place-items-center
                rounded-xl
                bg-blue-600
                text-base
                font-black
              "
            >
              E
            </span>

            <span
              className="
                hidden
                text-sm
                font-black
                tracking-tight
                sm:block
              "
            >
              EDAME'S GADGET
            </span>
          </Link>

          {/* DESKTOP NAV */}

          <nav
            className="
              hidden
              items-center
              gap-6
              lg:flex
            "
          >
            {links.map(
              ([label, to]) => (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    `
                      text-sm
                      font-medium
                      transition
                      ${
                        isActive
                          ? "text-white"
                          : "text-slate-300 hover:text-white"
                      }
                    `
                  }
                >
                  {label}
                </NavLink>
              ),
            )}
          </nav>

          {/* ACTIONS */}

          <div
            className="
              flex
              items-center
              gap-1
              sm:gap-2
            "
          >
            <button
              type="button"
              aria-label="Search"
              className="
                grid
                size-9
                place-items-center
                rounded-lg
                text-slate-300
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              aria-label="Wishlist"
              className="
                hidden
                size-9
                place-items-center
                rounded-lg
                text-slate-300
                transition
                hover:bg-white/10
                hover:text-white
                sm:grid
              "
            >
              <Heart size={18} />
            </button>

            <Link
              to="/cart"
              aria-label={`Cart with ${count} items`}
              className="
                relative
                grid
                size-9
                place-items-center
                rounded-lg
                text-slate-300
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <ShoppingBag
                size={18}
              />

              {count > 0 && (
                <span
                  className="
                    absolute
                    -right-0.5
                    -top-0.5
                    grid
                    min-w-4
                    place-items-center
                    rounded-full
                    bg-blue-600
                    px-1
                    text-[9px]
                    font-bold
                    leading-4
                    text-white
                  "
                >
                  {count > 99
                    ? "99+"
                    : count}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
  <div
    className="
      hidden
      items-center
      gap-2
      lg:flex
    "
  >
    <Link
       to={user?.role === "admin" ? "/admin" : "/account"}
      className="
        flex
        items-center
        gap-2
        rounded-lg
        px-2
        py-2
        text-sm
        text-slate-300
        transition
        hover:bg-white/10
        hover:text-white
      "
    >
      <UserRound
        size={17}
      />

      {user?.name && (
        <span>
          {user.name}
        </span>
      )}
    </Link>

    <button
      type="button"
      onClick={handleLogout}
      aria-label="Log out"
      className="
        grid
        size-9
        place-items-center
        rounded-lg
        text-slate-300
        transition
        hover:bg-white/10
        hover:text-white
      "
    >
      <LogOut
        size={17}
      />
    </button>
  </div>
) : (
              <Link
                to="/login"
                className="
                  hidden
                  rounded-lg
                  bg-white
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-slate-950
                  transition
                  hover:bg-blue-500
                  hover:text-white
                  sm:block
                "
              >
                Login
              </Link>
            )}

            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() =>
                setOpen(
                  (value) =>
                    !value,
                )
              }
              aria-label={
                open
                  ? "Close menu"
                  : "Open menu"
              }
              className="
                grid
                size-9
                place-items-center
                rounded-lg
                text-slate-300
                transition
                hover:bg-white/10
                hover:text-white
                lg:hidden
              "
            >
              {open ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE NAV */}

        {open && (
          <div
            className="
              border-t
              border-white/10
              py-4
              lg:hidden
            "
          >
            <nav className="grid gap-1">
              {links.map(
                ([label, to]) => (
                  <NavLink
                    key={label}
                    to={to}
                    onClick={() =>
                      setOpen(false)
                    }
                    className={({ isActive }) =>
                      `
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        font-medium
                        transition
                        ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }
                      `
                    }
                  >
                    {label}
                  </NavLink>
                ),
              )}

              {isAuthenticated ? (
                <>
                  <Link
  to={
    user?.role === "admin"
      ? "/admin"
      : "/account"
  }
  onClick={() =>
    setOpen(false)
  }
  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
>
  <UserRound size={17} />
  {user?.role === "admin"
    ? "Admin Dashboard"
    : "Account"}
</Link>
                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-4
                      py-3
                      text-left
                      text-sm
                      text-slate-300
                      transition
                      hover:bg-white/5
                      hover:text-white
                    "
                  >
                    <LogOut
                      size={17}
                    />
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="
                    mt-2
                    rounded-xl
                    bg-blue-600
                    px-4
                    py-3
                    text-center
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}