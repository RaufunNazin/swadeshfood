import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api";
import { AiOutlineLoading } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { CiFilter } from "react-icons/ci";
import { Select } from "antd";

const New = () => {
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(12);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);

  useEffect(() => {
    const getProducts = () => {
      api
        .get(`/products/new/${offset}/${limit}`)
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
    const getSizes = () => {
      api
        .get("/sizes")
        .then((res) => {
          setSizes(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    getSizes();
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
        <Navbar active="new" />
      </div>
      <div className="px-3 lg:px-32 py-5 my-5 lg:my-10">
        {loading ? (
          <div className="w-full flex items-center justify-center">
            <AiOutlineLoading className="text-brand text-7xl text-center animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center font-bold text-3xl">
            New products coming soon!
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
                    className="border border-brand text-brand font-semibold p-1.5 md:p-3 w-full rounded-md uppercase"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {products.length === 0 ? (
          <div className="flex justify-center w-full">
            <button
              onClick={() => {
                navigate("/store");
              }}
              className="bg-brand text-white py-2 px-5 rounded-md mt-5 hover:scale-105 transition-all duration-200"
            >
              View Store
            </button>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <button
              onClick={() => {
                setLimit(limit + 12);
              }}
              className="bg-brand text-white py-2 px-5 rounded-md mt-5 hover:scale-105 transition-all duration-200"
            >
              View More
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default New;
