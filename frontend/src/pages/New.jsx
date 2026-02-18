import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import "react-toastify/dist/ReactToastify.css";
import api from "../api";
import { AiOutlineLoading, AiOutlineShopping } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import Notification from "../components/Notification";
import { useLanguage } from "../contexts/LanguageContext"; // Import Language Context

const New = () => {
  const navigate = useNavigate();
  const [offset] = useState(0);
  const [limit, setLimit] = useState(12);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Language Context
  const { t } = useLanguage();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/new/price-range/${offset}/${limit}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [limit, offset]);

  return (
    <div className="bg-white dark:bg-neutral-900 min-h-screen font-sans text-neutral-800 dark:text-neutral-200 transition-colors duration-300">
      <Notification />

      {/* --- Modern Header --- */}
      <div className="relative bg-green-50 dark:bg-neutral-800 py-20 overflow-hidden transition-colors">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-200/40 dark:bg-green-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 text-center px-4">
          <span className="text-green-600 dark:text-green-400 font-bold tracking-widest uppercase text-sm mb-3 block">
            {t("fresh_in") || "Fresh In"}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-4">
            {t("new_arrivals_title") || "New Arrivals"}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto text-lg">
            {t("new_arrivals_desc") ||
              "Be the first to explore our latest organic additions. Handpicked for quality and freshness."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <AiOutlineLoading className="text-green-600 dark:text-green-400 text-5xl animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-neutral-50 dark:bg-neutral-800 rounded-3xl transition-colors">
            <div className="inline-block p-6 bg-white dark:bg-neutral-700 rounded-full shadow-sm mb-6">
              <AiOutlineShopping className="text-4xl text-neutral-400 dark:text-neutral-300" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              {t("coming_soon_title") || "New products coming soon!"}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8">
              {t("restocking_msg") ||
                "We are restocking our shelves with fresh goods. Check back later."}
            </p>
            <button
              onClick={() => navigate("/store")}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white px-8 py-3 rounded-full transition-colors font-semibold shadow-lg shadow-green-200 dark:shadow-none"
            >
              {t("browse_main_store") || "Browse Main Store"}
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

            <div className="mt-16 text-center">
              <button
                onClick={() => setLimit(limit + 12)}
                className="px-8 py-3 border-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white rounded-full font-bold hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-all"
              >
                {t("view_more_arrivals") || "View More Arrivals"}
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default New;
