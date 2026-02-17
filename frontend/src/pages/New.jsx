import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import "react-toastify/dist/ReactToastify.css";
import api from "../api";
import { AiOutlineLoading, AiOutlineShopping } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import Notification from "../components/Notification";

const New = () => {
  const navigate = useNavigate();
  const [offset] = useState(0);
  const [limit, setLimit] = useState(12);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/new/price-range/${offset}/${limit}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [limit, offset]);

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      <Notification />

      {/* --- Modern Header --- */}
      <div className="relative bg-green-50 py-20 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 text-center px-4">
          <span className="text-green-600 font-bold tracking-widest uppercase text-sm mb-3 block">
            Fresh In
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            New Arrivals
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto text-lg">
            Be the first to explore our latest organic additions. Handpicked for
            quality and freshness.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <AiOutlineLoading className="text-green-600 text-5xl animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-3xl">
            <div className="inline-block p-6 bg-white rounded-full shadow-sm mb-6">
              <AiOutlineShopping className="text-4xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              New products coming soon!
            </h2>
            <p className="text-gray-500 mb-8">
              We are restocking our shelves with fresh goods. Check back later.
            </p>
            <button
              onClick={() => navigate("/store")}
              className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold"
            >
              Browse Main Store
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
                className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-full font-bold hover:bg-gray-900 hover:text-white transition-all"
              >
                View More Arrivals
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
