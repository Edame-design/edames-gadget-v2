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
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  getCart,
} from "../lib/api";

import {
  cartCount,
} from "../lib/cart";

import {
  getWishlist,
} from "../lib/wishlist";

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

  const [wishlistCount, setWishlistCount] =
    useState(0);

  const [scrolled, setScrolled] =
    useState(false);

  const location =
    useLocation();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  /*
   * --------------------------------------------------------------------------
   * LOAD CART COUNT
   * --------------------------------------------------------------------------
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
   * --------------------------------------------------------------------------
   * CART CHANGE LISTENER
   * --------------------------------------------------------------------------
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
   * --------------------------------------------------------------------------
   * LOAD WISHLIST COUNT
   *
   * This is kept in one function so every refresh mechanism uses
   * exactly the same source of truth.
   * --------------------------------------------------------------------------
   */

  const refreshWishlistCount =
    useCallback(
      async () => {
        try {
          const wishlist =
            await getWishlist(
              isAuthenticated,
            );

          setWishlistCount(
            wishlist.length,
          );
        } catch (error) {
          console.error(
            "Unable to refresh wishlist count:",
            error,
          );

          /*
           * Do not leave an old/stale number
           * visible if the wishlist cannot be
           * loaded.
           */
          setWishlistCount(0);
        }
      },
      [isAuthenticated],
    );

  /*
   * --------------------------------------------------------------------------
   * INITIAL WISHLIST LOAD + AUTH CHANGE
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    refreshWishlistCount();
  }, [
    refreshWishlistCount,
  ]);

  /*
   * --------------------------------------------------------------------------
   * WISHLIST CHANGE LISTENER
   *
   * ProductCard / Wishlist page can notify Header immediately.
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    window.addEventListener(
      "wishlist:changed",
      refreshWishlistCount,
    );

    return () => {
      window.removeEventListener(
        "wishlist:changed",
        refreshWishlistCount,
      );
    };
  }, [
    refreshWishlistCount,
  ]);

  /*
   * --------------------------------------------------------------------------
   * REFRESH WISHLIST WHEN ROUTE CHANGES
   *
   * This fixes the issue where the number could become stale when navigating
   * from Shop → Wishlist → Shop or using browser navigation.
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    refreshWishlistCount();
  }, [
    location.pathname,
    location.search,
    refreshWishlistCount,
  ]);

  /*
   * --------------------------------------------------------------------------
   * REFRESH WHEN PAGE/TAB BECOMES ACTIVE AGAIN
   *
   * Useful when:
   * - user switches browser tabs
   * - browser restores the page
   * - another component changes the wishlist
   * - browser back/forward restores cached UI
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          refreshWishlistCount();
        }
      };

    const handlePageShow =
      () => {
        refreshWishlistCount();
      };

    window.addEventListener(
      "pageshow",
      handlePageShow,
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.removeEventListener(
        "pageshow",
        handlePageShow,
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [
    refreshWishlistCount,
  ]);

  /*
   * --------------------------------------------------------------------------
   * SCROLL EFFECT
   * --------------------------------------------------------------------------
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
   * --------------------------------------------------------------------------
   * LOGOUT
   * --------------------------------------------------------------------------
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
            "
            onClick={() =>
              setOpen(false)
            }
          >
            <img
              src="/logo/edame-gadget-logo.png"
              alt="Edame's Gadget"
              className="
                h-11
                w-auto
                max-w-[180px]
                object-contain
                sm:h-12
                sm:max-w-[200px]
              "
            />
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
                  className={({
                    isActive,
                  }) =>
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
            {/* SEARCH */}

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

            {/* WISHLIST */}

            <Link
              to="/wishlist"
              aria-label={`Wishlist with ${wishlistCount} saved ${
                wishlistCount === 1
                  ? "item"
                  : "items"
              }`}
              className="
                relative
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
              <Heart
                size={18}
                className={
                  wishlistCount > 0
                    ? "fill-current text-red-400"
                    : ""
                }
              />

              {wishlistCount > 0 && (
                <span
                  className="
                    absolute
                    -right-0.5
                    -top-0.5
                    grid
                    min-w-4
                    place-items-center
                    rounded-full
                    bg-red-500
                    px-1
                    text-[9px]
                    font-bold
                    leading-4
                    text-white
                  "
                >
                  {wishlistCount > 99
                    ? "99+"
                    : wishlistCount}
                </span>
              )}
            </Link>

            {/* CART */}

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

            {/* DESKTOP ACCOUNT */}

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
                  to={
                    user?.role === "admin"
                      ? "/admin"
                      : "/account"
                  }
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
                  onClick={
                    handleLogout
                  }
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
                    className={({
                      isActive,
                    }) =>
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

              {/* MOBILE WISHLIST */}

              <Link
                to="/wishlist"
                onClick={() =>
                  setOpen(false)
                }
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-slate-300
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                <span className="flex items-center gap-3">
                  <Heart
                    size={17}
                    className={
                      wishlistCount > 0
                        ? "fill-current text-red-400"
                        : ""
                    }
                  />

                  Wishlist
                </span>

                {wishlistCount > 0 && (
                  <span
                    className="
                      grid
                      min-w-5
                      place-items-center
                      rounded-full
                      bg-red-500
                      px-1.5
                      py-0.5
                      text-[10px]
                      font-bold
                      text-white
                    "
                  >
                    {wishlistCount > 99
                      ? "99+"
                      : wishlistCount}
                  </span>
                )}
              </Link>

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
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      text-slate-300
                      transition
                      hover:bg-white/5
                      hover:text-white
                    "
                  >
                    <UserRound
                      size={17}
                    />

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