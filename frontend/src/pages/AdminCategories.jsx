import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api";
import { toast } from "react-toastify";
import { Table, Button, Card, Modal, Input, Form, Space, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // Fetch Categories
  const getCategories = () => {
    setLoading(true);
    api
      .get("/categories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setCategories(res.data);
        setFilteredCategories(res.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error("Failed to load categories");
        setLoading(false);
      });
  };

  useEffect(() => {
    getCategories();
  }, []);

  // Filter Logic
  useEffect(() => {
    if (!searchText) {
      setFilteredCategories(categories);
    } else {
      const lower = searchText.toLowerCase();
      const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(lower),
      );
      setFilteredCategories(filtered);
    }
  }, [searchText, categories]);

  // Handle Submit (Create & Update)
  const handleSubmit = (values) => {
    const formData = new FormData();
    formData.append("name", values.name);

    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    };

    if (editingCategory) {
      api
        .put(`/categories/${editingCategory.id}`, formData, config)
        .then(() => {
          toast.success("Category updated successfully");
          setIsModalOpen(false);
          getCategories();
        })
        .catch((err) =>
          toast.error(err.response?.data?.message || "Update failed"),
        );
    } else {
      api
        .post("/categories", formData, config)
        .then(() => {
          toast.success("Category created successfully");
          setIsModalOpen(false);
          getCategories();
        })
        .catch((err) =>
          toast.error(err.response?.data?.message || "Creation failed"),
        );
    }
  };

  // Handle Delete
  const deleteCategory = (id) => {
    Modal.confirm({
      title: "Delete Category?",
      content:
        "This action cannot be undone. Products in this category might be affected.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        api
          .delete(`/categories/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then(() => {
            toast.success("Category deleted");
            getCategories();
          })
          .catch((err) =>
            toast.error(err.response?.data?.message || "Delete failed"),
          );
      },
    });
  };

  // Open Modal Helper
  const openModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue({ name: category.name });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Category Name",
      dataIndex: "name",
      className: "font-medium text-gray-700",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Actions",
      width: 150,
      align: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteCategory(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout title="Category Management">
      <Card className="shadow-sm border-0 rounded-xl">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <Input
            placeholder="Search categories..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="max-w-xs rounded-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Button
            type="primary"
            className="bg-brand hover:bg-red-600 border-none rounded-md shadow-sm h-10 px-6 font-medium"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Add New Category
          </Button>
        </div>

        {/* Table */}
        <Table
          dataSource={filteredCategories}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          className="border border-gray-100 rounded-lg overflow-hidden"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <div className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">
            {editingCategory ? "Edit Category" : "Create New Category"}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label={
              <span className="font-medium text-gray-600">Category Name</span>
            }
            rules={[
              { required: true, message: "Please enter a category name" },
            ]}
          >
            <Input
              placeholder="e.g. Rice, Spices, Beverages"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-gray-50">
            <Button
              size="large"
              onClick={() => setIsModalOpen(false)}
              className="rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="bg-brand hover:bg-red-600 border-none rounded-md px-6"
            >
              {editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminCategories;
