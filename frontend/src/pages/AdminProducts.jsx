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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined,
  FileImageOutlined,
  UploadOutlined,
} from "@ant-design/icons";

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

  // 1. Initial Data Fetch
  const fetchProducts = (page = 1, pageSize = 10) => {
    setLoading(true);
    const offset = (page - 1) * pageSize;
    api
      .get(`/products/${offset}/${pageSize}`)
      .then((res) => {
        setProducts(res.data);
        // Assuming backend simulates total for now, or returns strictly list
        setPagination({ ...pagination, current: page, pageSize, total: 100 });
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load products");
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
    const formData = new FormData();

    // 1. Append standard fields
    formData.append("name", values.name);
    formData.append("price", values.price);
    formData.append("stock", values.stock);
    formData.append("category", values.category);
    formData.append("size", values.size || "");
    formData.append("description", values.description || "");
    formData.append("new", values.new ? 1 : 0);

    // 2. Safely handle the image file
    if (!isEditMode) {
      // Check if values.image exists AND has the file property from Ant Design
      const fileObj = values.image?.file?.originFileObj;

      if (fileObj) {
        formData.append("image", fileObj);
      } else {
        // Prevent the request if the file is missing to avoid the 422 error
        toast.error("Please select a valid image file");
        return;
      }
    }

    try {
      if (isEditMode) {
        // standard PUT for edits
        await api.put(
          `/products/${currentProduct.id}`,
          {
            ...values,
            new: values.new ? 1 : 0,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        toast.success("Product Updated");
      } else {
        // POST with multipart/form-data
        await api.post("/products", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Product Created");
      }
      setIsModalOpen(false);
      fetchProducts(pagination.current);
    } catch (err) {
      // Correctly display the backend error detail
      const errorMsg =
        err.response?.data?.detail?.[0]?.msg || "Error saving product";
      toast.error(errorMsg);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Product?",
      content: "This cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        api
          .delete(`/products/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then(() => {
            toast.success("Deleted successfully");
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
      .get(`/products/${product.id}/recipe`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setRecipeItems(res.data));
  };

  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.qty || !newIngredient.price)
      return;

    api
      .post(
        `/products/${currentProduct.id}/recipe`,
        {
          ingredient_name: newIngredient.name,
          quantity: parseFloat(newIngredient.qty),
          unit_price: parseFloat(newIngredient.price),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      .then((res) => {
        setRecipeItems([...recipeItems, res.data]);
        setNewIngredient({ name: "", qty: "", price: "" });
        toast.success("Ingredient added");
      });
  };

  const removeIngredient = (itemId) => {
    api
      .delete(`/products/recipe/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        setRecipeItems(recipeItems.filter((i) => i.id !== itemId));
      });
  };

  // 4. Gallery Logic (Merged from AdminImages)
  const openGalleryModal = (product) => {
    setCurrentProduct(product);
    setGalleryModalOpen(true);
    setGalleryImages({ img2: null, img3: null });
  };

  const handleGalleryUpload = () => {
    const formData = new FormData();
    if (galleryImages.img2) formData.append("image2", galleryImages.img2);
    if (galleryImages.img3) formData.append("image3", galleryImages.img3);

    if (!galleryImages.img2 && !galleryImages.img3) {
      toast.info("Select at least one image to upload");
      return;
    }

    api
      .post(`/products/${currentProduct.id}/images`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        toast.success("Gallery updated!");
        setGalleryModalOpen(false);
        fetchProducts(pagination.current); // refresh to see new images
      })
      .catch((err) => toast.error("Upload failed"));
  };

  // 5. Table Config
  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    {
      title: "Main Image",
      dataIndex: "image1",
      render: (src) => (
        <Image src={src} width={50} className="rounded border" />
      ),
    },
    { title: "Name", dataIndex: "name", width: 180, className: "font-medium" },
    { title: "Category", dataIndex: "category" },
    { title: "Price", dataIndex: "price", render: (p) => `৳${p}` },
    {
      title: "Stock",
      dataIndex: "stock",
      render: (s) => <Tag color={s < 10 ? "red" : "green"}>{s}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            icon={<FileImageOutlined />}
            onClick={() => openGalleryModal(record)}
            title="Gallery"
          />
          <Button
            icon={<ExperimentOutlined />}
            onClick={() => openRecipeModal(record)}
            title="Recipe"
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
    <AdminLayout title="Product Inventory">
      <Card className="shadow-sm border-0 rounded-xl">
        <div className="flex justify-between mb-4">
          <Input.Search placeholder="Search products..." className="max-w-xs" />
          <Button
            type="primary"
            className="bg-brand"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsEditMode(false);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Add Product
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
        />
      </Card>

      {/* --- Create/Edit Modal --- */}
      <Modal
        title={isEditMode ? "Edit Product" : "New Product"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true }]}
              className="col-span-2"
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item name="price" label="Price" rules={[{ required: true }]}>
              <Input type="number" step="0.01" prefix="৳" />
            </Form.Item>
            <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true }]}
            >
              <Select
                options={categories.map((c) => ({
                  label: c.name,
                  value: c.name,
                }))}
              />
            </Form.Item>
            <Form.Item name="size" label="Size/Unit">
              <Input placeholder="e.g. Large, 500g" />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          {!isEditMode && (
            <Form.Item
              label="Main Image"
              name="image"
              rules={[
                {
                  required: true,
                  message: "Please upload the main product image",
                },
              ]}
            >
              <Upload
                maxCount={1}
                listType="picture"
                // This stops the auto-upload to a URL and keeps the file in the form state
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />} className="w-full">
                  Select Image File
                </Button>
              </Upload>
            </Form.Item>
          )}

          <Form.Item name="new" valuePropName="checked">
            <Checkbox>Mark as New Arrival</Checkbox>
          </Form.Item>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-brand">
              Save Product
            </Button>
          </div>
        </Form>
      </Modal>

      {/* --- Recipe Modal --- */}
      <Modal
        title={`Recipe: ${currentProduct?.name || ""}`}
        open={recipeModalOpen}
        onCancel={() => setRecipeModalOpen(false)}
        footer={null}
        width={700}
      >
        <div className="bg-gray-50 p-4 rounded mb-4 border border-gray-100">
          <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
            Add Ingredient
          </h4>
          <div className="flex gap-2">
            <Input
              placeholder="Item Name"
              value={newIngredient.name}
              onChange={(e) =>
                setNewIngredient({ ...newIngredient, name: e.target.value })
              }
            />
            <Input
              placeholder="Qty"
              style={{ width: 100 }}
              type="number"
              value={newIngredient.qty}
              onChange={(e) =>
                setNewIngredient({ ...newIngredient, qty: e.target.value })
              }
            />
            <Input
              placeholder="Cost ($)"
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
              className="bg-brand"
            />
          </div>
        </div>

        <Table
          dataSource={recipeItems}
          rowKey="id"
          pagination={false}
          size="small"
          summary={(pageData) => {
            let total = 0;
            pageData.forEach(({ total_cost }) => {
              total += total_cost;
            });
            return (
              <Table.Summary.Row className="bg-red-50 font-bold">
                <Table.Summary.Cell
                  index={0}
                  colSpan={3}
                  className="text-right"
                >
                  Total Production Cost:
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  ${total.toFixed(2)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
          columns={[
            { title: "Ingredient", dataIndex: "ingredient_name" },
            { title: "Qty", dataIndex: "quantity" },
            {
              title: "Unit Cost",
              dataIndex: "unit_price",
              render: (p) => `৳${p}`,
            },
            {
              title: "Total",
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
        />
      </Modal>

      {/* --- Gallery Modal (Replaces AdminImages) --- */}
      <Modal
        title={`Gallery: ${currentProduct?.name}`}
        open={galleryModalOpen}
        onCancel={() => setGalleryModalOpen(false)}
        onOk={handleGalleryUpload}
        okText="Upload Images"
        okButtonProps={{ className: "bg-brand" }}
      >
        <div className="flex flex-col gap-4">
          <div className="p-4 border rounded bg-gray-50">
            <p className="mb-2 font-semibold">Image 2 (Additional View)</p>
            {currentProduct?.image2 ? (
              <div className="mb-2">
                <Image src={currentProduct.image2} width={100} />
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-2">No image uploaded</p>
            )}
            <Input
              type="file"
              onChange={(e) =>
                setGalleryImages({ ...galleryImages, img2: e.target.files[0] })
              }
            />
          </div>

          <div className="p-4 border rounded bg-gray-50">
            <p className="mb-2 font-semibold">Image 3 (Additional View)</p>
            {currentProduct?.image3 ? (
              <div className="mb-2">
                <Image src={currentProduct.image3} width={100} />
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-2">No image uploaded</p>
            )}
            <Input
              type="file"
              onChange={(e) =>
                setGalleryImages({ ...galleryImages, img3: e.target.files[0] })
              }
            />
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminProducts;
