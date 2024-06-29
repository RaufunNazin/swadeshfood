import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useParams } from "react-router-dom";
import { all } from "axios";
import ItemCard from "../components/ItemCard";
import Notification from "../components/Notification";

const SingleProduct = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState({});
  const [image, setImage] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(8);

  useEffect(() => {
    const getProducts = () => {
      api
        .get(`/products/price-range/${offset}/${limit}`)
        .then((res) => {
          setAllProducts(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    getProducts();
  }, [limit, offset]);

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
        .get(`/products/${productId}`, {
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
  }, [productId]);

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
      <Notification />
      <div className="sticky top-0 z-50 bg-white">
        <Navbar active="home" />
        <div className="px-2 md:w-4/5 lg:w-4/5 xl:w-3/5 mx-auto grid grid-cols-1 lg:grid-cols-3 w-full gap-y-5 lg:gap-y-0 lg:gap-5 my-5 lg:my-10">
          <div className="flex flex-col-reverse col-span-2 lg:flex-row items-start gap-2 lg:gap-5">
            <div className="flex lg:flex-col items-center gap-6">
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
                className="w-full h-64 lg:h-[400px] object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-4xl font-semibold text-xdark">
                {product.name}
              </h1>
              {product.new === 1 && (
                <div className="bg-brand h-fit text-sm lg:text-lg rounded-full px-2 py-1 lg:px-5 text-white">
                  NEW
                </div>
              )}
            </div>
            <p className="text-md md:text-2xl font-semibold text-brand">
              ৳ {product.price}
            </p>
            <p className="text-sm md:text-md text-xlightgray">
              {product.description}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-md md:text-lg text-brand">Sizes: </p>
              <div>
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setProduct(product)}
                    className="p-2 border border-brand text-brand mx-1 hover:bg-brand hover:text-white transition-all duration-200"
                  >
                    {product.size}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <p className="text-md md:text-lg text-brand">
                Category: {product.category}
              </p>
              <p className="text-md md:text-lg">
                Only {product.stock} items left!
              </p>
            </div>
            <div className="flex w-full gap-x-2">
              <button
                onClick={handleAddToCart}
                className="bg-brand text-md md:text-lg text-white px-3 py-2 rounded-md flex-1 uppercase hover:scale-105 transition-all duration-200"
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
              <button className="border border-brand text-md md:text-lg text-brand px-3 py-2 rounded-md flex-1 uppercase hover:bg-brand hover:text-white transition-all duration-200">
                Buy It Now
              </button>
            </div>
          </div>
        </div>
        <div className="px-2 md:w-4/5 lg:w-4/5 xl:w-3/5 h-full mx-auto my-5 lg:my-10">
          <div className="text-md lg:text-2xl font-semibold text-brand text-center md:text-start my-3">
            Products you may also like
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-7 lg:gap-10">
            {allProducts.map((product) => (
              <ItemCard key={product.id} product={product} />
            ))}
          </div>
          <div className="flex justify-center w-full">
            <button
              onClick={() => {
                setLimit(limit + 8);
              }}
              className="text-brand hover:underline underline-offset-2 rounded-md mt-5 hover:scale-105 transition-all duration-200"
            >
              View More
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default SingleProduct;
