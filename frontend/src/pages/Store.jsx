import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import "react-toastify/dist/ReactToastify.css";
import api from "../api";
import { AiOutlineFilter } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import { Select, ConfigProvider, theme as antdTheme } from "antd";
import ItemCard from "../components/ItemCard";
import Notification from "../components/Notification";
import { useLanguage } from "../contexts/LanguageContext"; // Import Language Context
import { useTheme } from "../contexts/ThemeContext";
import { ItemCardSkeleton } from "../components/Skeletons";

const Store = () => {
  const { searchCategory } = useParams();
  const navigate = useNavigate();
  const [offset] = useState(0);
  const [limit, setLimit] = useState(12);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);

  // Language Context
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Fetch Logic
  useEffect(() => {
    setLoading(true);
    let endpoint = `/products/price-range/${offset}/${limit}`;

    if (searchCategory) {
      endpoint = `/filter/category/${searchCategory}/${offset}/${limit}`;
    }

    api
      .get(endpoint)
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [searchCategory, limit, offset]);

  // Fetch Filters
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

  // Filter Handlers
  const handleFilter = (type, value) => {
    setLoading(true);
    let endpoint = `/products/${offset}/${limit}`; // default reset

    if (type === "sort") endpoint = `/sort/${value}/${offset}/${limit}`;
    if (type === "category")
      endpoint = `/filter/category/${value}/${offset}/${limit}`;
    if (type === "size") endpoint = `/filter/size/${value}/${offset}/${limit}`;
    if (type === "new") endpoint = `/filter/new/${value}/${offset}/${limit}`;

    api
      .get(endpoint)
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
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

        {/* --- Header Section --- */}
        <div className="bg-neutral-50 dark:bg-neutral-800 py-16 text-center border-b border-neutral-100 dark:border-neutral-700 transition-colors">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">
            {searchCategory
              ? `${searchCategory} ${t("collection") || "Collection"}`
              : t("the_store") || "The Store"}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto text-lg">
            {t("store_desc") ||
              "Browse our full range of organic, farm-fresh products delivered straight to your door."}
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* --- Toolbar / Filters --- */}
          <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-4 bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm sticky top-24 z-30 transition-colors">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-300 font-medium">
              <AiOutlineFilter className="text-xl" />
              <span>{t("filter_by") || "Filter By"}:</span>
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Select
                placeholder={t("category") || "Category"}
                size="large"
                style={{ width: 175 }}
                onChange={(val) => handleFilter("category", val)}
                options={categories.map((c) => ({
                  label: c.name,
                  value: c.name,
                }))}
                allowClear
                // Note: AntD Select dark mode support depends on global ConfigProvider.
                // Without it, the dropdown might remain white, which is usually acceptable.
              />
              <Select
                placeholder={t("size") || "Size"}
                size="large"
                style={{ width: 175 }}
                onChange={(val) => handleFilter("size", val)}
                options={sizes.map((s) => ({ label: s, value: s }))}
                allowClear
              />
              <Select
                placeholder={t("sort_price") || "Sort Price"}
                size="large"
                style={{ width: 175 }}
                onChange={(val) => handleFilter("sort", val)}
                options={[
                  { label: t("low_to_high") || "Low to High", value: "asc" },
                  { label: t("high_to_low") || "High to Low", value: "desc" },
                ]}
              />
              <button
                onClick={() => {
                  navigate("/store");
                  window.location.reload();
                }}
                className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors font-semibold"
              >
                {t("reset") || "Reset"}
              </button>
            </div>
          </div>

          {/* --- Product Grid --- */}
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
                onClick={() => {
                  navigate("/store");
                  window.location.reload();
                }}
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
                  onClick={() => setLimit(limit + 12)}
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
