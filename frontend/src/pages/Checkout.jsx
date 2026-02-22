import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
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
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();
  const { t } = useLanguage();

  // ✅ store settings from context
  const { storeSettings } = useStoreSettings();

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  // Login Modal
  const [openLogin, setOpenLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const getProfile = () => {
    api
      .get("/me")
      .then((res) => {
        if (res.status === 200) {
          setUser(res.data);
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (state && state.from === "/login") {
      setName(state.name || "");
      setEmail(state.email || "");
      setPhone(state.phone || "");
      setAddress(state.address || "");
      setDescription(state.description || "");
    }

    getProfile();

    const localCart = JSON.parse(localStorage.getItem("cart")) || [];

    const validatePrices = async () => {
      try {
        const updatedItems = await Promise.all(
          localCart.map(async (item) => {
            const res = await api.get(`/products/${item.id}`);
            return { ...res.data, quantity: item.quantity };
          }),
        );
        setCart(updatedItems);
      } catch (err) {
        console.error("Price validation failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (localCart.length > 0) {
      validatePrices();
    } else {
      setLoading(false);
    }
  }, [state]);

  const PlaceOrder = () => {
    if (!name || !phone || !address) {
      toast.error(t("fill_required"));
      return;
    }
    if (!user.id) {
      setOpenLogin(true);
      return;
    }

    const productsData = cart.map((item) => ({
      product: item.id,
      quantity: item.quantity,
    }));

    const data = {
      user_id: user.id,
      name,
      email,
      phone,
      address,
      order_description: description,
      products: JSON.stringify(productsData),
      paid: 0,
      status: "new",
      method: 1,
    };

    api
      .post("/order", data)
      .then((res) => {
        if (res.status === 200) {
          toast.success(t("order_placed"));
          localStorage.setItem("cart", JSON.stringify([]));
          setCart([]);
          navigate("/");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(t("place_order_failed"));
      });
  };

  const handleLogin = () => {
    api
      .post("/login", { username: loginEmail, password: loginPassword })
      .then((res) => {
        if (res.status === 200) {
          getProfile();
          setOpenLogin(false);
          toast.success(t("logged_in"));
        }
      })
      .catch(() => toast.error(t("invalid_credentials")));
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const shipping =
    subtotal >= storeSettings.free_delivery_threshold
      ? 0
      : storeSettings.delivery_charge;

  const total = subtotal + shipping;

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
              {t("checkout")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("complete_purchase")}
            </p>
          </div>

          {loading ? (
            <CheckoutSkeleton />
          ) : (
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                {/* Shipping Form */}
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center text-sm">
                      1
                    </span>
                    {t("shipping_info")}
                  </h2>

                  <div className="space-y-4">
                    <InputField
                      icon={RiUserLine}
                      placeholder={t("full_name")}
                      value={name}
                      onChange={setName}
                      required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        icon={RiMailLine}
                        placeholder={t("email_optional")}
                        type="email"
                        value={email}
                        onChange={setEmail}
                      />
                      <InputField
                        icon={RiPhoneLine}
                        placeholder={t("phone_number")}
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
                        placeholder={t("full_address") + "*"}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 outline-none transition-all bg-neutral-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-700 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 h-20 resize-none"
                      placeholder={t("order_notes")}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center text-sm">
                      2
                    </span>
                    {t("payment_method")}
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border border-green-500 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10 rounded-xl cursor-pointer">
                      <Radio
                        checked={true}
                        className="text-green-600 dark:text-green-500"
                      />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                        {t("cash_on_delivery")}
                      </span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl opacity-50 cursor-not-allowed">
                      <Radio checked={false} disabled />
                      <span className="font-medium text-neutral-500 dark:text-neutral-400">
                        {t("digital_payment")} ({t("coming_soon")})
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="lg:pl-8">
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 sticky top-24">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                    {t("your_order")}
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
                              {t("qty")}: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-sm dark:text-neutral-200">
                          ৳ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-700 pt-4 space-y-3">
                    <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                      <span>{t("subtotal")}</span>
                      <span className="dark:text-neutral-200">
                        ৳ {subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                      <span>{t("shipping_cost")}</span>
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
                      <span>{t("total")}</span>
                      <span className="text-green-600 dark:text-green-400">
                        ৳ {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={PlaceOrder}
                    className="w-full mt-8 bg-green-600 dark:bg-green-600 text-white py-4 rounded-full font-bold hover:bg-green-700 dark:hover:bg-green-500 transition-all shadow-lg shadow-green-200 dark:shadow-none active:scale-95"
                  >
                    {t("confirm_order")}
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
              {t("login_required")}
            </div>
          }
          open={openLogin}
          onOk={handleLogin}
          okText={t("login_continue")}
          onCancel={() => setOpenLogin(false)}
          okButtonProps={{
            className:
              "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500",
          }}
          centered
        >
          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-6">
            {t("login_required_msg")}
          </p>
          <div className="space-y-4">
            <input
              type="email"
              placeholder={t("email")}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:border-green-500 outline-none"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder={t("password")}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:border-green-500 outline-none"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>
          <div className="mt-4 text-center text-sm dark:text-neutral-400">
            {t("no_account")}
            <button
              onClick={() => {
                setOpenLogin(false);
                navigate("/register");
              }}
              className="text-green-600 dark:text-green-400 font-bold ml-1 hover:underline"
            >
              {t("register_here")}
            </button>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Checkout;
