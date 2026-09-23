import {
  ArrowRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { Link } from "react-router-dom";

const shopLinks = [
  { label: "Shop All", to: "/shop" },
  { label: "Phones", to: "/shop" },
  { label: "Laptops", to: "/shop" },
  { label: "Tablets", to: "/shop" },
  { label: "Wearables", to: "/shop" },
  { label: "Audio", to: "/shop" },
  { label: "Accessories", to: "/shop" },
];

const accountLinks = [
  { label: "My Account", to: "/account" },
  { label: "My Orders", to: "/account/orders" },
  { label: "Cart", to: "/cart" },
];

export default function Footer() {
  return (
    <footer className="bg-[#06101e] text-white">
      {/* Main footer */}
      <div className="container-page py-14 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.25fr]">

          {/* Brand */}
          <div className="max-w-sm">
            <Link
              to="/"
              className="inline-flex items-center"
            >
              <img
                src="/logo/edame-gadget-logo.png"
                alt="Edame's Gadget"
                className="
                  h-20
                  w-auto
                  max-w-[240px]
                  object-contain
                  object-left
                "
              />
            </Link>

            <p className="mt-5 text-sm leading-7 text-slate-400">
              Your destination for phones, gadgets,
              accessories and everyday technology.
              Shop quality products with a simple,
              modern buying experience.
            </p>

            <Link
              to="/shop"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-white
                px-5
                py-3
                text-sm
                font-bold
                text-slate-950
                transition
                hover:-translate-y-0.5
                hover:bg-blue-500
                hover:text-white
              "
            >
              Start shopping
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
              Shop
            </h3>

            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="
                      text-sm
                      text-slate-400
                      transition
                      hover:text-white
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
              Customer
            </h3>

            <ul className="mt-5 space-y-3">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="
                      text-sm
                      text-slate-400
                      transition
                      hover:text-white
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Need help?
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Visit your account to manage orders,
                purchases and account settings.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
              Get in touch
            </h3>

            <div className="mt-5 space-y-4">

              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-400"
                />

                <div>
                  <p className="text-sm font-semibold text-white">
                    Location
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Nigeria
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-400"
                />

                <div>
                  <p className="text-sm font-semibold text-white">
                    Phone
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Contact details coming soon
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-400"
                />

                <div>
                  <p className="text-sm font-semibold text-white">
                    Email
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Contact details coming soon
                  </p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="mt-7 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Follow us
              </span>

              <div className="ml-2 flex gap-2">
                <button
                  type="button"
                  aria-label="Facebook"
                  className="
                    grid
                    size-9
                    place-items-center
                    rounded-lg
                    border
                    border-white/10
                    bg-white/5
                    text-slate-400
                    transition
                    hover:border-blue-400/40
                    hover:bg-blue-500
                    hover:text-white
                  "
                >
                  <Facebook size={16} />
                </button>

                <button
                  type="button"
                  aria-label="Instagram"
                  className="
                    grid
                    size-9
                    place-items-center
                    rounded-lg
                    border
                    border-white/10
                    bg-white/5
                    text-slate-400
                    transition
                    hover:border-blue-400/40
                    hover:bg-blue-500
                    hover:text-white
                  "
                >
                  <Instagram size={16} />
                </button>

                <button
                  type="button"
                  aria-label="Twitter"
                  className="
                    grid
                    size-9
                    place-items-center
                    rounded-lg
                    border
                    border-white/10
                    bg-white/5
                    text-slate-400
                    transition
                    hover:border-blue-400/40
                    hover:bg-blue-500
                    hover:text-white
                  "
                >
                  <Twitter size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Edame's Gadget.
              All rights reserved.
            </p>

            <p>
              Built for modern shopping.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}