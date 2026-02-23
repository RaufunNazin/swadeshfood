import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RiAddLine, RiEyeLine, RiCheckLine } from "react-icons/ri";
import { useLanguage } from "../contexts/LanguageContext";
import { flyToCartAnimation } from "../utils/animations";
import { useCart } from "../contexts/CartContext";
import { useEffect, useRef, useState } from "react";

const ItemCard = ({ product }) => {
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [addState, setAddState] = useState("idle"); // "idle" | "added"
  const addedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (addState === "added") return; // optional: ignore spam clicks

    const stock = Number(product.stock ?? 0);
    if (stock <= 0) {
      toast.error(t("out_of_stock") || "Out of stock");
      return;
    }

    const existing = cart.find((i) => i.id === product.id);
    const currentQty = Number(existing?.quantity ?? 0);

    if (currentQty >= stock) {
      toast.error(
        t("max_stock_reached", { count: stock }) ||
          `You can only add up to ${stock}`,
      );
      return;
    }

    flyToCartAnimation(e, product.image1);

    setTimeout(() => {
      addToCart(product, 1);

      // show 2s added state after real add
      setAddState("added");
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
      addedTimerRef.current = setTimeout(() => setAddState("idle"), 2000);
    }, 800);

    toast.success(t("added_to_cart") || "Added to cart", { autoClose: 1000 });
  };

  const outOfStock = Number(product.stock ?? 0) <= 0;

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative bg-white dark:bg-neutral-800 rounded-3xl p-3 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-neutral-200 dark:hover:shadow-neutral-900/50 hover:-translate-y-1 h-full flex flex-col border border-transparent dark:border-neutral-700"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-50 dark:bg-neutral-700 mb-3">
        {product.new === 1 && (
          <span className="absolute top-3 left-3 z-10 bg-black/80 dark:bg-green-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
            {t("new_badge") || "New"}
          </span>
        )}

        <img
          src={product.image1}
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-black/5 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.id}`);
            }}
            className="w-10 h-10 rounded-full bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white flex items-center justify-center shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 hover:scale-110 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
            title={t("view_details") || "View Details"}
          >
            <RiEyeLine size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-neutral-800 dark:text-neutral-100 text-lg leading-tight line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-neutral-400 dark:text-neutral-500 text-xs uppercase font-semibold tracking-wide">
              {t("price_label") || "Price"}
            </p>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">
              ৳{product.price_range ? product.price_range : product.price}
            </p>

            {outOfStock && (
              <p className="text-xs mt-1 text-red-500 dark:text-red-400 font-semibold">
                {t("out_of_stock") || "Out of stock"}
              </p>
            )}
          </div>

          {!product.price_range && (
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || addState === "added"}
              className={`w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md transition-all active:scale-95
              ${
                outOfStock
                  ? "bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed opacity-60"
                  : addState === "added"
                    ? "bg-emerald-600 cursor-default"
                    : "bg-neutral-900 dark:bg-green-600 hover:bg-emerald-600 dark:hover:bg-green-700 hover:shadow-emerald-200 dark:hover:shadow-none hover:scale-105"
              }`}
              title={
                outOfStock
                  ? t("out_of_stock") || "Out of stock"
                  : addState === "added"
                    ? t("added") || "Added!"
                    : t("add_to_cart") || "Add to Cart"
              }
            >
              {addState === "added" ? (
                <RiCheckLine
                  size={18}
                  className="transition-transform duration-200 scale-110"
                />
              ) : (
                <RiAddLine size={20} />
              )}
            </button>
          )}

          {product.price_range && (
            <button className="px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
              {t("options") || "Options"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ItemCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    new: PropTypes.number,
    image1: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number,
    price_range: PropTypes.string,
    stock: PropTypes.number,
  }).isRequired,
};

export default ItemCard;
