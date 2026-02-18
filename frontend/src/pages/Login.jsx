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
import { useLanguage } from "../contexts/LanguageContext"; // Import Language Context

const Login = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      login();
    }
  };

  const login = () => {
    if (!email || !password) {
      toast.error(t("fill_all_fields") || "Please fill in all fields");
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
          navigate("/", { state: "login" });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(
          err.response?.data?.detail ||
            t("login_failed") ||
            "Login failed. Please check your credentials.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (state === "logout")
      toast.success(t("logout_success") || "Logged out successfully");
  }, [state, t]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-green-200/20 dark:bg-green-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium z-10"
      >
        <RiArrowLeftLine className="text-xl" />
        <span className="hidden sm:inline">
          {t("back_home") || "Back to Home"}
        </span>
      </button>

      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none p-8 md:p-12 relative z-10 border border-white dark:border-gray-700 transition-colors duration-300">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <img
            src="/logo.png"
            alt="Swadesh Food"
            className="h-16 mb-6 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("welcome_back") || "Welcome Back"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            {t("login_subtitle") ||
              "Login to access your account and order history"}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors">
                <RiMailLine className="text-xl" />
              </div>
              <input
                type="email"
                placeholder={t("email") || "Email Address"}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:focus:ring-green-500/20 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors">
                <RiLockPasswordLine className="text-xl" />
              </div>
              <input
                type="password"
                placeholder={t("password") || "Password"}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:focus:ring-green-500/20 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={login}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-200 dark:shadow-none hover:shadow-xl hover:shadow-green-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading
              ? t("signing_in") || "Signing in..."
              : t("sign_in") || "Sign In"}
          </button>

          <div className="flex flex-col items-center gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              {t("no_account") || "Don't have an account?"}{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-green-600 dark:text-green-400 font-bold hover:underline underline-offset-2"
              >
                {t("create_account") || "Create Account"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
