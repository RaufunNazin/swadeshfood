import { useEffect, useState, useCallback, useRef } from "react";
import Footer from "../components/Footer";
import "react-toastify/dist/ReactToastify.css";
import api from "../api";
import { AiOutlineFilter } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import { Select, ConfigProvider, theme as antdTheme } from "antd";
import ItemCard from "../components/ItemCard";
import Notification from "../components/Notification";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { ItemCardSkeleton } from "../components/Skeletons";
import PageHeader from "../components/PageHeader";

const Store = () => {
  const { searchCategory } = useParams();
  const navigate = useNavigate();

  const [offset] = useState(0);
  const [limit, setLimit] = useState(12);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);

  // Controlled filter states (so we can reset without reload)
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedSort, setSelectedSort] = useState(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersBodyRef = useRef(null);
  const [filtersMaxHeight, setFiltersMaxHeight] = useState("0px");

  const [buyAgainProducts, setBuyAgainProducts] = useState([]);

  const { theme } = useTheme();
  const { t } = useLanguage();

  // --- Fetch products helper ---
  const fetchProducts = useCallback(
    async (endpoint) => {
      setLoading(true);
      try {
        const res = await api.get(endpoint);
        setProducts(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    },
    [setProducts],
  );

  useEffect(() => {
    // Fetch silently in the background
    api
      .get("/products/user/buy-again")
      .then((res) => setBuyAgainProducts(res.data))
      .catch(() => {}); // Ignore errors completely
  }, []);

  useEffect(() => {
    const el = filtersBodyRef.current;
    if (!el) return;

    if (filtersOpen) {
      // open: measure content height
      setFiltersMaxHeight(`${el.scrollHeight}px`);
    } else {
      // closed
      setFiltersMaxHeight("0px");
    }
  }, [filtersOpen, categories.length, sizes.length]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setFiltersOpen(mq.matches);
  }, []);

  // --- Base load / route category load ---
  useEffect(() => {
    // If route has /store/:searchCategory, set that as selected category UI state
    if (searchCategory) {
      setSelectedCategory(searchCategory);
    } else {
      setSelectedCategory(null);
    }

    // Reset other filters on route category change
    setSelectedSize(null);
    setSelectedSort(null);

    // Reset pagination on route change
    setLimit(12);

    const endpoint = searchCategory
      ? `/filter/category/${searchCategory}/${offset}/12`
      : `/products/price-range/${offset}/12`;

    fetchProducts(endpoint);
  }, [searchCategory, offset, fetchProducts]);

  // --- Refetch when limit changes (load more) using current filters ---
  useEffect(() => {
    // Determine active endpoint based on current selected filters
    // Priority: size > sort > category > default
    let endpoint = `/products/price-range/${offset}/${limit}`;

    if (selectedCategory) {
      endpoint = `/filter/category/${selectedCategory}/${offset}/${limit}`;
    }
    if (selectedSize) {
      endpoint = `/filter/size/${selectedSize}/${offset}/${limit}`;
    }
    if (selectedSort) {
      endpoint = `/sort/${selectedSort}/${offset}/${limit}`;
    }

    fetchProducts(endpoint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  // --- Fetch Filters ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, sizeRes] = await Promise.all([
          api.get("/categories"),
          api.get("/sizes"),
        ]);
        setCategories(catRes.data);
        setSizes(sizeRes.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  // --- Filter Handlers (no reload) ---
  const handleCategoryChange = async (value) => {
    setSelectedCategory(value || null);
    setSelectedSize(null);
    setSelectedSort(null);
    setLimit(12);

    if (!value) {
      // If cleared:
      if (searchCategory) {
        // If user is on /store/:searchCategory, revert to that route category
        setSelectedCategory(searchCategory);
        await fetchProducts(`/filter/category/${searchCategory}/${offset}/12`);
      } else {
        await fetchProducts(`/products/price-range/${offset}/12`);
      }
      return;
    }

    // Navigate to keep URL consistent (optional but cleaner for sharing)
    navigate(`/store/${value}`);
    // fetch will happen via route useEffect
  };

  const handleSizeChange = async (value) => {
    setSelectedSize(value || null);
    setSelectedSort(null);
    setLimit(12);

    if (!value) {
      // revert to category or default
      if (selectedCategory) {
        await fetchProducts(
          `/filter/category/${selectedCategory}/${offset}/12`,
        );
      } else {
        await fetchProducts(`/products/price-range/${offset}/12`);
      }
      return;
    }

    await fetchProducts(`/filter/size/${value}/${offset}/12`);
  };

  const handleSortChange = async (value) => {
    setSelectedSort(value || null);
    setLimit(12);

    if (!value) {
      // revert to size/category/default
      if (selectedSize) {
        await fetchProducts(`/filter/size/${selectedSize}/${offset}/12`);
      } else if (selectedCategory) {
        await fetchProducts(
          `/filter/category/${selectedCategory}/${offset}/12`,
        );
      } else {
        await fetchProducts(`/products/price-range/${offset}/12`);
      }
      return;
    }

    await fetchProducts(`/sort/${value}/${offset}/12`);
  };

  const handleReset = async () => {
    setSelectedSize(null);
    setSelectedSort(null);
    setLimit(12);

    // Reset to base store (no category) OR current route category?
    // You requested "reset", so most apps reset to plain /store.
    navigate("/store");
    // fetch will happen via route useEffect
  };

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      <div className="bg-white dark:bg-neutral-900 min-h-screen font-sans text-neutral-800 dark:text-neutral-200 transition-colors duration-300">
        <Notification />

        {/* Header */}
        <PageHeader
          title={
            searchCategory
              ? `${searchCategory} ${t("collection") || "Collection"}`
              : t("the_store") || "The Store"
          }
          subtitle={
            t("store_desc") ||
            "Browse our full range of organic, farm-fresh products delivered straight to your door."
          }
          breadcrumb={[
            { label: t("home") || "Home", href: "/" },
            {
              label: t("store") || "Shop",
              href: searchCategory ? "/store" : undefined,
            },
            ...(searchCategory ? [{ label: searchCategory }] : []),
          ]}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* --- BUY AGAIN (Smooth Dropdown) --- */}
          <div
            className={`grid transition-all duration-700 ease-in-out ${buyAgainProducts.length > 0 ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
          >
            <div className="overflow-hidden">
              <section className="py-12 bg-emerald-50/30 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/20 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
                      {t("buy_again") || "Buy Again"}
                      <span className="text-emerald-500 text-lg">↻</span>
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                      {t("buy_again_subtitle") ||
                        "Your past favorites, ready to reorder."}
                    </p>
                  </div>

                  {/* Horizontal Scroll Container */}
                  <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-emerald-200 dark:scrollbar-thumb-emerald-800">
                    {buyAgainProducts.map((product) => (
                      <div
                        key={product.id}
                        className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start"
                      >
                        <ItemCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
          {/* Filters Accordion */}
          <div className="my-8 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm transition-colors overflow-hidden">
            {/* Header Button */}
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 p-4"
            >
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-200 font-semibold">
                <AiOutlineFilter className="text-xl" />
                <span>{t("filters") || "Filters"}</span>
              </div>

              {/* Chevron (native CSS rotation) */}
              <span
                className={`transition-transform duration-200 ${
                  filtersOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                ▼
              </span>
            </button>

            {/* Animated Body */}
            <div
              ref={filtersBodyRef}
              style={{ maxHeight: filtersMaxHeight }}
              className={`transition-[max-height] duration-300 ease-in-out`}
            >
              <div
                className={`px-4 pb-4 transition-opacity duration-200 ${
                  filtersOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Select
                    placeholder={t("category") || "Category"}
                    size="large"
                    className="w-full"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    options={categories.map((c) => ({
                      label: c.name,
                      value: c.name,
                    }))}
                    allowClear
                  />

                  <Select
                    placeholder={t("size") || "Size"}
                    size="large"
                    className="w-full"
                    value={selectedSize}
                    onChange={handleSizeChange}
                    options={sizes.map((s) => ({ label: s, value: s }))}
                    allowClear
                  />

                  <Select
                    placeholder={t("sort_price") || "Sort Price"}
                    size="large"
                    className="w-full"
                    value={selectedSort}
                    onChange={handleSortChange}
                    options={[
                      {
                        label: t("low_to_high") || "Low to High",
                        value: "asc",
                      },
                      {
                        label: t("high_to_low") || "High to Low",
                        value: "desc",
                      },
                    ]}
                    allowClear
                  />

                  <button
                    onClick={handleReset}
                    className="w-full px-4 py-[10px] text-sm font-semibold rounded-lg transition-colors
                     text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30
                     border border-red-100 dark:border-red-900/40"
                  >
                    {t("reset") || "Reset"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-800 rounded-3xl transition-colors">
              <div className="inline-block p-6 rounded-full bg-neutral-50 dark:bg-neutral-700 mb-4">
                <AiOutlineFilter className="text-4xl text-neutral-300 dark:text-neutral-400" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                {t("no_products_found") || "No Products Found"}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                {t("adjust_filters") ||
                  "Try adjusting your filters or search criteria."}
              </p>
              <button
                onClick={handleReset}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 transition-colors"
              >
                {t("clear_filters") || "Clear All Filters"}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  <div key={product.id} className="h-full">
                    <ItemCard product={product} />
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="mt-16 text-center">
                <button
                  onClick={() => setLimit((prev) => prev + 12)}
                  className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold hover:bg-black dark:hover:bg-neutral-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  {t("load_more_products") || "Load More Products"}
                </button>
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </ConfigProvider>
  );
};

export default Store;
