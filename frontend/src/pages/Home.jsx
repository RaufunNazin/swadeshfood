import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api";
import "../App.css";
import { AiOutlineLoading } from "react-icons/ai";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ItemCard from "../components/ItemCard";
import Notification from "../components/Notification";

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
        .get(`/products/price-range/${offset}/${limit}`)
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
        .get(`/products/new/price-range/${offset}/${limit}`)
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
      <Notification />
      <div className="lg:sticky top-0 z-50 bg-accent">
        <Navbar active="home" />
      </div>
      {/* <Carousel /> */}
      <div>
        <img src="banner.jpeg" alt="banner" />
      </div>
      <div>
        <div className="px-3 md:w-4/5 lg:w-4/5 xl:w-3/5 mx-auto py-5 mt-5 md:mt-10 flex flex-col justify-evenly gap-y-5 md:gap-y-10">
          <h1 className="text-lg md:text-2xl font-semibold text-xdark text-center uppercase">
            Healthy products from our farm
          </h1>
          {loading ? (
            <div className="w-full flex items-center justify-center">
              <AiOutlineLoading className="text-brand text-7xl text-center animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-7 lg:gap-10">
              {products.map((product) => (
                <ItemCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div className="flex justify-center w-full">
            <button
              onClick={() => {
                navigate("/store");
              }}
              className="bg-brand text-white py-2 px-5 rounded-md hover:scale-105 transition-all duration-200"
            >
              View All
            </button>
          </div>
        </div>

        <div
          className="px-3 py-20 lg:h-[700px]"
          style={{
            backgroundImage: "url('bg.svg')",
            backgroundSize: "cover",
            backgroundPosition: "top",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="md:w-4/5 lg:w-4/5 xl:w-3/5 h-full mx-auto flex flex-col justify-evenly gap-y-5 md:gap-y-0">
            <h1 className="text-lg md:text-2xl font-semibold text-white text-center uppercase">
              Check out our <span className="text-xyellow">new arrivals!</span>
            </h1>
            {loading ? (
              <div className="w-full flex items-center justify-center">
                <AiOutlineLoading className="text-brand text-7xl text-center animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-7 lg:gap-10">
                {newProducts.map((product) => (
                  <ItemCard key={product.id} product={product} />
                ))}
              </div>
            )}
            <div className="flex justify-center w-full">
              <button
                onClick={() => {
                  navigate("/new");
                }}
                className="bg-white text-brand py-2 px-5 rounded-md hover:scale-105 transition-all duration-200"
              >
                View All
              </button>
            </div>
          </div>
        </div>
        <div className="px-3 md:w-4/5 lg:w-4/5 xl:w-3/5 mx-auto flex flex-col my-5 md:my-10 justify-evenly gap-y-5 md:gap-y-0">
          <h1 className="text-lg md:text-2xl font-semibold text-xdark text-center uppercase">
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
                  className="my-3 md:my-10"
                >
                  <div className="bg-brand text-white p-2 md:p-5 font-semibold text-lg md:text-2xl uppercase text-center rounded-md hover:scale-110 transition-all duration-200">
                    {category.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="">
        <img
          src="farm.jpeg"
          className="md:h-80 w-full object-cover origin-center"
          alt="banner"
        />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
