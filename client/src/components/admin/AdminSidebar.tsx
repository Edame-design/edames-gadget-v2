import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  Tags,
  Users,
} from "lucide-react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

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

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
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
  );
}