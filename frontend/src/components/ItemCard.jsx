import React from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ItemCard = ({ product }) => {
  const navigate = useNavigate();
  return (
    <div
      key={product.id}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white relative border rounded-md flex flex-col items-center gap-y-3 cursor-pointer p-1.5 lg:p-2"
    >
      {product.new === 1 && (
        <div className="absolute top-3 lg:top-5 left-3 lg:left-5 bg-brand text-white py-0.5 rounded-full px-3 font-light text-sm">
          New
        </div>
      )}
      <img
        src={product.image1}
        alt={product.name}
        className="w-full h-[160px] md:h-[250px] lg:h-[200px] object-cover rounded-md"
      />
      <div className="w-full flex flex-col gap-1.5 md:gap-3">
        <h1 className="text-md lg:text-lg font-semibold text-xdark text-center">
          {product.name}
        </h1>
        <p className="text-md lg:text-lg text-center text-brand font-semibold">
          ৳ {product.price_range ? product.price_range : product.price}
        </p>
        {product.price_range ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.id}`);
            }}
            className="text-sm lg:text-md border hover:bg-brand hover:text-white transition-all duration-200 border-brand text-brand font-semibold py-1 px-3 lg:py-2 lg:px-7 w-fit mx-auto rounded-md uppercase"
          >
            View Details
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const productWithQuantity = { ...product, quantity: 1 };
              const updatedCartItems = [
                ...(JSON.parse(localStorage.getItem("cart")) || []),
                productWithQuantity,
              ];
              localStorage.setItem("cart", JSON.stringify(updatedCartItems));
              toast.success("Added to cart");
            }}
            className="text-sm lg:text-md bg-brand transition-all duration-200 hover:scale-105 text-white font-semibold py-1 px-3 lg:py-2 lg:px-7 w-fit mx-auto rounded-md uppercase"
          >
            Add to cart
          </button>
        )}
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
