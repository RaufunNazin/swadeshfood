import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { IoAdd, IoRemove } from "react-icons/io5";
import Notification from "../components/Notification";
import api from "../api";

const Checkout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [cart, setCart] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState([]);

  const getProfile = () => {
    api
      .get("/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.status !== 200) {
          navigate("/login");
        } else setUser(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const PlaceOrder = () => {
    if (!name || !phone || !address) {
      toast.error("Please fill all the required fields");
      return;
    }
    const data = {
      user_id: user.id,
      name: name,
      email: email,
      phone: phone,
      address: address,
      order_description: description,
      products: JSON.stringify(products),
      paid: 0,
      status: "new",
    };

    api
      .post("/order", data)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Order placed successfully");
          localStorage.setItem("cart", JSON.stringify([]));
          setCart([]);
          navigate("/");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getProfile();

    const cartItems = JSON.parse(localStorage.getItem("cart")).map((item) => {
      return { product: item.id, quantity: item.quantity };
    });
    setProducts(cartItems);

    if (!localStorage.getItem("cart")) {
      localStorage.setItem("cart", JSON.stringify([]));
    }
    setCart(JSON.parse(localStorage.getItem("cart")));
  }, []);

  const removeFromCart = (productId) => {
    const updatedCartItems = cart.filter((item) => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
    setCart(updatedCartItems);
  };

  return (
    <div className="relative">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        draggable={true}
        pauseOnHover={false}
        theme="colored"
      />
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
        <div className="text-xdark text-4xl md:text-7xl font-bold">
          Checkout
        </div>
        <div className="">Home / Cart / Checkout</div>
      </div>
      <div className="px-3 md:w-4/5 lg:w-4/5 xl:w-3/5 mx-auto py-5 my-5 lg:my-10">
        <div className="grid md:grid-cols-2 md:gap-5">
          <div>
            <div className="text-center font-medium text-brand uppercase mb-2">
              Shipping Details
            </div>
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className="border w-full p-2 my-2 outline-none rounded-md"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email Address (Optional)"
                className="border w-full p-2 my-2 outline-none rounded-md"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Phone Number"
                className="border w-full p-2 my-2 outline-none rounded-md"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <textarea
                type="text"
                placeholder="Full Shipping Address (House, Street, Area, City, Zip)"
                className="border w-full p-2 my-2 outline-none rounded-md"
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <textarea
                type="text"
                placeholder="Anything you want to say about the order? (Optional)"
                className="border w-full p-2 my-2 outline-none rounded-md"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="">
            <div className="text-center font-medium text-brand uppercase mb-2">
              Order Details
            </div>
            <div className="flex justify-between mb-2">
              <div className="text-xlightgray">Products</div>
              <div className="text-xlightgray">Total</div>
            </div>
            <div>
              {cart.map((product) => (
                <div
                  key={product.id}
                  className="bg-white relative flex gap-y-2 md:flex-row justify-evenly gap-x-2 md:gap-x-8 w-full items-center cursor-pointer"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(product.id);
                    }}
                    className=""
                  >
                    <RxCross2 />
                  </button>
                  <img
                    src={product.image1}
                    alt={product.name}
                    className="w-16 h-16 object-cover"
                  />
                  <div className="flex md:flex-row w-full justify-between items-center cursor-pointer">
                    <h1 className="text-sm md:text-md text-xdark text-center">
                      {product.name} x {product.quantity}
                    </h1>
                    <p className="text-sm md:text-md text-center">
                      ৳{" "}
                      {parseFloat(product.price * product.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="">
              <div className="flex justify-between items-center my-5">
                <div>Subtotal</div>
                <div>
                  ৳{" "}
                  {cart
                    .reduce((acc, item) => acc + item.price * item.quantity, 0)
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
                onClick={PlaceOrder}
                className="bg-brand text-white px-5 py-2 rounded-md w-full"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
