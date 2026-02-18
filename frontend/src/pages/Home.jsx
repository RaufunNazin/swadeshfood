import { useEffect, useState } from "react";
import api from "../api";
import "../App.css";
import { AiOutlineLoading, AiOutlineArrowRight } from "react-icons/ai";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import ItemCard from "../components/ItemCard";
import Notification from "../components/Notification";
import { useLanguage } from "../contexts/LanguageContext"; // Import Language Context

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Language Context
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, newProdRes, catRes] = await Promise.all([
          api.get(`/products/price-range/0/8`),
          api.get(`/products/new/price-range/0/4`),
          api.get("/categories"),
        ]);
        setProducts(prodRes.data);
        setNewProducts(newProdRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white dark:bg-neutral-900 min-h-screen font-sans text-neutral-800 dark:text-neutral-200 transition-colors duration-300">
      <Notification />

      {/* --- HERO SECTION --- */}
      <div className="relative h-[450px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="farm.png"
            alt="Fresh Farm Produce"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-neutral-900/80 dark:bg-black/80 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl space-y-8 animate-fade-in-up flex flex-col items-center mx-auto text-center">
              <span className="inline-block px-4 py-1 rounded-full bg-green-500/20 backdrop-blur-md border border-green-400/30 text-green-300 text-sm font-semibold tracking-wide uppercase">
                {t("direct_farm") || "Direct from Farm"}
              </span>
              <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight shadow-sm">
                {t("organic") || "Organic"}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
                  {t("living") || "Living."}
                </span>
              </h1>
              <p className="text-xl text-neutral-200 leading-relaxed font-light">
                {t("hero_subtitle") ||
                  "Nourish your family with the purest ingredients. No chemicals, just nature's love."}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate("/store")}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-green-900/30 flex justify-center items-center gap-3 transform hover:-translate-y-1"
                >
                  {t("start_shopping") || "Start Shopping"}{" "}
                  <AiOutlineArrowRight />
                </button>
                <button
                  onClick={() => navigate("/connect")}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-bold transition-all border border-white/20"
                >
                  {t("our_story") || "Our Story"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CATEGORIES --- */}
      <div className="py-20 bg-white dark:bg-neutral-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {t("browse_aisles") || "Browse Aisles"}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">
              {t("aisles_subtitle") ||
                "Everything you need for a healthy kitchen"}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(`/store/${category.name}`)}
                className="group flex flex-col items-center gap-4 transition-all duration-300"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-100 dark:group-hover:shadow-neutral-900 transition-all duration-300 group-hover:scale-110 relative overflow-hidden ring-4 ring-transparent group-hover:ring-emerald-50 dark:group-hover:ring-neutral-700">
                  <span className="text-4xl md:text-5xl font-bold text-emerald-600/80 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors drop-shadow-sm">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <span className="font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 text-lg transition-colors">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- WEEKLY HARVEST --- */}
      <section className="py-24 bg-neutral-50/50 dark:bg-neutral-800/30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-14">
            <div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase text-xs mb-2 block">
                {t("customer_favorites") || "Customer Favorites"}
              </span>
              <h2 className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
                {t("weekly_harvest") || "Weekly Harvest"}
              </h2>
            </div>
            <button
              onClick={() => navigate("/store")}
              className="hidden md:flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-semibold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
            >
              {t("view_all") || "View All"}{" "}
              <AiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <AiOutlineLoading className="text-emerald-600 dark:text-emerald-400 text-5xl animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ItemCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <button
              onClick={() => navigate("/store")}
              className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide text-sm border-b-2 border-emerald-100 dark:border-emerald-800 pb-1"
            >
              {t("view_all_products") || "View All Products"}
            </button>
          </div>
        </div>
      </section>

      {/* --- NEW ARRIVALS --- */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-neutral-900 dark:to-neutral-800 transition-colors">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-200/30 dark:bg-green-900/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-200/30 dark:bg-yellow-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-green-600 dark:text-green-400 font-bold tracking-widest uppercase text-sm bg-green-100 dark:bg-green-900/30 px-4 py-1 rounded-full">
              {t("just_landed") || "Just Landed"}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mt-6 mb-4">
              {t("fresh_arrivals") || "Fresh Arrivals"}
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 font-light">
              {t("fresh_subtitle") ||
                "Be the first to taste the season's newest bounty."}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <AiOutlineLoading className="text-green-600 dark:text-green-400 text-4xl animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <ItemCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <button
              onClick={() => navigate("/new")}
              className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-black dark:hover:bg-neutral-200 px-10 py-4 rounded-full font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              {t("discover_more") || "Discover More"}
            </button>
          </div>
        </div>
      </section>

      {/* --- TRUST BANNER --- */}
      <section className="py-24 bg-stone-50 dark:bg-neutral-900 relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="space-y-8">
            <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
            <h2 className="text-4xl md:text-6xl font-serif text-neutral-800 dark:text-neutral-100 leading-tight">
              <span className="italic text-emerald-700 dark:text-emerald-400">
                &quot;{t("trust_p1") || "From our soil"}
              </span>{" "}
              {t("trust_p2") || "to your soul."}&quot;
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
              {t("trust_subtitle") ||
                "We partner directly with sustainable farmers to bring you produce that is 100% Organic, 100% Swadesh. It's not just food, it's a promise of purity."}
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate("/connect")}
                className="inline-block px-8 py-3 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors uppercase tracking-widest text-xs"
              >
                {t("our_mission") || "Our Mission"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
