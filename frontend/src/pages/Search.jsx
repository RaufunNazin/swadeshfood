import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import api from "../api";
import { AiOutlineLoading, AiOutlineSearch } from "react-icons/ai";
import ItemCard from "../components/ItemCard";
import Notification from "../components/Notification";

const Search = () => {
  const { searchText } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states (kept for future implementation, simplified for now)
  const offset = 0;
  const limit = 20;

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      setProducts([]); // Clear previous results immediately

      try {
        // Ensure searchText is encoded (e.g., "rice oil" -> "rice%20oil")
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
    <div className="bg-gray-50 min-h-screen font-sans">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      <Notification />

      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <p className="text-gray-500 text-sm mb-2 uppercase tracking-wide">
            Search Results
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-brand">&quot;{searchText}&quot;</span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[50vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AiOutlineLoading className="text-brand text-6xl animate-spin mb-4" />
            <p className="text-gray-500">Searching our inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-6">
              <AiOutlineSearch className="text-4xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No products found
            </h2>
            <p className="text-gray-500 mb-8 max-w-md">
              We couldn&apos;t find anything matching &quot;{searchText}&quot;.
              Try checking for typos or use a more general term.
            </p>
            <button
              onClick={() => navigate("/store")}
              className="bg-brand text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors shadow-sm font-medium"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-6">Found {products.length} items</p>
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
