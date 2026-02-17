import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  RiUserLine,
  RiMailLine,
  RiLockPasswordLine,
  RiArrowLeftLine,
} from "react-icons/ri";

// --- FIX: Component moved OUTSIDE ---
// We pass 'onKeyDown' as a prop now since it was using a function inside Register
const InputField = ({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  onKeyDown,
}) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
      <Icon className="text-xl" />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-800 placeholder-gray-400"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      register();
    }
  };

  const register = () => {
    if (!username || !email || !password || !cPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== cPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    api
      .post("/register", {
        username: username,
        email: email,
        password: password,
        role: 2, // Assuming 2 is for regular users/customers
      })
      .then((res) => {
        if (res.status === 201) {
          localStorage.setItem("token", res.data.access_token);
          navigate("/", { state: "register" });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(
          err.response?.data?.detail ||
            "Registration failed. Please try again.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />

      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors font-medium z-10"
      >
        <RiArrowLeftLine className="text-xl" />
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-12 relative z-10 border border-white">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="Swadesh Food"
            className="h-14 mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-500 text-center text-sm">
            Join us for authentic and healthy food
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <InputField
            icon={RiUserLine}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <InputField
            icon={RiMailLine}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <InputField
            icon={RiLockPasswordLine}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <InputField
            icon={RiLockPasswordLine}
            type="password"
            placeholder="Confirm Password"
            value={cPassword}
            onChange={(e) => setCPassword(e.target.value)}
            onKeyDown={handleKeyPress}
          />

          <button
            type="button"
            onClick={register}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <div className="flex flex-col items-center gap-4 mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-green-600 font-bold hover:underline underline-offset-2"
              >
                Log In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
