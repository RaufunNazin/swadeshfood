import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import "react-toastify/dist/ReactToastify.css";
import {
  RiMailLine,
  RiLockPasswordLine,
  RiArrowLeftLine,
} from "react-icons/ri";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      login();
    }
  };

  const login = () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    api
      .post("/login", {
        username: email,
        password: password,
      })
      .then((res) => {
        if (res.status === 200) {
          localStorage.setItem("token", res.data.access_token);
          navigate("/", { state: "login" });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(
          err.response?.data?.detail ||
            "Login failed. Please check your credentials.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (state === "logout") toast.success("Logged out successfully");
  }, [state]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
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
        <div className="flex flex-col items-center mb-10">
          <img
            src="/logo.png"
            alt="Swadesh Food"
            className="h-16 mb-6 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-center">
            Login to access your account and order history
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
                <RiMailLine className="text-xl" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-800 placeholder-gray-400"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
                <RiLockPasswordLine className="text-xl" />
              </div>
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-800 placeholder-gray-400"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={login}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="flex flex-col items-center gap-4 mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-500">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-green-600 font-bold hover:underline underline-offset-2"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
