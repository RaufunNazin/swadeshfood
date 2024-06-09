import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import Notification from "../components/Notification";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem("cart")) {
      localStorage.setItem("cart", JSON.stringify([]));
    }
    setCart(JSON.parse(localStorage.getItem("cart")));
  }, []);

  const updateQuantity = (productId, increment) => {
    const updatedCartItems = cart
      .map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + increment }
          : item
      )
      .filter((item) => item.quantity > 0); // Remove items with quantity 0
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
    setCart(updatedCartItems);
  };

  const removeFromCart = (productId) => {
    const updatedCartItems = cart.filter((item) => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
    setCart(updatedCartItems);
  };

  return (
    <div className="relative">
      <Notification />
      <div className="lg:sticky top-0 z-50 bg-accent">
        <Navbar active="home" />
      </div>
      <div>
        {cart.length === 0 ? (
          <div className="my-10 flex flex-col gap-10">
            <img
              src="/emptycart.png"
              alt="Empty cart"
              className="w-1/4 mx-auto"
            />
            <div className="text-center text-2xl font-semibold">
              Cart is empty
            </div>
            <div className="text-center">
              <button
                onClick={() => navigate("/store")}
                className="bg-brand text-white px-5 py-2 rounded-md"
              >
                Continue shopping
              </button>
            </div>
          </div>
        ) : (
          <div className=" my-10">
            <div className="px-3 lg:px-32 my-5 md:my-10">
              <h1 className="text-lg md:text-2xl font-semibold text-xdark my-0 md:my-10 uppercase">
                Cart
              </h1>
              <div className="flex flex-col-reverse md:flex-row gap-x-2 gap-y-2 items-start">
                <div className="grid grid-cols-1 gap-5 w-full">
                  {cart.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white relative shadow-sm p-2 flex flex-col gap-y-2 md:flex-row justify-evenly w-full items-center cursor-pointer"
                    >
                      <div className="flex w-full justify-between md:justify-evenly items-center cursor-pointer">
                        <img
                          src={product.image1}
                          alt={product.name}
                          className="w-16 h-16 object-contain rounded-md"
                        />
                        <h1 className="text-xl font-semibold text-xdark text-center">
                          {product.name}
                        </h1>
                        <p className="text-xl text-center text-brand font-semibold">
                          ৳ {product.price}/-
                        </p>
                      </div>
                      <div className="flex w-full justify-between md:justify-evenly items-center cursor-pointer gap-x-2">
                        <div className="flex items-center gap-x-5 px-5 border border-brand rounded-md">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(product.id, -1);
                            }}
                            className="text-brand font-semibold p-1 rounded-md"
                          >
                            -
                          </button>
                          <span className="mx-2">{product.quantity}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(product.id, 1);
                            }}
                            className="text-brand font-semibold p-1 rounded-md"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(product.id);
                          }}
                          className="border border-brand text-brand font-semibold p-1 md:p-3 w-fit rounded-md uppercase"
                        >
                          Remove from cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-full md:w-fit">
                  <div className="bg-white p-5 rounded-md shadow-md">
                    <h1 className="text-2xl font-semibold text-xdark">
                      Cart Summary
                    </h1>
                    <div className="flex justify-between items-center my-5">
                      <div>Subtotal</div>
                      <div>
                        ৳{" "}
                        {cart
                          .reduce(
                            (acc, item) => acc + item.price * item.quantity,
                            0
                          )
                          .toFixed(2)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center my-5">
                      <div>Shipping</div>
                      <div>৳ 50</div>
                    </div>
                    <div className="flex justify-between items-center my-5">
                      <div>Total</div>
                      <div>
                        ৳{" "}
                        {(
                          cart.reduce(
                            (acc, item) => acc + item.price * item.quantity,
                            0
                          ) + 50
                        ).toFixed(2)}
                      </div>
                    </div>
                    <button className="bg-brand text-white px-5 py-2 rounded-md w-full">
                      Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/store")}
                className="bg-brand text-white px-5 py-2 rounded-md"
              >
                Continue shopping
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
