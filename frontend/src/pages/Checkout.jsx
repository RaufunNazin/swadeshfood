import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useMemo, useState } from "react";
import Notification from "../components/Notification";
import api from "../api";
import { Modal, Radio, ConfigProvider, theme as antdTheme } from "antd";
import {
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiUserLine,
} from "react-icons/ri";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import FreeDeliveryBar from "../components/FreeDeliveryBar";
import { CheckoutSkeleton } from "../components/Skeletons";
import { useStoreSettings } from "../contexts/StoreSettingsContext";
import { useCart } from "../contexts/CartContext";

const InputField = ({
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = "text",
  required,
}) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
      <Icon />
    </div>
    <input
      type={type}
      className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 outline-none transition-all bg-neutral-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-700 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
      placeholder={placeholder + (required ? "*" : "")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

InputField.propTypes = {
  icon: PropTypes.elementType,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  type: PropTypes.string,
  required: PropTypes.bool,
};

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();
  const { t } = useLanguage();

  const { storeSettings } = useStoreSettings();

  // CartContext source of truth
  const {
    cart,
    setQuantity,
    removeFromCart,
    clearCart,
    subtotal,
  } = useCart();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  // Login modal
  const [openLogin, setOpenLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const getProfile = () => {
    api
      .get("/me")
      .then((res) => {
        if (res.status === 200) setUser(res.data);
      })
      .catch((err) => console.log(err));
  };

  // Prefill if coming back from login
  useEffect(() => {
    if (state && state.from === "/login") {
      setName(state.name || "");
      setEmail(state.email || "");
      setPhone(state.phone || "");
      setAddress(state.address || "");
      setDescription(state.description || "");
    }
    getProfile();
  }, [state]);

  // Validate live stock & prices for current cart
  useEffect(() => {
    const validateCartLive = async () => {
      try {
        if (!cart.length) return;

        const liveList = await Promise.all(
          cart.map(
            async (item) => (await api.get(`/products/${item.id}`)).data,
          ),
        );

        let changed = false;

        for (const live of liveList) {
          const item = cart.find((c) => c.id === live.id);
          if (!item) continue;

          const liveStock = Number(live.stock ?? 0);
          const currentQty = Number(item.quantity ?? 1);

          if (liveStock <= 0) {
            removeFromCart(live.id);
            changed = true;
            continue;
          }

          if (currentQty > liveStock) {
            setQuantity(live.id, liveStock, liveStock); // ✅ set exact
            changed = true;
          }
        }

        if (changed) {
          toast.info(
            t("cart_adjusted_stock") || "Cart updated based on latest stock.",
          );
        }
      } catch (err) {
        console.error("Cart validation failed", err);
      } finally {
        setLoading(false);
      }
    };

    validateCartLive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shipping = useMemo(() => {
    const threshold = Number(storeSettings.free_delivery_threshold || 0);
    const charge = Number(storeSettings.delivery_charge || 0);
    return subtotal >= threshold ? 0 : charge;
  }, [subtotal, storeSettings]);

  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  const PlaceOrder = async () => {
    if (!name || !phone || !address) {
      toast.error(t("fill_required") || "Please fill all required fields");
      return;
    }
    if (!user.id) {
      setOpenLogin(true);
      return;
    }
    if (!cart.length) {
      toast.error(t("cart_is_empty") || "Your cart is empty");
      return;
    }

    // 1) Re-validate just-in-time (prevents stale cart)
    try {
      const liveList = await Promise.all(
        cart.map(async (item) => {
          const res = await api.get(`/products/${item.id}`);
          return res.data;
        }),
      );

      let blocked = false;

      for (const live of liveList) {
        const item = cart.find((c) => c.id === live.id);
        if (!item) continue;

        const liveStock = Number(live.stock ?? 0);
        const qty = Number(item.quantity ?? 1);

        if (liveStock <= 0) {
          removeFromCart(live.id);
          blocked = true;
          continue;
        }

        if (qty > liveStock) {
          setQuantity(live.id, liveStock, liveStock);
          blocked = true;
        }
      }

      if (blocked) {
        toast.error(
          t("stock_changed_retry") ||
            "Stock changed while you were ordering. We updated your cart—please review and try again.",
        );
        return;
      }
    } catch (e) {
      console.error(e);
      toast.error(
        t("stock_check_failed") || "Unable to verify stock. Please try again.",
      );
      return;
    }

    // 2) Build payload that matches your OrderCreate schema
    const productsData = cart.map((item) => ({
      product: item.id,
      quantity: item.quantity,
    }));

    const data = {
      user_id: user.id,
      name,
      email: email || null,
      phone,
      address,
      order_description: description || null,
      method: 1,
      products: productsData, // ✅ list, not string
    };

    try {
      const res = await api.post("/order", data);

      // Your route is status_code=201
      if (res.status === 201 || res.status === 200) {
        toast.success(t("order_placed") || "Order placed successfully");
        clearCart();
        navigate("/");
      } else {
        toast.error(t("place_order_failed") || "Failed to place order");
      }
    } catch (err) {
      // If backend enforces stock, it should return 409
      if (err?.response?.status === 409) {
        toast.error(
          t("insufficient_stock") ||
            "Some items are no longer available in the requested quantity.",
        );
      } else {
        toast.error(t("place_order_failed") || "Failed to place order");
      }
      console.log(err);
    }
  };

  const handleLogin = () => {
    api
      .post("/login", { username: loginEmail, password: loginPassword })
      .then((res) => {
        if (res.status === 200) {
          getProfile();
          setOpenLogin(false);
          toast.success(t("logged_in") || "Logged in successfully");
        }
      })
      .catch(() =>
        toast.error(t("invalid_credentials") || "Invalid credentials"),
      );
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
      <div className="bg-neutral-50 dark:bg-neutral-900 min-h-screen font-sans text-neutral-800 dark:text-neutral-200 flex flex-col transition-colors duration-300">
        <Notification />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              {t("checkout") || "Checkout"}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("complete_purchase") ||
                "Please complete your purchase details below."}
            </p>
          </div>

          {loading ? (
            <CheckoutSkeleton />
          ) : (
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center text-sm">
                      1
                    </span>
                    {t("shipping_info") || "Shipping Information"}
                  </h2>

                  <div className="space-y-4">
                    <InputField
                      icon={RiUserLine}
                      placeholder={t("full_name") || "Full Name"}
                      value={name}
                      onChange={setName}
                      required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        icon={RiMailLine}
                        placeholder={t("email_optional") || "Email (Optional)"}
                        type="email"
                        value={email}
                        onChange={setEmail}
                      />
                      <InputField
                        icon={RiPhoneLine}
                        placeholder={t("phone_number") || "Phone Number"}
                        value={phone}
                        onChange={setPhone}
                        required
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none text-neutral-400">
                        <RiMapPinLine />
                      </div>
                      <textarea
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 outline-none transition-all bg-neutral-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-700 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 h-24 resize-none"
                        placeholder={
                          (t("full_address") || "Full Address") + "*"
                        }
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>

                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 outline-none transition-all bg-neutral-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-700 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 h-20 resize-none"
                      placeholder={t("order_notes") || "Order notes (Optional)"}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center text-sm">
                      2
                    </span>
                    {t("payment_method") || "Payment Method"}
                  </h2>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border border-green-500 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10 rounded-xl cursor-pointer">
                      <Radio
                        checked
                        className="text-green-600 dark:text-green-500"
                      />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                        {t("cash_on_delivery") || "Cash on Delivery"}
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl opacity-50 cursor-not-allowed">
                      <Radio checked={false} disabled />
                      <span className="font-medium text-neutral-500 dark:text-neutral-400">
                        {t("digital_payment") || "Digital Payment"} (
                        {t("coming_soon") || "Coming Soon"})
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="lg:pl-8">
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 sticky top-24">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                    {t("your_order") || "Your Order"}
                  </h2>

                  <FreeDeliveryBar subtotal={subtotal} />

                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-700 rounded-lg overflow-hidden">
                            <img
                              src={item.image1}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800 dark:text-neutral-100 text-sm line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {t("qty") || "Qty"}: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-sm dark:text-neutral-200">
                          ৳{" "}
                          {(Number(item.price) * Number(item.quantity)).toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-700 pt-4 space-y-3">
                    <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                      <span>{t("subtotal") || "Subtotal"}</span>
                      <span className="dark:text-neutral-200">
                        ৳ {subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                      <span>{t("shipping_cost") || "Shipping"}</span>
                      <span className="dark:text-neutral-200">
                        {shipping === 0 ? (
                          <span className="text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">
                            {t("free") || "FREE"}
                          </span>
                        ) : (
                          `৳ ${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-xl font-bold text-neutral-900 dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-700 mt-2">
                      <span>{t("total") || "Total"}</span>
                      <span className="text-green-600 dark:text-green-400">
                        ৳ {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={PlaceOrder}
                    className="w-full mt-8 bg-green-600 dark:bg-green-600 text-white py-4 rounded-full font-bold hover:bg-green-700 dark:hover:bg-green-500 transition-all shadow-lg shadow-green-200 dark:shadow-none active:scale-95"
                  >
                    {t("confirm_order") || "Confirm Order"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />

        <Modal
          title={
            <div className="text-center font-bold text-xl mb-4 dark:text-white">
              {t("login_required") || "Login Required"}
            </div>
          }
          open={openLogin}
          onOk={handleLogin}
          okText={t("login_continue") || "Log In & Continue"}
          onCancel={() => setOpenLogin(false)}
          okButtonProps={{
            className:
              "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500",
          }}
          centered
        >
          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-6">
            {t("login_required_msg") || "You need to log in to place an order."}
          </p>

          <div className="space-y-4">
            <input
              type="email"
              placeholder={t("email") || "Email"}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:border-green-500 outline-none"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder={t("password") || "Password"}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:border-green-500 outline-none"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>

          <div className="mt-4 text-center text-sm dark:text-neutral-400">
            {t("no_account") || "Don't have an account?"}
            <button
              onClick={() => {
                setOpenLogin(false);
                navigate("/register");
              }}
              className="text-green-600 dark:text-green-400 font-bold ml-1 hover:underline"
            >
              {t("register_here") || "Register Here"}
            </button>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Checkout;
