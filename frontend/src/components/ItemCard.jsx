import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RiAddLine, RiEyeLine } from "react-icons/ri";

const ItemCard = ({ product }) => {
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const productWithQuantity = { ...product, quantity: 1 };
    const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
    const updatedCartItems = [...currentCart, productWithQuantity];
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
    toast.success("Added to cart");
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative bg-white rounded-3xl p-3 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-gray-200 hover:-translate-y-1 h-full flex flex-col"
    >
      {/* --- Image Area --- */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
        {/* Badge */}
        {product.new === 1 && (
          <span className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            New
          </span>
        )}

        <img
          src={product.image1}
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
        />

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/product/${product.id}`);
                }}
                className="w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-lg hover:bg-gray-100 hover:scale-110 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                title="View Details"
            >
                <RiEyeLine size={20} />
            </button>
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="flex flex-col flex-1 px-1">
        <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">
                {product.name}
            </h3>
        </div>
        
        {/* Price & Add Button Row */}
        <div className="flex items-center justify-between mt-auto">
            <div>
                <p className="text-gray-400 text-xs uppercase font-semibold tracking-wide">Price</p>
                <p className="text-lg font-bold text-gray-900">
                    ৳{product.price_range ? product.price_range : product.price}
                </p>
            </div>

            {/* Quick Add Button */}
            {!product.price_range && (
                <button
                    onClick={handleAddToCart}
                    className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-md hover:bg-emerald-600 hover:shadow-emerald-200 hover:scale-105 transition-all active:scale-95"
                    title="Add to Cart"
                >
                    <RiAddLine size={20} />
                </button>
            )}
             {product.price_range && (
                <button
                    className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-colors"
                >
                    Options
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
    price: PropTypes.number.isRequired,
    price_range: PropTypes.string,
  }).isRequired,
};

export default ItemCard;