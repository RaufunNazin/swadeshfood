import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Notification from "../components/Notification";
import { RxCross2 } from "react-icons/rx";
import { RiAddLine, RiSubtractLine, RiShoppingBag3Line } from "react-icons/ri";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useStoreSettings } from "../contexts/StoreSettingsContext";

const Cart = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { cart, updateQuantity, removeFromCart, subtotal } = useCart();
  const { storeSettings, loading: settingsLoading } = useStoreSettings();

  const shipping = useMemo(() => {
    const threshold = Number(storeSettings.free_delivery_threshold || 0);
    const charge = Number(storeSettings.delivery_charge || 0);
    return subtotal >= threshold ? 0 : charge;
  }, [subtotal, storeSettings]);

  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 min-h-screen font-sans text-neutral-800 dark:text-white flex flex-col transition-colors duration-300">
      <Notification />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            {t("shopping_cart") || "Shopping Cart"}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            {cart.length > 0
              ? `${t("you_have") || "You have"} ${cart.length} ${
                  t("items_in_cart") || "items in your cart"
                }`
              : t("cart_empty_msg") || "Your cart is currently empty"}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-12 text-center shadow-sm border border-neutral-100 dark:border-neutral-700 max-w-2xl mx-auto">
            <div className="bg-green-50 dark:bg-green-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <RiShoppingBag3Line className="text-4xl text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              {t("cart_is_empty") || "Your cart is empty"}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8">
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
            <div className="flex-1 space-y-4">
              {cart.map((product) => {
                const stock = Number(product.stock ?? 0);
                const qty = Number(product.quantity ?? 1);
                const atMax = stock > 0 && qty >= stock;
                const outOfStock = stock <= 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 flex gap-4 sm:gap-6 items-center"
                  >
                    <div className="w-24 h-24 flex-shrink-0 bg-neutral-50 dark:bg-neutral-700 rounded-xl overflow-hidden">
                      <img
                        src={product.image1}
                        alt={product.name}
                        className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-neutral-900 dark:text-white text-lg truncate pr-4">
                          {product.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                        >
                          <RxCross2 size={20} />
                        </button>
                      </div>

                      <p className="text-green-600 dark:text-green-400 font-bold">
                        ৳ {Number(product.price).toFixed(2)}
                      </p>

                      {/* Stock hint */}
                      <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                        {outOfStock
                          ? t("out_of_stock") || "Out of stock"
                          : stock <= 10
                            ? t("only_left", { count: stock }) ||
                              `Only ${stock} left`
                            : ""}
                      </p>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-full px-3 py-1">
                          <button
                            disabled={qty <= 1}
                            onClick={() =>
                              updateQuantity(product.id, -1, stock)
                            }
                            className={`w-6 h-6 flex items-center justify-center rounded-full transition-all
                              ${
                                qty <= 1
                                  ? "opacity-40 cursor-not-allowed"
                                  : "text-neutral-500 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-600 hover:shadow-sm"
                              }`}
                          >
                            <RiSubtractLine size={14} />
                          </button>

                          <span className="w-8 text-center font-semibold text-neutral-800 dark:text-white text-sm">
                            {qty}
                          </span>

                          <button
                            disabled={product.quantity >= product.stock}
                            onClick={() => updateQuantity(product.id, 1, stock)}
                            className={`w-6 h-6 flex items-center justify-center rounded-full transition-all
                              ${
                                outOfStock || atMax
                                  ? "opacity-40 cursor-not-allowed"
                                  : "text-neutral-500 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-600 hover:shadow-sm"
                              }`}
                            title={
                              atMax
                                ? t("max_stock_reached", { count: stock }) ||
                                  `Max ${stock}`
                                : undefined
                            }
                          >
                            <RiAddLine size={14} />
                          </button>
                        </div>

                        <span className="text-neutral-400 dark:text-neutral-500 text-sm hidden sm:block">
                          {t("total") || "Total"}:{" "}
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                            ৳ {(Number(product.price) * qty).toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:w-96 flex-shrink-0">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 sticky top-24">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                  {t("order_summary") || "Order Summary"}
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                    <span>{t("subtotal") || "Subtotal"}</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-200">
                      ৳ {subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                    <span>{t("shipping") || "Shipping"}</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-200">
                      {settingsLoading ? (
                        "..."
                      ) : shipping === 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">
                          {t("free") || "FREE"}
                        </span>
                      ) : (
                        `৳ ${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="h-px bg-neutral-100 dark:bg-neutral-700 my-2" />

                  <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-white">
                    <span>{t("total") || "Total"}</span>
                    <span className="text-green-600 dark:text-green-400">
                      ৳ {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-neutral-900 dark:bg-green-600 text-white py-4 rounded-full font-bold hover:bg-black dark:hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  {t("proceed_checkout") || "Proceed to Checkout"}
                </button>

                <button
                  onClick={() => navigate("/store")}
                  className="w-full text-center mt-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white font-medium text-sm"
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
