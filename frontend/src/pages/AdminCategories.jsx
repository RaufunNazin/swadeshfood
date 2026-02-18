import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api";
import { toast } from "react-toastify";
import {
  Table,
  Button,
  Card,
  Modal,
  Input,
  Form,
  Space,
  Tooltip,
  ConfigProvider,
  theme as antdTheme,
} from "antd";
import { useTheme } from "../contexts/ThemeContext";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../contexts/LanguageContext"; // Import language context

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // Language Context
  const { theme } = useTheme(); // 2. Grab current theme
  const { t } = useLanguage();

  // Fetch Categories
  const getCategories = () => {
    setLoading(true);
    api
      .get("/categories")
      .then((res) => {
        setCategories(res.data);
        setFilteredCategories(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error(t("load_failed") || "Failed to load categories");
        setLoading(false);
      });
  };

  useEffect(() => {
    getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        "Content-Type": "multipart/form-data",
      },
    };

    if (editingCategory) {
      api
        .put(`/categories/${editingCategory.id}`, formData, config)
        .then(() => {
          toast.success(
            t("category_updated") || "Category updated successfully",
          );
          setIsModalOpen(false);
          getCategories();
        })
        .catch((err) =>
          toast.error(
            err.response?.data?.message ||
              t("update_failed") ||
              "Update failed",
          ),
        );
    } else {
      api
        .post("/categories", formData, config)
        .then(() => {
          toast.success(
            t("category_created") || "Category created successfully",
          );
          setIsModalOpen(false);
          getCategories();
        })
        .catch((err) =>
          toast.error(
            err.response?.data?.message ||
              t("creation_failed") ||
              "Creation failed",
          ),
        );
    }
  };

  // Handle Delete
  const deleteCategory = (id) => {
    Modal.confirm({
      title: t("delete_category_title") || "Delete Category?",
      content:
        t("delete_category_confirm") ||
        "This action cannot be undone. Products in this category might be affected.",
      okText: t("delete") || "Delete",
      okType: "danger",
      cancelText: t("cancel") || "Cancel",
      onOk: () => {
        api
          .delete(`/categories/${id}`)
          .then(() => {
            toast.success(t("category_deleted") || "Category deleted");
            getCategories();
          })
          .catch((err) =>
            toast.error(
              err.response?.data?.message ||
                t("delete_failed") ||
                "Delete failed",
            ),
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
      title: t("category_name") || "Category Name",
      dataIndex: "name",
      className: "font-medium text-neutral-700 dark:text-neutral-200", // Dark mode text class
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t("actions") || "Actions",
      width: 150,
      align: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title={t("edit") || "Edit"}>
            <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          </Tooltip>
          <Tooltip title={t("delete") || "Delete"}>
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
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      <AdminLayout title={t("category_management") || "Category Management"}>
        <Card className="shadow-sm border-0 rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
          {" "}
          {/* Dark mode background */}
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <Input
              placeholder={t("search_categories") || "Search categories..."}
              prefix={<SearchOutlined className="text-neutral-400" />}
              className="max-w-xs rounded-md"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button
              type="primary"
              className="bg-brand hover:bg-green-700 border-none rounded-md shadow-sm h-10 px-6 font-medium dark:bg-green-600 dark:hover:bg-green-500" // Updated colors for dark mode context if needed
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              {t("add_category") || "Add New Category"}
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
                `${range[0]}-${range[1]} ${t("of") || "of"} ${total} ${t("items") || "items"}`,
            }}
            className="border border-neutral-100 dark:border-neutral-700 rounded-lg overflow-hidden"
            // Ant Design Table generally handles dark mode via ConfigProvider, but if not set globally,
            // specific CSS overrides might be needed for the table body background.
          />
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          title={
            <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 border-b dark:border-neutral-700 pb-3 mb-4">
              {editingCategory
                ? t("edit_category") || "Edit Category"
                : t("create_category") || "Create New Category"}
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={500}
          centered
          // Ant Design Modal dark mode support usually requires ConfigProvider or custom styles for the modal content background
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label={
                <span className="font-medium text-neutral-600 dark:text-neutral-300">
                  {t("category_name_label") || "Category Name"}
                </span>
              }
              rules={[
                {
                  required: true,
                  message:
                    t("enter_category_name") || "Please enter a category name",
                },
              ]}
            >
              <Input
                placeholder={
                  t("category_placeholder") || "e.g. Rice, Spices, Beverages"
                }
                size="large"
                className="rounded-md"
              />
            </Form.Item>

            <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-neutral-50 dark:border-neutral-700">
              <Button
                size="large"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md"
              >
                {t("cancel") || "Cancel"}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="bg-brand hover:bg-green-700 border-none rounded-md px-6 dark:bg-green-600 dark:hover:bg-green-500"
              >
                {editingCategory
                  ? t("update_category") || "Update Category"
                  : t("create_category_btn") || "Create Category"}
              </Button>
            </div>
          </Form>
        </Modal>
      </AdminLayout>
    </ConfigProvider>
  );
};

export default AdminCategories;
