import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import type { Product } from "../lib/api";
import { ProductCard } from "../components/ProductCard";
import { CategoryCard } from "../components/CategoryCard";
import Footer from "../components/Footer";

const categories = [
  {
    name: "Phones",
    icon: "📱",
  },
  {
    name: "Laptops",
    icon: "💻",
  },
  {
    name: "Tablets",
    icon: "▣",
  },
  {
    name: "Wearables",
    icon: "⌚",
  },
  {
    name: "Audio",
    icon: "🎧",
  },
  {
    name: "Accessories",
    icon: "🔌",
  },
];

const heroSlides = [
  {
    image: "/products/hero-bg1.png",
    eyebrow: "Latest & Greatest",
    title: "Premium Gadgets.",
    highlight: "Smarter Living.",
    description:
      "Discover the latest smartphones, laptops, tablets, wearables and accessories.",
  },
  {
    image: "/products/hero-bg2.png",
    eyebrow: "Upgrade Your Everyday",
    title: "Better Tech.",
    highlight: "Better Experience.",
    description:
      "Powerful devices designed to keep you productive, connected and entertained.",
  },
  {
    image: "/products/hero-bg3.png",
    eyebrow: "Stay Connected",
    title: "Tech That Fits.",
    highlight: "Your Lifestyle.",
    description:
      "Explore premium audio, wearables and accessories built for everyday moments.",
  },
];

export function Home({
  products,
}: {
  products: Product[];
}) {
  const [activeSlide, setActiveSlide] =
    useState(0);

  /*
   * AUTOMATIC HERO SLIDESHOW
   *
   * Changes the hero every 5 seconds.
   */
  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setActiveSlide(
          (current) =>
            (current + 1) %
            heroSlides.length,
        );
      }, 5000);

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, []);

  const currentSlide =
    heroSlides[activeSlide];

  return (
    <>
      <main>

        {/* =========================================
            HERO
        ========================================= */}

        <section
          className="
            group
            relative
            min-h-[480px]
            overflow-hidden
            bg-[#06101e]
            text-white
            sm:min-h-[520px]
          "
        >

          {/* =====================================
              HERO BACKGROUND SLIDES
          ===================================== */}

          {heroSlides.map(
            (slide, index) => (
              <div
                key={slide.image}
                className={`
                  absolute
                  inset-0
                  bg-cover
                  bg-center
                  bg-no-repeat
                  transition-opacity
                  duration-1000
                  ease-in-out

                  ${
                    activeSlide === index
                      ? "opacity-100"
                      : "opacity-0"
                  }
                `}
                style={{
                  backgroundImage:
                    `url("${slide.image}")`,
                }}
                aria-hidden={
                  activeSlide !== index
                }
              />
            ),
          )}

          {/* =====================================
              DARK READABILITY OVERLAY
          ===================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-r
              from-[#06101e]/95
              via-[#06101e]/55
              to-transparent
            "
          />

          {/* =====================================
              BLUE ATMOSPHERIC GLOW
          ===================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[radial-gradient(circle_at_72%_45%,rgba(59,130,246,0.14),transparent_35%)]
            "
          />

          {/* =====================================
              HERO CONTENT
          ===================================== */}

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
              key={activeSlide}
              className="
                max-w-xl
                py-10
                sm:py-12
                animate-[heroTextIn_700ms_ease-out]
              "
            >

              {/* EYEBROW */}

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
                <Sparkles
                  size={13}
                />

                {currentSlide.eyebrow}
              </span>

              {/* HEADING */}

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
                {currentSlide.title}

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
                  {currentSlide.highlight}
                </span>
              </h1>

              {/* DESCRIPTION */}

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
                {currentSlide.description}
              </p>

              {/* CTA */}

              <div className="mt-6">
                <Link
                  to="/shop"
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

                  <ArrowRight
                    size={17}
                  />
                </Link>
              </div>

            </div>
          </div>

          {/* =====================================
              SLIDE INDICATORS
          ===================================== */}

          <div
            className="
              absolute
              bottom-7
              left-0
              right-0
              z-20
            "
          >
            <div
              className="
                container-page
                flex
                items-center
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                {heroSlides.map(
                  (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        setActiveSlide(
                          index,
                        )
                      }
                      aria-label={`Show hero slide ${
                        index + 1
                      }`}
                      className={`
                        h-1.5
                        rounded-full
                        transition-all
                        duration-500

                        ${
                          activeSlide ===
                          index
                            ? "w-8 bg-white"
                            : "w-2.5 bg-white/40 hover:bg-white/70"
                        }
                      `}
                    />
                  ),
                )}
              </div>
            </div>
          </div>

        </section>


        {/* =========================================
            SHOP BY CATEGORY
        ========================================= */}

        <section
          className="
            container-page
            py-10
            sm:py-14
          "
        >

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

            <Link
              to="/shop"
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

              <ArrowRight
                size={16}
              />
            </Link>

          </div>

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
            {categories.map(
              (category) => (
                <CategoryCard
                  key={
                    category.name
                  }
                  name={
                    category.name
                  }
                  icon={
                    category.icon
                  }
                />
              ),
            )}
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
          <div
            className="container-page"
          >

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
                  Explore some of the
                  gadgets customers are
                  loving right now.
                </p>

              </div>

              <Link
                to="/shop"
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

                <ArrowRight
                  size={16}
                />
              </Link>

            </div>

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
                  .map(
                    (product) => (
                      <ProductCard
                        key={
                          product._id
                        }
                        product={
                          product
                        }
                      />
                    ),
                  )}
              </div>
            ) : (
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
                  No products available
                  yet
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
                  Products will appear
                  here once they are
                  available in the store.
                </p>

              </div>
            )}

            {products.length > 0 && (
              <div
                className="
                  mt-6
                  text-center
                  sm:hidden
                "
              >
                <Link
                  to="/shop"
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

                  <ArrowRight
                    size={15}
                  />
                </Link>
              </div>
            )}

          </div>
        </section>


        {/* =========================================
            EDAME'S DEALS
        ========================================= */}

        <section
          id="deals"
          className="
            container-page
            py-10
            sm:py-14
          "
        >
          <div
            className="
              overflow-hidden
              rounded-3xl
              bg-[#07111f]
              p-6
              text-white
              sm:p-10
              lg:flex
              lg:items-center
              lg:justify-between
            "
          >

            <div>

              <span
                className="
                  text-sm
                  font-semibold
                  text-blue-300
                "
              >
                EDAME'S DEALS
              </span>

              <h2
                className="
                  mt-2
                  max-w-xl
                  text-3xl
                  font-black
                  sm:text-4xl
                "
              >
                Upgrade your setup
                without overpaying.
              </h2>

              <p
                className="
                  mt-3
                  max-w-lg
                  text-slate-300
                "
              >
                Limited offers on selected
                phones, audio, wearables
                and accessories.
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
                  py-3
                  font-bold
                  transition
                  hover:bg-blue-500
                "
              >
                Shop deals

                <ArrowRight
                  size={16}
                />
              </Link>

            </div>

            <img
              src="/products/AirPod max.jpg"
              alt="Premium headphones"
              className="
                mt-8
                hidden
                h-48
                w-80
                object-contain
                lg:block
              "
            />

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}