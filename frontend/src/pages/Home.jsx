import { useEffect, useState } from "react";
import Carousel from "../components/Carousel";
import Navbar from "../components/Navbar";
import api from "../api";
import "../App.css";
import { AiOutlineLoading } from "react-icons/ai";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(4);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getProducts = () => {
      api
        .get(`/products/${offset}/${limit}`)
        .then((res) => {
          setProducts(res.data);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    getProducts();
  }, [limit, offset]);

  useEffect(() => {
    const getNewProducts = () => {
      api
        .get(`/products/new/${offset}/${limit}`)
        .then((res) => {
          setNewProducts(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    getNewProducts();
  }, [limit, offset]);

  useEffect(() => {
    const getCategories = () => {
      api
        .get("/categories")
        .then((res) => {
          setCategories(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    getCategories();
  }, []);

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
      <div className="lg:sticky top-0 z-50 bg-accent">
        <Navbar active="home" />
      </div>
      <Carousel />
      <div>
        <div className="px-3 lg:px-32 py-5 my-10">
          <h1 className="text-2xl font-semibold text-xdark text-center my-10 uppercase">
            Healthy products from our farm
          </h1>
          {loading ? (
            <div className="w-full flex items-center justify-center">
              <AiOutlineLoading className="text-brand text-7xl text-center animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-7 lg:gap-10">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white relative shadow-md rounded-md flex flex-col items-center gap-y-2 cursor-pointer"
                >
                  {product.new === 1 && (
                    <div className="absolute top-2 right-2 bg-white p-1 rounded-md font-bold text-sm">
                      New!
                    </div>
                  )}
                  <img
                    src={product.image3}
                    alt={product.name}
                    className="w-full h-full object-contain rounded-t-md"
                  />
                  <div className="p-2 md:p-5 w-full flex flex-col gap-1.5 md:gap-3">
                    <h1 className="text-xl font-semibold text-xdark text-center">
                      {product.name}
                    </h1>
                    <p className="text-xl text-center text-brand font-semibold">
                      ৳ {product.price}/-
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const productWithQuantity = { ...product, quantity: 1 };
                        const updatedCartItems = [
                          ...(JSON.parse(localStorage.getItem("cart")) || []),
                          productWithQuantity,
                        ];
                        localStorage.setItem(
                          "cart",
                          JSON.stringify(updatedCartItems)
                        );
                        toast.success("Added to cart");
                      }}
                      className="border border-brand text-brand font-semibold p-3 w-full rounded-md uppercase"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-center w-full">
            <button className="bg-brand text-white py-2 px-5 rounded-md mt-5 hover:scale-105 transition-all duration-200">
              View All
            </button>
          </div>
        </div>

        <div className="bg-accent px-3 lg:px-32 my-10 py-20">
          <h1 className="text-2xl font-semibold text-xdark text-center mb-10 uppercase">
            Check out our <span className="text-brand">new arrivals!</span>
          </h1>
          {loading ? (
            <div className="w-full flex items-center justify-center">
              <AiOutlineLoading className="text-brand text-7xl text-center animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-7 lg:gap-10">
              {newProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white relative shadow-md rounded-md flex flex-col items-center gap-y-2 cursor-pointer"
                >
                  {product.new === 1 && (
                    <div className="absolute top-2 right-2 bg-white p-1 rounded-md font-bold text-sm">
                      New!
                    </div>
                  )}
                  <img
                    src={product.image3}
                    alt={product.name}
                    className="w-full h-full object-contain rounded-t-md"
                  />
                  <div className="p-2 md:p-5 w-full flex flex-col gap-1.5 md:gap-3">
                    <h1 className="text-xl font-semibold text-xdark text-center">
                      {product.name}
                    </h1>
                    <p className="text-xl text-center text-brand font-semibold">
                      ৳ {product.price}/-
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const productWithQuantity = { ...product, quantity: 1 };
                        const updatedCartItems = [
                          ...(JSON.parse(localStorage.getItem("cart")) || []),
                          productWithQuantity,
                        ];
                        localStorage.setItem(
                          "cart",
                          JSON.stringify(updatedCartItems)
                        );
                        toast.success("Added to cart");
                      }}
                      className="border border-brand text-brand font-semibold p-3 w-full rounded-md uppercase"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-center w-full">
            <button className="bg-brand text-white py-2 px-5 rounded-md mt-5 hover:scale-105 transition-all duration-200">
              View All
            </button>
          </div>
        </div>
        <div className="px-3 lg:px-32 py-5 my-10">
          <h1 className="text-2xl font-semibold text-xdark text-center my-10 uppercase">
            Choose a category to explore
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-10">
            {categories.map((category) => {
              return (
                <button
                  onClick={() => {
                    navigate(`/store/${category.name}`);
                  }}
                  key={category.id}
                  className="my-10"
                >
                  <div className="bg-brand text-white p-5 font-semibold text-2xl uppercase text-center rounded-md hover:scale-110 transition-all duration-200">
                    {category.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
