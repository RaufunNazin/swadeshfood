import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SingleProduct = () => {
  const [product, setProduct] = useState({});
  const [image, setImage] = useState("");
  const [products, setProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const getProductsByName = (name) => {
    api
      .get(`/name/products/${name}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    const getProduct = () => {
      api
        .get(`/products/${window.location.pathname.split("/")[2]}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          setProduct(res.data);
          setImage(res.data.image1);
          getProductsByName(res.data.name);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    getProduct();
  }, []);

  const handleAddToCart = () => {
    const updatedCartItems = [
      ...(JSON.parse(localStorage.getItem("cart")) || []),
      { ...product, quantity },
    ];
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
    toast.success("Added to cart");
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
      <div className="bg-brand text-white text-center w-full py-2 text-sm font-semibold">
        Offers coming soon!
      </div>
      <div className="sticky top-0 z-50 bg-white">
        <Navbar active="home" />
        <div className="px-2 lg:px-32 grid grid-cols-1 lg:grid-cols-2 w-full gap-5 my-10">
          <div className="flex flex-col-reverse lg:flex-row items-start gap-2 lg:gap-5">
            <div className="flex lg:flex-col gap-6">
              <div onClick={() => setImage(product.image1)}>
                <img
                  src={product.image1}
                  alt={product.name}
                  className="h-16 cursor-pointer"
                />
              </div>
              {product.image2 && (
                <div onClick={() => setImage(product.image2)}>
                  <img
                    src={product.image2}
                    alt={product.name}
                    className="h-16 cursor-pointer"
                  />
                </div>
              )}
              {product.image3 && (
                <div onClick={() => setImage(product.image3)}>
                  <img
                    src={product.image3}
                    alt={product.name}
                    className="h-16 cursor-pointer"
                  />
                </div>
              )}
            </div>
            <div className="w-full flex justify-center">
              <img
                src={image}
                alt={product.name}
                className="h-96 lg:h-[576px]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-semibold text-xdark">
                {product.name}
              </h1>
              {product.new && (
                <div className="bg-brand h-fit text-sm lg:text-lg rounded-md p-1 lg:p-2 text-white">
                  NEW !
                </div>
              )}
            </div>
            <p className="text-2xl font-semibold text-xdark">
              ৳ {product.price}
            </p>
            <p className="text-md text-xlightgray">{product.description}</p>
            <div className="flex items-center gap-2">
              <div>Size: </div>
              <div>
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setProduct(product)}
                    className="p-2 border"
                  >
                    {product.size}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <p className="text-lg text-xlightgray">
                Category: {product.category}
              </p>
              <p className="text-lg">Only {product.stock} items left!</p>
            </div>
            <div className="flex w-full gap-x-2">
              <button
                onClick={handleAddToCart}
                className="bg-brand text-white px-3 py-2 rounded-md flex-1 uppercase"
              >
                Add to cart
              </button>
              <div className="flex gap-x-5 items-center border border-brand rounded-md px-5">
                <button
                  onClick={() => {
                    if (quantity > 1) setQuantity((prev) => prev - 1);
                  }}
                  className="text-brand text-xl"
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => {
                    if (quantity < product.stock)
                      setQuantity((prev) => prev + 1);
                  }}
                  className="text-brand text-xl"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex w-full">
              <button className="border border-brand text-brand px-3 py-2 rounded-md flex-1 uppercase">
                Buy It Now
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default SingleProduct;
