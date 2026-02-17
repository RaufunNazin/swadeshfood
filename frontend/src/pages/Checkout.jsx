import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import Notification from "../components/Notification";
import api from "../api";
import { Modal, Radio } from "antd";
import {
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiUserLine,
} from "react-icons/ri";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

// --- FIX: Moved Component Outside ---
const InputField = ({
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = "text",
  required,
}) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
      <Icon />
    </div>
    <input
      type={type}
      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all bg-gray-50 focus:bg-white"
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

InputField.defaultProps = {
  placeholder: "",
  value: "",
  onChange: () => {},
  type: "text",
  required: false,
};

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [cart, setCart] = useState([]);

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
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get("/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    // Check if redirect from login
    if (state && state.from === "/login") {
      setName(state.name || "");
      setEmail(state.email || "");
      setPhone(state.phone || "");
      setAddress(state.address || "");
      setDescription(state.description || "");
    }

    getProfile();

    const localCart = JSON.parse(localStorage.getItem("cart")) || [];

    // FETCH fresh data for these IDs to ensure the price hasn't been tampered with locally
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
      }
    };

    if (localCart.length > 0) {
      validatePrices();
    }
  }, [state]);

  const PlaceOrder = () => {
    if (!name || !phone || !address) {
      toast.error("Please fill all required fields");
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
      method: 1, // Hardcoded Cash on Delivery for now
    };

    api
      .post("/order", data)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Order placed successfully!");
          localStorage.setItem("cart", JSON.stringify([]));
          setCart([]);
          navigate("/"); // Or navigate to a success page
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to place order");
      });
  };

  const handleLogin = () => {
    api
      .post("/login", { username: loginEmail, password: loginPassword })
      .then((res) => {
        if (res.status === 200) {
          localStorage.setItem("token", res.data.access_token);
          getProfile();
          setOpenLogin(false);
          toast.success("Logged in!");
        }
      })
      .catch(() => toast.error("Invalid credentials"));
  };

  // Calculations
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shipping = 50;
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col">
      <Notification />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500">Complete your purchase details below.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* --- Left Column: Form --- */}
          <div className="space-y-8">
            {/* Shipping Form */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">
                  1
                </span>
                Shipping Information
              </h2>

              <div className="space-y-4">
                <InputField
                  icon={RiUserLine}
                  placeholder="Full Name"
                  value={name}
                  onChange={setName}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    icon={RiMailLine}
                    placeholder="Email (Optional)"
                    type="email"
                    value={email}
                    onChange={setEmail}
                  />
                  <InputField
                    icon={RiPhoneLine}
                    placeholder="Phone Number"
                    value={phone}
                    onChange={setPhone}
                    required
                  />
                </div>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                    <RiMapPinLine />
                  </div>
                  <textarea
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all bg-gray-50 focus:bg-white h-24 resize-none"
                    placeholder="Full Address (House, Street, Area, City)*"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all bg-gray-50 focus:bg-white h-20 resize-none"
                  placeholder="Order notes (Optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">
                  2
                </span>
                Payment Method
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-green-500 bg-green-50/50 rounded-xl cursor-pointer">
                  <Radio checked={true} className="text-green-600" />
                  <span className="font-semibold text-gray-800">
                    Cash on Delivery
                  </span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl opacity-50 cursor-not-allowed">
                  <Radio checked={false} disabled />
                  <span className="font-medium text-gray-500">
                    Digital Payment (Coming Soon)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* --- Right Column: Summary --- */}
          <div className="lg:pl-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Your Order
              </h2>

              {/* Item List */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden">
                        <img
                          src={item.image1}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">
                      ৳ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>৳ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>৳ {shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                  <span>Total</span>
                  <span className="text-green-600">৳ {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={PlaceOrder}
                className="w-full mt-8 bg-green-600 text-white py-4 rounded-full font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 active:scale-95"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Login Modal */}
      <Modal
        title={
          <div className="text-center font-bold text-xl mb-4">
            Login Required
          </div>
        }
        open={openLogin}
        onOk={handleLogin}
        okText="Login & Continue"
        onCancel={() => setOpenLogin(false)}
        okButtonProps={{ className: "bg-green-600 hover:bg-green-700" }}
        centered
      >
        <p className="text-gray-500 text-center mb-6">
          You need to log in to place an order.
        </p>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?
          <button
            onClick={() => {
              setOpenLogin(false);
              navigate("/register");
            }}
            className="text-green-600 font-bold ml-1 hover:underline"
          >
            Register Here
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Checkout;
