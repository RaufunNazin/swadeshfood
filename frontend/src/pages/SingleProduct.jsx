import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import api from "../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import Notification from "../components/Notification";
import { RiShoppingBag3Line, RiAddLine, RiSubtractLine } from "react-icons/ri";
import { useLanguage } from "../contexts/LanguageContext"; // Import Language Context

const SingleProduct = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState({});
  const [image, setImage] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [offset] = useState(0);
  const [limit, setLimit] = useState(4);
  const { t } = useLanguage();

  // Fetch related products
  useEffect(() => {
    api
      .get(`/products/price-range/${offset}/${limit}`)
      .then((res) => setAllProducts(res.data))
      .catch((err) => console.log(err));
  }, [limit, offset]);

  // Fetch sizes/variants by name
  const getProductsByName = (name) => {
    api
      .get(`/name/products/${name}`)
      .then((res) => setSizes(res.data))
      .catch((err) => console.log(err));
  };

  // Fetch main product details
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on load
    api
      .get(`/products/${productId}`)
      .then((res) => {
        setProduct(res.data);
        setImage(res.data.image1);
        getProductsByName(res.data.name);
      })
      .catch((err) => console.log(err));
  }, [productId]);

  const handleAddToCart = () => {
    const updatedCartItems = [
      ...(JSON.parse(localStorage.getItem("cart")) || []),
      { ...product, quantity },
    ];
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
    toast.success(t("added_to_cart") || "Added to cart");
  };

  return (
    <div className="bg-white dark:bg-neutral-900 min-h-screen font-sans text-neutral-800 dark:text-neutral-200 transition-colors duration-300">
      <Notification />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* --- LEFT COLUMN: Image Gallery --- */}
          <div className="flex flex-col gap-6">
            <div className="aspect-square bg-neutral-50 dark:bg-neutral-800 rounded-3xl overflow-hidden shadow-sm border border-neutral-100 dark:border-neutral-700 flex items-center justify-center">
              <img
                src={image}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-500 hover:scale-105"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {[product.image1, product.image2, product.image3]
                .filter(Boolean)
                .map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImage(img)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      image === img
                        ? "border-green-600 dark:border-green-500 shadow-md ring-2 ring-green-100 dark:ring-green-900/50"
                        : "border-transparent hover:border-neutral-200 dark:hover:border-neutral-600"
                    }`}
                  >
                    <img
                      src={img}
                      alt="thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
            </div>
          </div>

          {/* --- RIGHT COLUMN: Product Details --- */}
          <div className="flex flex-col justify-center">
            {product.new === 1 && (
              <span className="w-fit bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                {t("new_arrival") || "New Arrival"}
              </span>
            )}

            <h1 className="text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-green-700 dark:text-green-400">
                ৳{product.price}
              </span>
              {product.stock < 10 && (
                <span className="text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">
                  {t("only_left", { count: product.stock }) ||
                    `Only ${product.stock} left!`}
                </span>
              )}
            </div>

            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8 border-b border-neutral-100 dark:border-neutral-700 pb-8">
              {product.description ||
                t("product_desc_default") ||
                "Experience the authentic taste of nature with our premium organic selection. Sourced responsibly and delivered fresh to your doorstep."}
            </p>

            {/* Sizes / Variants */}
            {sizes.length > 1 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide mb-3">
                  {t("select_size") || "Select Size"}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProduct(p)}
                      className={`px-6 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        product.id === p.id
                          ? "border-green-600 bg-green-50 text-green-700 dark:border-green-500 dark:bg-green-900/30 dark:text-green-400"
                          : "border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:border-green-300 dark:hover:border-green-500"
                      }`}
                    >
                      {p.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Quantity Counter */}
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 py-2 w-fit border border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
                  className="w-8 h-8 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-700 rounded-full transition-colors"
                >
                  <RiSubtractLine />
                </button>
                <span className="w-10 text-center font-semibold text-lg text-neutral-800 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    quantity < product.stock && setQuantity((q) => q + 1)
                  }
                  className="w-8 h-8 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-700 rounded-full transition-colors"
                >
                  <RiAddLine />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-green-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <RiShoppingBag3Line size={20} />{" "}
                {t("add_to_cart") || "Add to Cart"}
              </button>
            </div>

            {/* Quick Buy Button (Optional) */}
            <button className="w-full border-2 border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-white font-bold py-3 rounded-full hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-colors">
              {t("buy_it_now") || "Buy It Now"}
            </button>

            {/* Meta Info */}
            <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-700 grid grid-cols-2 gap-4 text-sm text-neutral-500 dark:text-neutral-400">
              <div>
                <span className="block font-semibold text-neutral-900 dark:text-white">
                  {t("category") || "Category"}
                </span>
                {product.category}
              </div>
              <div>
                <span className="block font-semibold text-neutral-900 dark:text-white">
                  {t("delivery") || "Delivery"}
                </span>
                {t("delivery_time") || "2-3 Days within Dhaka"}
              </div>
            </div>
          </div>
        </div>

        {/* --- Related Products Section --- */}
        <div className="mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {t("might_like") || "You Might Also Like"}
            </h2>
            <button
              onClick={() => setLimit(limit + 4)}
              className="text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300 hover:underline"
            >
              {t("load_more") || "Load More"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {allProducts.map((p) => (
              <ItemCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SingleProduct;
