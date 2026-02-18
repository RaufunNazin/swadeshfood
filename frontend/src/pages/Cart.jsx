import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import Notification from "../components/Notification";
import { RxCross2 } from "react-icons/rx";
import { RiAddLine, RiSubtractLine, RiShoppingBag3Line } from "react-icons/ri";
import { useLanguage } from "../contexts/LanguageContext"; // Import Language Context

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    if (!localStorage.getItem("cart")) {
      localStorage.setItem("cart", JSON.stringify([]));
    }
    setCart(JSON.parse(localStorage.getItem("cart")));
  }, []);

  const updateQuantity = (productId, increment, stock) => {
    const updatedCartItems = cart
      .map((item) =>
        item.id === productId &&
        item.quantity + increment <= stock &&
        item.quantity + increment > 0
          ? { ...item, quantity: item.quantity + increment }
          : item,
      )
      .filter((item) => item.quantity > 0);
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
    setCart(updatedCartItems);
  };

  const removeFromCart = (productId) => {
    const updatedCartItems = cart.filter((item) => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
    setCart(updatedCartItems);
  };

  // Calculations
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shipping = 50;
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-white flex flex-col transition-colors duration-300">
      <Notification />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("shopping_cart") || "Shopping Cart"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {cart.length > 0
              ? `${t("you_have") || "You have"} ${cart.length} ${t("items_in_cart") || "items in your cart"}`
              : t("cart_empty_msg") || "Your cart is currently empty"}
          </p>
        </div>

        {cart.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto">
            <div className="bg-green-50 dark:bg-green-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <RiShoppingBag3Line className="text-4xl text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("cart_is_empty") || "Your cart is empty"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {t("looks_like_empty") ||
                "Looks like you haven't added anything to your cart yet."}
            </p>
            <button
              onClick={() => navigate("/store")}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg shadow-green-200 dark:shadow-none"
            >
              {t("start_shopping") || "Start Shopping"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Cart Items List */}
            <div className="flex-1 space-y-4">
              {cart.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 sm:gap-6 items-center"
                >
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden">
                    <img
                      src={product.image1}
                      alt={product.name}
                      className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate pr-4">
                        {product.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                      >
                        <RxCross2 size={20} />
                      </button>
                    </div>

                    <p className="text-green-600 dark:text-green-400 font-bold mb-4">
                      ৳ {parseFloat(product.price).toFixed(2)}
                    </p>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                        <button
                          onClick={() =>
                            updateQuantity(product.id, -1, product.stock)
                          }
                          className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:shadow-sm rounded-full transition-all"
                        >
                          <RiSubtractLine size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-800 dark:text-white text-sm">
                          {product.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(product.id, 1, product.stock)
                          }
                          className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:shadow-sm rounded-full transition-all"
                        >
                          <RiAddLine size={14} />
                        </button>
                      </div>
                      <span className="text-gray-400 dark:text-gray-500 text-sm hidden sm:block">
                        {t("total") || "Total"}:{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          ৳ {(product.price * product.quantity).toFixed(2)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:w-96 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {t("order_summary") || "Order Summary"}
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>{t("subtotal") || "Subtotal"}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      ৳ {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>{t("shipping") || "Shipping"}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      ৳ {shipping.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>{t("total") || "Total"}</span>
                    <span className="text-green-600 dark:text-green-400">
                      ৳ {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-gray-900 dark:bg-green-600 text-white py-4 rounded-full font-bold hover:bg-black dark:hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  {t("proceed_checkout") || "Proceed to Checkout"}
                </button>

                <button
                  onClick={() => navigate("/store")}
                  className="w-full text-center mt-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium text-sm"
                >
                  {t("continue_shopping") || "Continue Shopping"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
