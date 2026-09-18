import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";

import type { Product } from "../lib/api";
import { ProductCard } from "../components/ProductCard";
import { CategoryCard } from "../components/CategoryCard";


const categories = [
  {
    name: 'Phones',
    icon: '📱',
  },
  {
    name: 'Laptops',
    icon: '💻',
  },
  {
    name: 'Tablets',
    icon: '▣',
  },
  {
    name: 'Wearables',
    icon: '⌚',
  },
  {
    name: 'Audio',
    icon: '🎧',
  },
  {
    name: 'Accessories',
    icon: '🔌',
  },
];

export function Home({
  products,
}: {
  products: Product[];
}) {
  return (
     <>
    <main>

      {/* =========================================
          HERO
      ========================================= */}

      <section
        className="
          relative
          min-h-[480px]
          overflow-hidden
          bg-[#06101e]
          bg-[length:auto_480px]
          bg-[position:68%_center]
          bg-no-repeat
          text-white
          sm:min-h-[520px]
          sm:bg-[length:auto_520px]
          sm:bg-[position:center_center]
          lg:bg-cover
          lg:bg-center
        "
        style={{
          backgroundImage:
            "url('/products/hero-bg.png')",
        }}
      >
        {/* Dark readability overlay */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#06101e]/95
            via-[#06101e]/55
            to-transparent
          "
        />

        {/* Subtle atmospheric overlay */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_72%_45%,rgba(59,130,246,0.12),transparent_35%)]
          "
        />

        {/* Hero content */}
        <div
          className="
            container-page
            relative
            z-10
            flex
            min-h-[480px]
            items-center
            sm:min-h-[520px]
          "
        >
          <div
            className="
              max-w-xl
              py-10
              sm:py-12
            "
          >

            {/* Eyebrow */}
            <span
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-blue-400/30
                bg-blue-500/10
                px-3.5
                py-1.5
                text-xs
                font-semibold
                text-blue-200
                backdrop-blur-sm
              "
            >
              <Sparkles size={13} />
              Latest &amp; Greatest
            </span>

            {/* Heading */}
            <h1
              className="
                text-4xl
                font-black
                leading-[0.95]
                tracking-[-0.035em]
                sm:text-5xl
                lg:text-6xl
              "
            >
              Premium Gadgets.
              <br />

              <span
                className="
                  bg-gradient-to-r
                  from-cyan-300
                  via-blue-400
                  to-violet-400
                  bg-clip-text
                  text-transparent
                "
              >
                Smarter Living.
              </span>
            </h1>

            {/* Description */}
            <p
              className="
                mt-4
                max-w-lg
                text-sm
                leading-6
                text-slate-300
                sm:text-base
              "
            >
              Discover the latest smartphones, laptops,
              tablets, wearables and accessories.
            </p>

            {/* CTA */}
            <div className="mt-6">
              <a
                href="#shop"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-[#07111f]
                  shadow-lg
                  transition
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-slate-100
                "
              >
                Shop Now
                <ArrowRight size={17} />
              </a>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================
          SHOP BY CATEGORY
      ========================================= */}

      <section className="container-page py-10 sm:py-14">

        {/* Section heading */}
        <div
          className="
            mb-6
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-sm
                font-semibold
                text-blue-600
              "
            >
              Browse the store
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-bold
                tracking-tight
                text-slate-950
                sm:text-3xl
              "
            >
              Shop by category
            </h2>
          </div>

          <a
            href="#shop"
            className="
              hidden
              items-center
              gap-1
              text-sm
              font-semibold
              text-blue-600
              transition
              hover:text-blue-700
              sm:inline-flex
            "
          >
            View all
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Category cards */}
        <div
          className="
            no-scrollbar
            flex
            gap-3
            overflow-x-auto
            pb-2
            sm:grid
            sm:grid-cols-3
            sm:gap-4
            lg:grid-cols-6
          "
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              icon={category.icon}
            />
          ))}
        </div>

      </section>


      {/* =========================================
          TRENDING PRODUCTS
      ========================================= */}

      <section
        id="shop"
        className="
          bg-slate-50
          py-10
          sm:py-14
        "
      >
        <div className="container-page">

          {/* Section heading */}
          <div
            className="
              mb-6
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-blue-600
                "
              >
                Customer favorites
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-bold
                  tracking-tight
                  text-slate-950
                  sm:text-3xl
                "
              >
                Trending products
              </h2>

              <p
                className="
                  mt-2
                  max-w-lg
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Explore some of the gadgets customers
                are loving right now.
              </p>
            </div>

            <a
              href="#shop"
              className="
                hidden
                shrink-0
                items-center
                gap-1
                text-sm
                font-semibold
                text-blue-600
                transition
                hover:text-blue-700
                sm:inline-flex
              "
            >
              View all
              <ArrowRight size={16} />
            </a>
          </div>


          {/* Product grid */}
          {products.length > 0 ? (
            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-2
                sm:gap-5
                lg:grid-cols-4
              "
            >
              {products
                .slice(0, 8)
                .map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))}
            </div>
          ) : (
            /* Empty state */
            <div
              className="
                rounded-2xl
                border
                border-dashed
                border-slate-300
                bg-white
                px-6
                py-16
                text-center
              "
            >
              <div
                className="
                  mx-auto
                  grid
                  size-14
                  place-items-center
                  rounded-full
                  bg-slate-100
                  text-slate-400
                "
              >
                📦
              </div>

              <h3
                className="
                  mt-4
                  text-base
                  font-semibold
                  text-slate-900
                "
              >
                No products available yet
              </h3>

              <p
                className="
                  mx-auto
                  mt-1
                  max-w-md
                  text-sm
                  text-slate-500
                "
              >
                Products will appear here once they
                are available in the store.
              </p>
            </div>
          )}


          {/* Mobile view-all */}
          {products.length > 0 && (
            <div
              className="
                mt-6
                text-center
                sm:hidden
              "
            >
              <a
                href="#shop"
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  shadow-sm
                  transition
                  hover:border-blue-200
                  hover:text-blue-600
                "
              >
                View all products
                <ArrowRight size={15} />
              </a>
            </div>
          )}

        </div>
      </section>


            {/* =========================================
          EDAME'S DEALS
      ========================================= */}

      <section
        id="deals"
        className="container-page py-10 sm:py-14"
      >
        <div
          className="
            relative
            min-h-[380px]
            overflow-hidden
            rounded-[28px]
            bg-[#07111f]
            text-white
            sm:min-h-[420px]
            lg:min-h-[440px]
          "
          style={{
            backgroundImage:
              "url('/products/deals-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "68% center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-[#06101e]/95
              via-[#06101e]/65
              to-[#06101e]/10
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-[#06101e]/45
              via-transparent
              to-transparent
            "
          />

          <div
            className="
              container-page
              relative
              z-10
              flex
              min-h-[380px]
              items-center
              sm:min-h-[420px]
              lg:min-h-[440px]
            "
          >
            <div
              className="
                max-w-xl
                py-10
                sm:py-12
                lg:py-14
              "
            >
              <span
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-blue-300
                  sm:text-sm
                "
              >
                Edame's Deals
              </span>

              <h2
                className="
                  mt-3
                  max-w-xl
                  text-3xl
                  font-black
                  leading-[1.02]
                  tracking-[-0.03em]
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                Upgrade your setup
                <br />
                without overpaying.
              </h2>

              <p
                className="
                  mt-4
                  max-w-md
                  text-sm
                  leading-6
                  text-slate-200
                  sm:text-base
                "
              >
                Limited offers on selected phones,
                audio, wearables and accessories.
              </p>

              <Link
                to="/shop"
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-6
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-blue-950/30
                  transition
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-blue-500
                "
              >
                Shop deals
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

       </main>
  </>
);
}