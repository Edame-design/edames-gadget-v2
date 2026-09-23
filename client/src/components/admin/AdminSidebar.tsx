import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Tags,
  Users,
  X,
  Truck,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";

const navigation = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    to: "/admin/products",
    icon: ShoppingBag,
  },
  {
    label: "Inventory",
    to: "/admin/inventory",
    icon: Boxes,
  },
  {
    label: "Categories",
    to: "/admin/categories",
    icon: Tags,
  },
  {
    label: "Delivery Pricing",
    to: "/admin/delivery",
    icon: Truck,
  },
  {
    label: "Orders",
    to: "/admin/orders",
    icon: ClipboardList,
  },
  {
    label: "Customers",
    to: "/admin/customers",
    icon: Users,
  },
  {
    label: "Analytics",
    to: "/admin/analytics",
    icon: BarChart3,
  },
];

export function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [isMobileOpen, setIsMobileOpen] =
    useState(false);

  /*
   * Close the mobile drawer when the
   * Escape key is pressed.
   */
  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [isMobileOpen]);

  /*
   * Prevent the page behind the drawer
   * from scrolling on mobile.
   */
  useEffect(() => {
    if (!isMobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  /*
   * Close the mobile drawer when switching
   * back to desktop width.
   */
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    }

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );
    };
  }, []);

  function handleLogout() {
    setIsMobileOpen(false);

    logout();
    navigate("/login");
  }

  function closeMobileMenu() {
    setIsMobileOpen(false);
  }

  return (
    <>
      {/* ================================================== */}
      {/* DESKTOP SIDEBAR                                   */}
      {/* ================================================== */}

      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          {/* Brand */}

          <div className="border-b border-slate-200 px-6 py-6">
            <NavLink
              to="/admin"
              className="flex items-center gap-3"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">
                E
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-tight text-slate-950">
                  Edame&apos;s Gadget
                </p>

                <p className="text-xs text-slate-400">
                  Administration
                </p>
              </div>
            </NavLink>
          </div>

          {/* Navigation */}

          <nav
            className="flex-1 space-y-1 overflow-y-auto p-4"
            aria-label="Admin navigation"
          >
            {navigation.map(
              ({
                label,
                to,
                icon: Icon,
              }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`
                  }
                >
                  <Icon
                    size={18}
                    className="shrink-0"
                  />

                  <span className="truncate">
                    {label}
                  </span>
                </NavLink>
              ),
            )}
          </nav>

          {/* Bottom actions */}

          <div className="border-t border-slate-200 p-4">
            <NavLink
              to="/admin/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Settings
                size={18}
                className="shrink-0"
              />

              <span>
                Settings
              </span>
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut
                size={18}
                className="shrink-0"
              />

              <span>
                Sign out
              </span>
            </button>
          </div>
        </div>
      </aside>


      {/* ================================================== */}
      {/* MOBILE HEADER                                     */}
      {/* ================================================== */}

      <div className="lg:hidden">
        {/* Fixed mobile header */}

        <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur">
          <NavLink
            to="/admin"
            className="flex min-w-0 items-center gap-3"
            onClick={closeMobileMenu}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">
              E
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-tight text-slate-950">
                Edame&apos;s Gadget
              </p>

              <p className="text-[11px] text-slate-400">
                Administration
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={() =>
              setIsMobileOpen(true)
            }
            aria-label="Open admin navigation"
            aria-expanded={isMobileOpen}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 active:scale-95"
          >
            <Menu size={21} />
          </button>
        </header>

        {/* Header spacer */}

        <div
          className="h-16"
          aria-hidden="true"
        />
      </div>


      {/* ================================================== */}
      {/* MOBILE BACKDROP                                   */}
      {/* ================================================== */}

      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-300 lg:hidden ${
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isMobileOpen}
        onClick={closeMobileMenu}
      />


      {/* ================================================== */}
      {/* MOBILE DRAWER                                    */}
      {/* ================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(86vw,20rem)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
        aria-label="Mobile admin navigation"
        aria-hidden={!isMobileOpen}
      >
        {/* Drawer header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
          <NavLink
            to="/admin"
            onClick={closeMobileMenu}
            className="flex min-w-0 items-center gap-3"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">
              E
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-tight text-slate-950">
                Edame&apos;s Gadget
              </p>

              <p className="text-xs text-slate-400">
                Administration
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close admin navigation"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 active:scale-95"
          >
            <X size={19} />
          </button>
        </div>


        {/* Drawer navigation */}

        <nav
          className="flex-1 space-y-1 overflow-y-auto p-4"
          aria-label="Mobile admin navigation"
        >
          {navigation.map(
            ({
              label,
              to,
              icon: Icon,
            }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin"}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`
                }
              >
                <Icon
                  size={19}
                  className="shrink-0"
                />

                <span className="truncate">
                  {label}
                </span>
              </NavLink>
            ),
          )}
        </nav>


        {/* Drawer bottom actions */}

        <div className="border-t border-slate-200 p-4">
          <NavLink
            to="/admin/settings"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
          >
            <Settings
              size={19}
              className="shrink-0"
            />

            <span>
              Settings
            </span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut
              size={19}
              className="shrink-0"
            />

            <span>
              Sign out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}