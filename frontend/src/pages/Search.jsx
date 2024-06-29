import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import api from "../api";
import { AiOutlineLoading } from "react-icons/ai";
import ItemCard from "../components/ItemCard";
import Notification from "../components/Notification";

const Search = () => {
  const { searchText } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getProducts = () => {
      setLoading(true);
      api
        .get(`/search/${searchText}/${offset}/${limit}`)
        .then((res) => {
          if (res.status === 200) {
            setProducts(res.data);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    getProducts();
  }, [searchText, limit, offset]);

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
          Search/{searchText}
        </div>
        <div className="">Search results for &apos;{searchText}&apos;</div>
      </div>
      <div className="px-3 md:w-4/5 lg:w-4/5 xl:w-3/5 mx-auto py-5 my-5 lg:my-10">
        {loading ? (
          <div className="w-full flex items-center justify-center">
            <AiOutlineLoading className="text-brand text-7xl text-center animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-5 md:gap-10 my-10">
            <div className="text-center text-xl md:text-3xl">
              Oops! No Products Found for &apos;{searchText}&apos;
            </div>
            <button
              onClick={() => navigate("/store")}
              className="text-[12px] lg:text-[16px] text-start font-light bg-brand text-white transition-all duration-150 px-3 py-2 rounded-md hover:scale-105"
            >
              Go back to store
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-7 lg:gap-10">
            {products.map((product) => (
              <ItemCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Search;
