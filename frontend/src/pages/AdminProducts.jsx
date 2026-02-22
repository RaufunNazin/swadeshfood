/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api";
import { toast } from "react-toastify";
import {
  Modal,
  Select,
  Table,
  Button,
  Input,
  Form,
  Card,
  Tag,
  Checkbox,
  Image,
  Upload,
  ConfigProvider,
  theme as antdTheme,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined,
  FileImageOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext"; // Import Language Context

const { TextArea } = Input;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // -- Modals State --
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);

  // -- Recipe Data --
  const [recipeItems, setRecipeItems] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    qty: "",
    price: "",
  });

  // -- Gallery Data --
  const [galleryImages, setGalleryImages] = useState({
    img2: null,
    img3: null,
  });

  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Language Context
  const { theme } = useTheme();
  const { t } = useLanguage();

  // --- HELPER: Validate File Size (Max 1MB) ---
  const validateFile = (file) => {
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      toast.error(t("image_size_error") || "Image must be smaller than 1MB!");
      return Upload.LIST_IGNORE; // Prevents adding to the list
    }
    return false; // Prevent auto-upload, keep in list
  };

  // 1. Initial Data Fetch
  const fetchProducts = (page = 1, pageSize = 10) => {
    setLoading(true);
    const offset = (page - 1) * pageSize;
    api
      .get(`/products/${offset}/${pageSize}`)
      .then((res) => {
        setProducts(res.data);
        setPagination({ ...pagination, current: page, pageSize, total: 100 });
        setLoading(false);
      })
      .catch(() => {
        toast.error(t("load_products_failed") || "Failed to load products");
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    api.get("/categories").then((res) => setCategories(res.data));
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // 2. Create / Edit Product Logic
  const handleSubmit = async (values) => {
    try {
      if (isEditMode) {
        // Edit Mode uses JSON
        const updatePayload = {
          name: values.name,
          description: values.description || "",
          price: parseFloat(values.price),
          category: values.category,
          stock: parseInt(values.stock),
          size: values.size || "",
          new: values.new ? 1 : 0,
        };
        await api.put(`/products/${currentProduct.id}`, updatePayload);
        toast.success(t("product_updated"));
      } else {
        // Create Mode uses FormData
        const formData = new FormData();

        // Extract the raw file correctly from Ant Design's Upload structure
        const fileObj =
          values.image?.file?.originFileObj ||
          values.image?.fileList?.[0]?.originFileObj;

        if (!fileObj) {
          toast.error(t("select_valid_image"));
          return;
        }

        // Append every field INDIVIDUALLY
        formData.append("image", fileObj);
        formData.append("name", values.name);
        formData.append("description", values.description || "");
        formData.append("price", parseFloat(values.price));
        formData.append("category", values.category);
        formData.append("stock", parseInt(values.stock));
        formData.append("size", values.size || "");
        formData.append("new", values.new ? 1 : 0);

        // Send with appropriate headers
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(t("product_created"));
      }

      setIsModalOpen(false);
      fetchProducts(pagination.current);
    } catch (err) {
      console.error("Submission error:", err.response?.data);
      const detail = err.response?.data?.detail;
      toast.error(
        Array.isArray(detail)
          ? detail[0].msg
          : detail || t("error_saving_product"),
      );
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: t("delete_product_title") || "Delete Product?",
      content: t("delete_product_confirm") || "This cannot be undone.",
      okText: t("delete") || "Delete",
      okType: "danger",
      cancelText: t("cancel") || "Cancel",
      onOk: () => {
        api.delete(`/products/${id}`).then(() => {
          toast.success(t("deleted_success") || "Deleted successfully");
          fetchProducts(pagination.current);
        });
      },
    });
  };

  // 3. Recipe Logic
  const openRecipeModal = (product) => {
    setCurrentProduct(product);
    setRecipeModalOpen(true);
    api
      .get(`/products/${product.id}/recipe`)
      .then((res) => setRecipeItems(res.data));
  };

  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.qty || !newIngredient.price)
      return;

    api
      .post(`/products/${currentProduct.id}/recipe`, {
        ingredient_name: newIngredient.name,
        quantity: parseFloat(newIngredient.qty),
        unit_price: parseFloat(newIngredient.price),
      })
      .then((res) => {
        setRecipeItems([...recipeItems, res.data]);
        setNewIngredient({ name: "", qty: "", price: "" });
        toast.success(t("ingredient_added") || "Ingredient added");
      });
  };

  const removeIngredient = (itemId) => {
    api.delete(`/products/recipe/${itemId}`).then(() => {
      setRecipeItems(recipeItems.filter((i) => i.id !== itemId));
    });
  };

  // 4. Gallery Logic
  const openGalleryModal = (product) => {
    setCurrentProduct(product);
    setGalleryModalOpen(true);
    setGalleryImages({ img2: null, img3: null });
  };

  const handleGalleryUpload = async () => {
    const formData = new FormData();
    const getFile = (state) =>
      state?.file?.originFileObj || state?.fileList?.[0]?.originFileObj;

    const img2File = getFile(galleryImages.img2);
    const img3File = getFile(galleryImages.img3);

    if (img2File) formData.append("image2", img2File);
    if (img3File) formData.append("image3", img3File);

    if (!img2File && !img3File) {
      toast.info(t("select_image_upload"));
      return;
    }

    try {
      await api.post(`/products/${currentProduct.id}/images`, formData);
      toast.success(t("gallery_updated"));
      setGalleryModalOpen(false);
      fetchProducts(pagination.current);
    } catch (err) {
      toast.error(t("upload_failed"));
    }
  };

  // 5. Table Config
  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    {
      title: t("main_image") || "Main Image",
      dataIndex: "image1",
      render: (src) => (
        <Image src={src} width={50} className="rounded border" />
      ),
    },
    {
      title: t("name") || "Name",
      dataIndex: "name",
      width: 180,
      className: "font-medium dark:text-neutral-200",
    },
    {
      title: t("category") || "Category",
      dataIndex: "category",
      className: "dark:text-neutral-300",
    },
    {
      title: t("price_label") || "Price",
      dataIndex: "price",
      render: (p) => <span className="dark:text-neutral-300">৳{p}</span>,
    },
    {
      title: t("stock") || "Stock",
      dataIndex: "stock",
      render: (s) => <Tag color={s < 10 ? "red" : "green"}>{s}</Tag>,
    },
    {
      title: t("actions") || "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            icon={<FileImageOutlined />}
            onClick={() => openGalleryModal(record)}
            title={t("gallery") || "Gallery"}
          />
          <Button
            icon={<ExperimentOutlined />}
            onClick={() => openRecipeModal(record)}
            title={t("recipe") || "Recipe"}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentProduct(record);
              setIsEditMode(true);
              form.setFieldsValue({ ...record, new: record.new === 1 });
              setIsModalOpen(true);
            }}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </div>
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
      <AdminLayout title={t("product_inventory") || "Product Inventory"}>
        <Card className="shadow-sm border-0 rounded-xl dark:bg-neutral-800">
          <div className="flex justify-between mb-4">
            <Input.Search
              placeholder={t("search_products") || "Search products..."}
              className="max-w-xs dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
            />
            <Button
              type="primary"
              className="bg-brand dark:bg-green-600 dark:hover:bg-green-500 dark:border-none"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsEditMode(false);
                form.resetFields();
                setIsModalOpen(true);
              }}
            >
              {t("add_product") || "Add Product"}
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={products}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              onChange: (page, size) => fetchProducts(page, size),
            }}
            scroll={{ x: 800 }}
            className="dark:border-neutral-700"
            // AntD Table dark mode requires global ConfigProvider for full styling
          />
        </Card>

        {/* --- Create/Edit Modal --- */}
        <Modal
          title={
            isEditMode
              ? t("edit_product") || "Edit Product"
              : t("new_product") || "New Product"
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={700}
          // Modal styling for dark mode might need global CSS override
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label={t("name") || "Name"}
                rules={[{ required: true }]}
                className="col-span-2"
              >
                <Input size="large" />
              </Form.Item>
              <Form.Item
                name="price"
                label={t("price_label") || "Price"}
                rules={[{ required: true }]}
              >
                <Input type="number" step="0.01" prefix="৳" />
              </Form.Item>
              <Form.Item
                name="stock"
                label={t("stock") || "Stock"}
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                name="category"
                label={t("category") || "Category"}
                rules={[{ required: true }]}
              >
                <Select
                  options={categories.map((c) => ({
                    label: c.name,
                    value: c.name,
                  }))}
                />
              </Form.Item>
              <Form.Item name="size" label={t("size_unit") || "Size/Unit"}>
                <Input
                  placeholder={t("size_placeholder") || "e.g. Large, 500g"}
                />
              </Form.Item>
            </div>

            {/* UPDATED: Description with 2000 char limit */}
            <Form.Item
              name="description"
              label={t("description") || "Description"}
              rules={[
                {
                  max: 2000,
                  message:
                    t("description_max_error") ||
                    "Description cannot exceed 2000 characters",
                },
              ]}
            >
              <TextArea
                rows={5}
                maxLength={2000}
                showCount
                placeholder={
                  t("product_details_placeholder") || "Product details..."
                }
              />
            </Form.Item>

            {!isEditMode && (
              <Form.Item
                label={t("main_image") || "Main Image"}
                name="image"
                rules={[
                  {
                    required: true,
                    message:
                      t("upload_main_image") ||
                      "Please upload the main product image",
                  },
                ]}
              >
                {/* UPDATED: File Validation */}
                <Upload
                  maxCount={1}
                  listType="picture"
                  beforeUpload={validateFile} // <--- Added Validation
                >
                  <Button icon={<UploadOutlined />} className="w-full">
                    {t("select_image_file") || "Select Image File (Max 1MB)"}
                  </Button>
                </Upload>
              </Form.Item>
            )}

            <Form.Item name="new" valuePropName="checked">
              <Checkbox>
                {t("mark_new_arrival") || "Mark as New Arrival"}
              </Checkbox>
            </Form.Item>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button onClick={() => setIsModalOpen(false)}>
                {t("cancel") || "Cancel"}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-brand dark:bg-green-600 dark:hover:bg-green-500"
              >
                {t("save_product") || "Save Product"}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* --- Recipe Modal --- */}
        <Modal
          title={`${t("recipe") || "Recipe"}: ${currentProduct?.name || ""}`}
          open={recipeModalOpen}
          onCancel={() => setRecipeModalOpen(false)}
          footer={null}
          width={700}
        >
          {/* ... Recipe Content ... */}
          <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded mb-4 border border-neutral-100 dark:border-neutral-600">
            <div className="flex gap-2">
              <Input
                placeholder={t("item_name") || "Item Name"}
                value={newIngredient.name}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, name: e.target.value })
                }
              />
              <Input
                placeholder={t("qty") || "Qty"}
                style={{ width: 100 }}
                type="number"
                value={newIngredient.qty}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, qty: e.target.value })
                }
              />
              <Input
                placeholder={t("cost") || "Cost ($)"}
                style={{ width: 100 }}
                type="number"
                value={newIngredient.price}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, price: e.target.value })
                }
              />
              <Button
                type="primary"
                onClick={addIngredient}
                icon={<PlusOutlined />}
                className="bg-brand dark:bg-green-600"
              />
            </div>
          </div>
          <Table
            dataSource={recipeItems}
            rowKey="id"
            pagination={false}
            size="small"
            columns={[
              {
                title: t("ingredient") || "Ingredient",
                dataIndex: "ingredient_name",
              },
              { title: t("qty") || "Qty", dataIndex: "quantity" },
              {
                title: t("unit_cost") || "Unit Cost",
                dataIndex: "unit_price",
                render: (p) => `৳${p}`,
              },
              {
                title: t("total") || "Total",
                dataIndex: "total_cost",
                render: (p) => `৳${p.toFixed(2)}`,
              },
              {
                render: (_, r) => (
                  <Button
                    danger
                    size="small"
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeIngredient(r.id)}
                  />
                ),
              },
            ]}
            className="dark:bg-neutral-800"
          />
        </Modal>

        {/* --- Gallery Modal --- */}
        <Modal
          title={`${t("gallery") || "Gallery"}: ${currentProduct?.name}`}
          open={galleryModalOpen}
          onCancel={() => setGalleryModalOpen(false)}
          onOk={handleGalleryUpload}
          okText={t("upload_images") || "Upload Images"}
          okButtonProps={{ className: "bg-brand dark:bg-green-600" }}
          width={600}
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-center">
              <p className="mb-3 font-semibold text-neutral-600 dark:text-neutral-300">
                {t("side_view") || "Side View (Image 2)"}
              </p>
              {currentProduct?.image2 && (
                <div className="mb-3">
                  <Image
                    src={currentProduct.image2}
                    height={80}
                    className="rounded border border-neutral-200 dark:border-neutral-600"
                  />
                </div>
              )}
              {/* UPDATED: File Validation */}
              <Upload
                maxCount={1}
                listType="picture-card"
                beforeUpload={validateFile} // <--- Added Validation
                showUploadList={{ showPreviewIcon: false }}
                onChange={(info) =>
                  setGalleryImages((prev) => ({ ...prev, img2: info }))
                }
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>
                    {t("max_1mb") || "Max 1MB"}
                  </div>
                </div>
              </Upload>
            </div>

            <div className="p-4 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-center">
              <p className="mb-3 font-semibold text-neutral-600 dark:text-neutral-300">
                {t("detail_view") || "Detail View (Image 3)"}
              </p>
              {currentProduct?.image3 && (
                <div className="mb-3">
                  <Image
                    src={currentProduct.image3}
                    height={80}
                    className="rounded border border-neutral-200 dark:border-neutral-600"
                  />
                </div>
              )}
              {/* UPDATED: File Validation */}
              <Upload
                maxCount={1}
                listType="picture-card"
                beforeUpload={validateFile} // <--- Added Validation
                showUploadList={{ showPreviewIcon: false }}
                onChange={(info) =>
                  setGalleryImages((prev) => ({ ...prev, img3: info }))
                }
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>
                    {t("max_1mb") || "Max 1MB"}
                  </div>
                </div>
              </Upload>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ConfigProvider>
  );
};

export default AdminProducts;
