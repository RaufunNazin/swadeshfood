import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api";
import { AiOutlineLoading } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import { CiFilter } from "react-icons/ci";
import { Select } from "antd";
import ItemCard from "../components/ItemCard";
import Notification from "../components/Notification";

const Store = () => {
  const { searchCategory } = useParams();
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(12);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);

  useEffect(() => {
    if (searchCategory !== undefined) {
      api
        .get(`/filter/category/${searchCategory}/${offset}/${limit}`)
        .then((res) => {
          setProducts(res.data);
          console.log("products fetched by category", searchCategory);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
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
    }
  }, [searchCategory, limit, offset]);

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
      <Notification />
      <div className="lg:sticky top-0 z-50 bg-accent">
        <Navbar active="store" />
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
        <div className="text-xdark text-4xl md:text-7xl font-bold">Store</div>
        <div className="">Home / Store</div>
      </div>
      <div className="px-3 md:w-4/5 lg:w-4/5 xl:w-3/5 mx-auto py-5 my-5 lg:my-10">
        <div className="lg:flex items-center mb-5">
          <div className="mb-2 w-full flex flex-1 justify-start items-center">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex gap-x-2 items-center border py-1.5 px-2.5 rounded-md w-fit"
            >
              <CiFilter />
              <div className="text-xgray">
                {showFilter ? "Hide Filters" : "Show Filters"}
              </div>
            </button>
            <div>
              <Select
                defaultValue="Sort by Price"
                onChange={(value) => {
                  api.get(`/sort/${value}/${offset}/${limit}`).then((res) => {
                    setProducts(res.data);
                  });
                }}
                size="large"
                style={{ width: 150 }}
                className="ml-2"
                options={[
                  {
                    label: "Low to High",
                    value: "asc",
                  },
                  {
                    label: "High to Low",
                    value: "desc",
                  },
                ]}
              />
            </div>
          </div>
          <div></div>

          {showFilter && (
            <div>
              <div className="flex gap-2 justify-end">
                {!searchCategory && (
                  <Select
                    defaultValue="Category"
                    size="large"
                    onChange={(value) => {
                      api
                        .get(`/filter/category/${value}/${offset}/${limit}`)
                        .then((res) => {
                          setProducts(res.data);
                        });
                    }}
                    style={{ width: 150 }}
                    options={categories.map((category) => ({
                      label: category.name,
                      value: category.name,
                    }))}
                  />
                )}
                <Select
                  defaultValue="Size"
                  size="large"
                  onChange={(value) => {
                    api
                      .get(`/filter/size/${value}/${offset}/${limit}`)
                      .then((res) => {
                        setProducts(res.data);
                      });
                  }}
                  style={{ width: 150 }}
                  options={sizes.map((size) => ({
                    label: size,
                    value: size,
                  }))}
                />
                <Select
                  defaultValue="New"
                  size="large"
                  onChange={(value) => {
                    api
                      .get(`/filter/new/${value}/${offset}/${limit}`)
                      .then((res) => {
                        setProducts(res.data);
                      });
                  }}
                  style={{ width: 150 }}
                  options={[
                    {
                      label: "New",
                      value: 1,
                    },
                    {
                      label: "Old",
                      value: 0,
                    },
                  ]}
                />
                <button
                  onClick={() => {
                    api
                      .get(`/products/${offset}/${limit}`)
                      .then((res) => {
                        setProducts(res.data);
                        setShowFilter(false);
                      })
                      .catch((err) => {
                        console.log(err);
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  }}
                  className="bg-brand text-white py-2 px-5 rounded-md"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
        {loading ? (
          <div className="w-full flex items-center justify-center">
            <AiOutlineLoading className="text-brand text-7xl text-center animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center font-bold text-3xl">
            Oops! No Products Found
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-7 lg:gap-10">
            {products.map((product) => (
              <ItemCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {products.length === 0 ? (
          <div className="flex justify-center w-full">
            <button
              onClick={() => {
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
              }}
              className="bg-brand text-white py-2 px-5 rounded-md mt-5 hover:scale-105 transition-all duration-200"
            >
              Reset Filters
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

export default Store;
