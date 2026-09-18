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
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
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

  function handleLogout() {
    setIsMobileOpen(false);

    logout();
    navigate("/login");
  }

  function closeMobileMenu() {
    setIsMobileOpen(false);
  }

  return (
    <div className="w-full shrink-0 lg:w-64">

      {/* ================================================== */}
      {/* DESKTOP SIDEBAR */}
      {/* ================================================== */}

      <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white lg:block">
        <div className="sticky top-0 flex h-screen flex-col">

          {/* Brand */}

          <div className="border-b border-slate-200 px-6 py-6">
            <NavLink
              to="/admin"
              className="flex items-center gap-3"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">
                E
              </span>

              <div>
                <p className="text-sm font-black tracking-tight text-slate-950">
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
                  <Icon size={18} />
                  {label}
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
              <Settings size={18} />
              Settings
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
              Sign out
            </button>

          </div>
        </div>
      </aside>


      {/* ================================================== */}
      {/* MOBILE ADMIN HEADER */}
      {/* ================================================== */}

      <div className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">

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
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        >
          <Menu size={21} />
        </button>

      </div>


      {/* ================================================== */}
      {/* MOBILE BACKDROP */}
      {/* ================================================== */}

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}


      {/* ================================================== */}
      {/* MOBILE DRAWER */}
      {/* ================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[min(86vw,20rem)]
          flex-col
          border-r
          border-slate-200
          bg-white
          shadow-2xl
          transition-transform
          duration-300
          ease-out
          lg:hidden
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
        aria-label="Mobile admin navigation"
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
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
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
                <Icon size={19} />
                {label}
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
            <Settings size={19} />
            Settings
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Sign out
          </button>

        </div>

      </aside>

    </div>
  );
}