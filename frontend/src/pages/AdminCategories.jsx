import { useEffect, useRef, useState } from "react";
import SidePanel from "../components/SidePanel";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table } from "antd";

const AdminCategories = () => {
  const ref = useRef(null);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [edit, setEdit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({});
  const [updateName, setUpdateName] = useState("");

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

  const createCategory = () => {
    const formData = new FormData();
    formData.append("name", name);
    api
      .post("/categories", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.status === 201) toast.success("Category created successfully");
        getCategories();
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const updateCategory = (id, name) => {
    const formData = new FormData();
    formData.append("name", name);
    api
      .put(`/categories/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.status === 200) toast.success("Category updated successfully");
        getCategories();
        setEdit(false);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const deleteCategory = (id) => {
    api
      .delete(`/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.status === 200) toast.success("Category deleted successfully");
        getCategories();
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  useEffect(() => {
    getCategories();
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
          <h1 className="text-2xl font-semibold">Categories</h1>
          <div className="grid grid-cols-1 md:flex md:items-center gap-x-2 md:gap-x-5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="border border-gray-300 p-2 rounded-lg w-full mt-5"
            />
            <button
              onClick={createCategory}
              className="bg-brand text-white p-2 rounded-lg mt-3"
            >
              Create New Category
            </button>
          </div>
          <div className="mt-5">
            <Table
              dataSource={categories}
              style={{ overflowX: "auto" }}
              className="overflow-auto"
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
                  render: (name) =>
                    edit ? (
                      <input
                        type="text"
                        value={updateName}
                        onChange={(e) => setUpdateName(e.target.value)}
                        onBlur={() =>
                          updateCategory(selectedCategory.id, updateName)
                        }
                        ref={ref}
                        className="border border-gray-300 p-2 rounded-lg w-fit"
                      />
                    ) : (
                      <p>{name}</p>
                    ),
                },
                {
                  title: "Action",
                  key: "action",
                  render: (action, record) => (
                    <div className="flex gap-x-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(record);
                          setEdit(true);
                          setUpdateName(record.name);
                          ref?.current?.focus();
                        }}
                        className="text-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(record.id)}
                        className="text-red-500"
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
    </div>
  );
};

export default AdminCategories;
