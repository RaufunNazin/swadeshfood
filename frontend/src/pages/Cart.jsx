import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import Notification from "../components/Notification";
import { RxCross2 } from "react-icons/rx";
import { IoAdd, IoRemove } from "react-icons/io5";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem("cart")) {
      localStorage.setItem("cart", JSON.stringify([]));
    }
    setCart(JSON.parse(localStorage.getItem("cart")));
  }, []);

  const updateQuantity = (productId, increment, stock) => {
    const updatedCartItems = cart
      .map((item) =>
        item.id === productId && item.quantity + increment <= stock && item.quantity + increment > 0
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
      <div
        className="h-40 md:h-72 text-center flex flex-col gap-y-1 md:gap-y-3 items-center justify-start pt-3 md:pt-10"
        style={{
          backgroundImage: "url('/Navigation.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="text-xdark text-4xl md:text-7xl font-bold">Cart</div>
        <div className="">Home / Cart</div>
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
            <div className="px-3 md:w-4/5 lg:w-4/5 xl:w-3/5 mx-auto my-5 md:my-10">
              <h1 className="text-lg md:text-2xl font-semibold text-xdark my-0 md:my-10 uppercase">
                Selected Items
              </h1>
              <div className="flex flex-col md:flex-row gap-x-2 gap-y-2 items-start">
                <div className="grid grid-cols-1 gap-5 w-full">
                  {cart.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white relative shadow-sm p-2 flex gap-y-2 md:flex-row justify-evenly gap-x-2 md:gap-x-8 w-full items-start md:items-center cursor-pointer"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(product.id);
                        }}
                        className="hidden md:block"
                      >
                        <RxCross2 />
                      </button>
                      <img
                        src={product.image1}
                        alt={product.name}
                        className="w-20 h-20 object-cover"
                      />
                      <div className="flex flex-col gap-y-2 md:flex-row w-full justify-between md:justify-between items-center cursor-pointer">
                        <div className="flex justify-between items-center w-full">
                          <h1 className="text-sm md:text-md text-xdark text-center font-semibold">
                            {product.name}
                          </h1>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(product.id);
                            }}
                            className="block md:hidden"
                          >
                            <RxCross2 />
                          </button>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <p className="text-sm md:text-md block md:hidden">
                            Price
                          </p>
                          <p className="text-sm md:text-md text-center font-light">
                            ৳ {parseFloat(product.price).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <p className="text-sm md:text-md block md:hidden">
                            Quantity
                          </p>
                          <div className="flex items-center gap-x-2 px-2 border border-xdark rounded-md">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(product.id, -1, product.stock);
                              }}
                              className="text-xdark font-light rounded-md"
                            >
                              <IoRemove />
                            </button>
                            <span className="mx-1 font-light">
                              {product.quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(product.id, 1, product.stock);
                              }}
                              className="text-xdark font-light rounded-md"
                            >
                              <IoAdd />
                            </button>
                          </div>
                        </div>
                        {/* Subtotal div */}
                        <div className="flex justify-between items-center w-full">
                          <p className="text-sm md:text-md block md:hidden">
                            Subtotal
                          </p>
                          <p className="text-sm md:text-md text-center text-brand font-semibold">
                            ৳ {(product.price * product.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-full md:w-1/3">
                  <div className="bg-white p-5 rounded-md shadow-md border">
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
                    <hr />
                    <div className="flex justify-between items-center my-5">
                      <div>Shipping</div>
                      <div>৳ 50</div>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center my-5">
                      <div>Total</div>
                      <div className="text-brand font-bold">
                        ৳{" "}
                        {(
                          cart.reduce(
                            (acc, item) => acc + item.price * item.quantity,
                            0
                          ) + 50
                        ).toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/checkout")}
                      className="bg-brand text-white px-5 py-2 rounded-md w-full"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              {!localStorage.getItem("cart") && (
                <button
                  onClick={() => navigate("/store")}
                  className="bg-brand text-white px-5 py-2 rounded-md"
                >
                  Continue shopping
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
