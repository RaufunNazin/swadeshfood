import { useEffect, useState } from "react";
import SidePanel from "../components/SidePanel";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Select, Table } from "antd";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("");
  const [size, setSize] = useState("");
  const [isnew, setNew] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpdateConfirm, setOpenUpdateConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({});
  const [updateName, setUpdateName] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updatePrice, setUpdatePrice] = useState("");
  const [updateCategory, setUpdateCategory] = useState("");
  const [updateStock, setUpdateStock] = useState("");
  const [updateSize, setUpdateSize] = useState("");
  const [updateNew, setUpdateNew] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const getCategories = () => {
    api
      .get("/categories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const updateProduct = (id) => {
    api
      .put(
        `/products/${id}`,
        {
          name: updateName,
          description: updateDescription,
          price: parseFloat(updatePrice),
          category: updateCategory,
          stock: parseInt(updateStock),
          size: updateSize,
          new: updateNew ? 1 : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          toast.success("Product updated successfully");
          setOpenUpdate(false);
          setOpenUpdateConfirm(false);
          getProducts();
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const CreateProduct = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", parseFloat(price));
    formData.append("category", category);
    formData.append("image", image);
    formData.append("stock", parseInt(stock));
    formData.append("size", size);
    formData.append("new", isnew ? 1 : 0);
    api
      .post("/products", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Product created successfully");
          setName("");
          setDescription("");
          setPrice("");
          setCategory("");
          setImage("");
          setStock("");
          setSize("");
          setNew(false);

          const inputs = document.querySelectorAll("input");
          inputs.forEach((input) => {
            input.value = "";
          });

          const textareas = document.querySelectorAll("textarea");
          textareas.forEach((textarea) => {
            textarea.value = "";
          });

          const selects = document.querySelectorAll("select");
          selects.forEach((select) => {
            select.value = "";
          });
        }
        getProducts();
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const getProducts = (page = 1, pageSize = 20) => {
    const offset = (page - 1) * pageSize;
    api
      .get(`/products/${offset}/${pageSize}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setProducts(res.data);
        setPagination({
          ...pagination,
          current: page,
          pageSize: pageSize,
          total: res.total || 0,
        });
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const deleteProduct = (id) => {
    api
      .delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.status === 204) toast.success("Product deleted successfully");
        setOpenDelete(false);
        getProducts();
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  useEffect(() => {
    getCategories();
    getProducts();
  }, []);
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
          <h1 className="text-2xl font-semibold">Products</h1>
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product name"
              className="border border-gray-300 p-2 rounded-lg w-full"
            />
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="border border-gray-300 p-2 rounded-lg w-full"
            />
            <Select
              options={categories.map((category) => ({
                value: category.name,
                label: category.name,
              }))}
              size="large"
              onChange={(e) => setCategory(e)}
              placeholder="Select category"
              className="w-full"
            />
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="border border-gray-300 p-2 rounded-lg w-full"
            />
            <input
              type="text"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Stock"
              className="border border-gray-300 p-2 rounded-lg w-full"
            />
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="Size"
              className="border border-gray-300 p-2 rounded-lg w-full"
            />
            <textarea
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="border md:col-span-2 border-gray-300 px-2 rounded-lg w-full"
            />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-x-2">
                <input
                  id="new"
                  type="checkbox"
                  onChange={(e) => setNew(e.target.checked)}
                  className=""
                />
                <label htmlFor="new">New Arrival</label>
              </div>
              <button
                onClick={() => CreateProduct()}
                className="bg-brand p-2 text-white rounded-md"
              >
                Create Product
              </button>
            </div>
          </div>
          <div className="mt-5 w-72 md:w-full overflow-x-auto">
            <Table
              dataSource={products}
              rowKey={(record) => record.id}
              style={{ overflowX: "auto" }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page, pageSize) => getProducts(page, pageSize),
                showSizeChanger: true,
                pageSizeOptions: ["20", "50", "100"],
                showQuickJumper: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
              className="overflow-auto mt-5"
              columns={[
                {
                  title: "ID",
                  dataIndex: "id",
                  key: "id",
                },
                {
                  title: "Name",
                  dataIndex: "name",
                  key: "name",
                },
                {
                  title: "Description",
                  dataIndex: "description",
                  key: "description",
                },
                {
                  title: "Image 1",
                  dataIndex: "image1",
                  key: "image",
                  render: (image) => {
                    return <img src={image} alt="product" width="100" />;
                  },
                },
                {
                  title: "Image 2",
                  dataIndex: "image2",
                  key: "image",
                  render: (image) => {
                    return image ? (
                      <img src={image} alt="product" width="100" />
                    ) : (
                      "No Image"
                    );
                  },
                },
                {
                  title: "Image 3",
                  dataIndex: "image3",
                  key: "image",
                  render: (image) => {
                    return image ? (
                      <img src={image} alt="product" width="100" />
                    ) : (
                      "No Image"
                    );
                  },
                },
                {
                  title: "Price",
                  dataIndex: "price",
                  key: "price",
                },
                {
                  title: "Category",
                  dataIndex: "category",
                  key: "category",
                },
                {
                  title: "Stock",
                  dataIndex: "stock",
                  key: "stock",
                },
                {
                  title: "Size",
                  dataIndex: "size",
                  key: "size",
                },
                {
                  title: "New",
                  dataIndex: "new",
                  key: "new",
                  render: (newProduct) => {
                    return (
                      <p>{newProduct === 1 ? "New Arrival" : "Not New"}</p>
                    );
                  },
                },
                {
                  title: "Action",
                  key: "action",
                  render: (action, record) => (
                    <div className="flex gap-x-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(record);
                          setUpdateName(record.name);
                          setUpdateDescription(record.description);
                          setUpdatePrice(record.price);
                          setUpdateCategory(record.category);
                          setUpdateStock(record.stock);
                          setUpdateSize(record.size);
                          setUpdateNew(record.new);
                          setOpenUpdate(true);
                        }}
                        className="bg-brand text-white p-2 rounded-lg"
                      >
                        Update
                      </button>
                      <button
                        onClick={() =>
                          setOpenDelete(true) && setSelectedProduct(record)
                        }
                        className="bg-red-500 text-white p-2 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
      <Modal
        title="Delete Product"
        open={openDelete}
        onOk={() => {
          deleteProduct(selectedProduct.id);
        }}
        okText="Delete"
        onCancel={() => setOpenDelete(false)}
        centered
      >
        <div className="mx-2 my-4">
          Are you sure you want to delete this product ?
        </div>
      </Modal>
      <Modal
        title="Update Product"
        open={openUpdateConfirm}
        onOk={() => {
          updateProduct(selectedProduct.id);
        }}
        okText="Update"
        onCancel={() => setOpenUpdateConfirm(false)}
        centered
      >
        <div className="mx-2 my-4">
          Are you sure you want to update this product ?
        </div>
      </Modal>
      <Modal
        title="Update Product"
        open={openUpdate}
        width={1000}
        okText="Update"
        onOk={() => {
          setOpenDelete(false);
          setOpenUpdateConfirm(true);
        }}
        onCancel={() => setOpenUpdate(false)}
      >
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1">
            <div>
              <strong>Product Name</strong>
            </div>
            <input
              type="text"
              value={updateName}
              onChange={(e) => setUpdateName(e.target.value)}
              placeholder="Product name"
              className="border border-gray-300 p-2 rounded-lg w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div>
              <strong>Price</strong>
            </div>
            <input
              type="text"
              value={updatePrice}
              onChange={(e) => setUpdatePrice(e.target.value)}
              placeholder="Price"
              className="border border-gray-300 p-2 rounded-lg w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div>
              <strong>Category</strong>
            </div>
            <Select
              options={categories.map((category) => ({
                value: category.name,
                label: category.name,
              }))}
              value={updateCategory}
              size="large"
              onChange={(e) => setUpdateCategory(e)}
              placeholder="Select category"
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div>
              <strong>Stock</strong>
            </div>
            <input
              type="text"
              value={updateStock}
              onChange={(e) => setUpdateStock(e.target.value)}
              placeholder="Stock"
              className="border border-gray-300 p-2 rounded-lg w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div>
              <strong>Size</strong>
            </div>
            <input
              type="text"
              value={updateSize}
              onChange={(e) => setUpdateSize(e.target.value)}
              placeholder="Size"
              className="border border-gray-300 p-2 rounded-lg w-full"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-x-2">
              <input
                id="new"
                type="checkbox"
                checked={updateNew}
                onChange={(e) => setUpdateNew(e.target.checked)}
                className=""
              />
              <label htmlFor="new">New Arrival</label>
            </div>
          </div>
          <div className="flex flex-col gap-1 col-span-3">
            <div>
              <strong>Description</strong>
            </div>
            <textarea
              type="text"
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
              placeholder="Description"
              className="border md:col-span-2 border-gray-300 px-2 rounded-lg w-full"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProducts;
