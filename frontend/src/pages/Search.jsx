import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import api from "../api";
import { AiOutlineLoading, AiOutlineSearch } from "react-icons/ai";
import ItemCard from "../components/ItemCard";
import Notification from "../components/Notification";
import { useLanguage } from "../contexts/LanguageContext"; // Import Language Context

const Search = () => {
  const { searchText } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage(); // Language hook

  // Pagination states (kept for future implementation)
  const offset = 0;
  const limit = 20;

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      setProducts([]); // Clear previous results immediately

      try {
        // Ensure searchText is encoded
        const encodedText = encodeURIComponent(searchText);
        const res = await api.get(`/search/${encodedText}/${offset}/${limit}`);

        if (res.status === 200 && Array.isArray(res.data)) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (searchText) {
      getProducts();
    }
  }, [searchText]);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 min-h-screen font-sans transition-colors duration-300">
      <Notification />

      {/* Simple Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-2 uppercase tracking-wide">
            {t("search_results") || "Search Results"}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <span className="text-brand dark:text-green-400">
              &quot;{searchText}&quot;
            </span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[50vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AiOutlineLoading className="text-brand dark:text-green-500 text-6xl animate-spin mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("searching") || "Searching our inventory..."}
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-neutral-100 dark:bg-neutral-700 p-6 rounded-full mb-6">
              <AiOutlineSearch className="text-4xl text-neutral-400 dark:text-neutral-300" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
              {t("no_results") || "No products found"}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md">
              {t("no_match_1") || "We couldn't find anything matching"} &quot;
              {searchText}&quot;.{" "}
              {t("no_match_2") ||
                "Try checking for typos or use a more general term."}
            </p>
            <button
              onClick={() => navigate("/store")}
              className="bg-brand hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white px-8 py-3 rounded-md transition-colors shadow-sm font-medium"
            >
              {t("browse_all") || "Browse All Products"}
            </button>
          </div>
        ) : (
          <>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              {t("found") || "Found"} {products.length} {t("items") || "items"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ItemCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Search;
