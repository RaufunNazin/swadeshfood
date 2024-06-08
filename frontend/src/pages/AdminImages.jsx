import { useEffect, useState } from "react";
import SidePanel from "../components/SidePanel";
import { Select } from "antd";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminImages = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({});
  const [productById, setProductById] = useState({});
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const getAllProducts = () => {
    api
      .get("/products/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const getProductById = (id) => {
    api
      .get(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setProductById(res.data);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const addImages = () => {
    const formData = new FormData();
    if (image2) {
      formData.append("image2", image2);
    }

    if (image3) {
      formData.append("image3", image3);
    }
    api
      .post(`/products/${selectedProduct}/images`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.status === 200) toast.success("Images added successfully");

        const inputs = document.querySelectorAll("input");
        inputs.forEach((input) => {
          input.value = "";
        });

        setImage2(null);
        setImage3(null);
        getAllProducts();
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };
  useEffect(() => {
    getAllProducts();
  }, []);
  useEffect(() => {
    if (selectedProduct) getProductById(selectedProduct);
  }, [selectedProduct]);
  return (
    <div className="flex flex-1">
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
      <SidePanel />
      <div className="flex flex-col flex-1">
        <div className="w-full p-2 lg:p-10">
          <h1 className="text-2xl font-semibold text-gray-800">Images</h1>
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-4 items-center gap-5 w-full">
            <Select
              showSearch
              placeholder="Select a product"
              optionFilterProp="children"
              onChange={setSelectedProduct}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              size="large"
              options={products.map((product) => ({
                value: product.id,
                label: product.name,
              }))}
            />
            {productById.id && productById.image2 === null && (
              <input
                type="file"
                onChange={(e) => setImage2(e.target.files[0])}
                className="border border-gray-300 p-2 rounded-lg w-full"
              />
            )}
            {productById.id && productById.image3 === null && (
              <input
                type="file"
                onChange={(e) => setImage3(e.target.files[0])}
                className="border border-gray-300 p-2 rounded-lg w-full"
              />
            )}
            {productById.id && productById.image2 && productById.image3 ? (
              <button
                disabled
                className="bg-gray-400 p-2 text-white rounded-md"
              >
                Images already added
              </button>
            ) : (
              <button
                onClick={() => addImages()}
                className="bg-brand p-2 text-white rounded-md"
              >
                Add Image
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminImages;
