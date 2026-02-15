import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import Notification from "../components/Notification";
import { RiShoppingBag3Line, RiAddLine, RiSubtractLine } from "react-icons/ri";

const SingleProduct = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState({});
  const [image, setImage] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [sizes, setSizes] = useState([]); // Renamed from 'products' to 'sizes' for clarity
  const [quantity, setQuantity] = useState(1);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(4);

  // Fetch related products (e.g. random or same category)
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
    toast.success("Added to cart");
  };

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      <Notification />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* --- LEFT COLUMN: Image Gallery --- */}
          <div className="flex flex-col gap-6">
            <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center">
              <img
                src={image}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-all duration-500 hover:scale-105"
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
                        ? "border-green-600 shadow-md ring-2 ring-green-100"
                        : "border-transparent hover:border-gray-200"
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
              <span className="w-fit bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                New Arrival
              </span>
            )}

            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-green-700">
                ৳{product.price}
              </span>
              {product.stock < 10 && (
                <span className="text-red-500 text-sm font-medium bg-red-50 px-3 py-1 rounded-full">
                  Only {product.stock} left!
                </span>
              )}
            </div>

            <p className="text-gray-500 leading-relaxed mb-8 border-b border-gray-100 pb-8">
              {product.description ||
                "Experience the authentic taste of nature with our premium organic selection. Sourced responsibly and delivered fresh to your doorstep."}
            </p>

            {/* Sizes / Variants */}
            {sizes.length > 1 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Select Size
                </h3>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProduct(p)}
                      className={`px-6 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        product.id === p.id
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-600 hover:border-green-300"
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
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-fit">
                <button
                  onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white rounded-full transition-colors"
                >
                  <RiSubtractLine />
                </button>
                <span className="w-10 text-center font-semibold text-lg text-gray-800">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    quantity < product.stock && setQuantity((q) => q + 1)
                  }
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white rounded-full transition-colors"
                >
                  <RiAddLine />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
              >
                <RiShoppingBag3Line size={20} /> Add to Cart
              </button>
            </div>

            {/* Quick Buy Button (Optional) */}
            <button className="w-full border-2 border-gray-900 text-gray-900 font-bold py-3 rounded-full hover:bg-gray-900 hover:text-white transition-colors">
              Buy It Now
            </button>

            {/* Meta Info */}
            <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="block font-semibold text-gray-900">
                  Category
                </span>
                {product.category}
              </div>
              <div>
                <span className="block font-semibold text-gray-900">
                  Delivery
                </span>
                2-3 Days within Dhaka
              </div>
            </div>
          </div>
        </div>

        {/* --- Related Products Section --- */}
        <div className="mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              You Might Also Like
            </h2>
            <button
              onClick={() => setLimit(limit + 4)}
              className="text-green-600 font-semibold hover:text-green-700 hover:underline"
            >
              Load More
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
