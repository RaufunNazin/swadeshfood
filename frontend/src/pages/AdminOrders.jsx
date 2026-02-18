/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api";
import {
  Table,
  Tag,
  Select,
  Button,
  DatePicker,
  Card,
  Modal,
  Tooltip,
  ConfigProvider,
  theme as antdTheme,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useLanguage } from "../contexts/LanguageContext"; // Import Language Context
import { useTheme } from "../contexts/ThemeContext";

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: "", paid: "", userId: "" });
  const [dateRange, setDateRange] = useState(null);
  const [users, setUsers] = useState([]);

  // Detail Modal State
  const [detailModal, setDetailModal] = useState({ open: false, data: null });

  // Language Context
  const { theme } = useTheme();
  const { t } = useLanguage();

  const fetchOrders = () => {
    setLoading(true);
    let params = {};
    if (dateRange) {
      params.start_date = dateRange[0].unix();
      params.end_date = dateRange[1].unix();
    }

    api
      .get("/order", {
        params,
      })
      .then((res) => {
        let data = res.data;
        // Client side filtering for status/paid if backend endpoints are messy
        if (filters.status)
          data = data.filter((o) => o.status === filters.status);
        if (filters.paid !== "")
          data = data.filter((o) => o.paid === (filters.paid === "1" ? 1 : 0));
        setOrders(data.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    api.get("/users").then((res) => setUsers(res.data));
    fetchOrders();
  }, [dateRange, filters]); // Re-fetch on filter change

  const updateStatus = (id, status) => {
    api.patch(`/order/${id}/status/${status}`, {}).then(() => {
      toast.success(t("status_updated") || "Status Updated");
      fetchOrders();
    });
  };

  const togglePaid = (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    api.patch(`/order/${id}/paid/${newStatus}`, {}).then(() => {
      toast.success(
        newStatus
          ? t("marked_paid") || "Marked as Paid"
          : t("marked_unpaid") || "Marked as Unpaid",
      );
      fetchOrders();
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    {
      title: t("customer") || "Customer",
      render: (_, r) => (
        <div className="flex flex-col">
          <span className="font-semibold dark:text-neutral-200">{r.name}</span>
          <span className="text-xs text-neutral-400">{r.phone}</span>
        </div>
      ),
    },
    {
      title: t("date") || "Date",
      dataIndex: "created_at",
      render: (ts) => (
        <span className="dark:text-neutral-300">
          {dayjs.unix(ts).format("DD MMM YYYY")}
        </span>
      ),
    },
    {
      title: t("products") || "Products",
      dataIndex: "products",
      width: 300,
      render: (products) => {
        try {
          // Check if products is an array (Pydantic parsed) or needs JSON.parse (legacy/safety)
          const items = Array.isArray(products)
            ? products
            : JSON.parse(products || "[]");

          return (
            <div className="flex flex-col gap-1">
              {items.map((i, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-neutral-100 dark:bg-neutral-700 dark:text-neutral-200 p-1 rounded"
                >
                  {i.name || i.product_name}
                  <span className="font-bold"> x{i.quantity}</span>
                </div>
              ))}
            </div>
          );
        } catch (e) {
          return (
            <span className="text-red-500 text-xs">
              {t("error_parsing") || "Error parsing"}
            </span>
          );
        }
      },
    },
    {
      title: t("status") || "Status",
      dataIndex: "status",
      render: (status, record) => (
        <Select
          defaultValue={status}
          className="w-32"
          onChange={(val) => updateStatus(record.id, val)}
          status={
            status === "delivered"
              ? "success"
              : status === "new"
                ? "warning"
                : ""
          }
        >
          <Option value="new">{t("status_new") || "New"}</Option>
          <Option value="processing">
            {t("status_processing") || "Processing"}
          </Option>
          <Option value="transit">{t("status_transit") || "In Transit"}</Option>
          <Option value="delivered">
            {t("status_delivered") || "Delivered"}
          </Option>
        </Select>
      ),
    },
    {
      title: t("payment") || "Payment",
      dataIndex: "paid",
      render: (paid, record) => (
        <Tag
          icon={paid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={paid ? "success" : "error"}
          className="cursor-pointer"
          onClick={() => togglePaid(record.id, paid)}
        >
          {paid ? t("paid") || "PAID" : t("unpaid") || "UNPAID"}
        </Tag>
      ),
    },
    {
      title: t("actions") || "Actions",
      render: (_, r) => (
        <div className="flex gap-2">
          <Tooltip title={t("view_details") || "View Details"}>
            <Button
              icon={<EyeOutlined />}
              onClick={() => setDetailModal({ open: true, data: r })}
            />
          </Tooltip>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: t("delete_order_title") || "Delete Order?",
                content:
                  t("delete_order_confirm") || "This action cannot be undone.",
                okText: t("delete") || "Delete",
                cancelText: t("cancel") || "Cancel",
                onOk: () => {
                  api.delete(`/order/${r.id}`).then(() => fetchOrders());
                },
              });
            }}
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
      <AdminLayout title={t("order_history") || "Order History"}>
        <Card className="shadow-sm border-0 rounded-xl mb-6 dark:bg-neutral-800">
          <div className="flex flex-wrap gap-4 items-center">
            <Select
              placeholder={t("filter_by_user") || "Filter by User"}
              style={{ width: 200 }}
              allowClear
              onChange={(v) => setFilters({ ...filters, userId: v })}
              className="dark:bg-neutral-700 dark:text-white"
            >
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.username}
                </Option>
              ))}
            </Select>
            <Select
              placeholder={t("payment_status") || "Payment Status"}
              style={{ width: 150 }}
              allowClear
              onChange={(v) => setFilters({ ...filters, paid: v })}
            >
              <Option value="1">{t("paid") || "Paid"}</Option>
              <Option value="0">{t("unpaid") || "Unpaid"}</Option>
            </Select>
            <RangePicker
              onChange={setDateRange}
              className="dark:bg-neutral-700 dark:border-neutral-600"
            />
            <Button
              type="primary"
              className="bg-brand ml-auto dark:bg-green-600 dark:hover:bg-green-500 dark:text-white dark:border-none"
              onClick={fetchOrders}
            >
              {t("refresh") || "Refresh"}
            </Button>
          </div>
        </Card>

        <Card className="shadow-sm border-0 rounded-xl dark:bg-neutral-800">
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            className="dark:border-neutral-700"
            // AntD Table dark mode requires ConfigProvider usually for full styling
          />
        </Card>

        <Modal
          title={
            <span className="dark:text-neutral-100">
              {t("order_details") || "Order Details"}
            </span>
          }
          open={detailModal.open}
          onCancel={() => setDetailModal({ open: false, data: null })}
          footer={null}
          width={600}
          // Modal body dark mode styling might need global CSS override
        >
          {detailModal.data && (
            <div className="flex flex-col gap-3 dark:text-neutral-300">
              <div className="grid grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-700 p-3 rounded">
                <div>
                  <strong>{t("name") || "Name"}:</strong>{" "}
                  {detailModal.data.name}
                </div>
                <div>
                  <strong>{t("email") || "Email"}:</strong>{" "}
                  {detailModal.data.email}
                </div>
                <div>
                  <strong>{t("phone") || "Phone"}:</strong>{" "}
                  {detailModal.data.phone}
                </div>
                <div>
                  <strong>{t("address") || "Address"}:</strong>{" "}
                  {detailModal.data.address}
                </div>
              </div>
              <div>
                <strong>{t("order_notes") || "Order Notes"}:</strong>
                <p className="text-neutral-500 dark:text-neutral-400 italic">
                  {detailModal.data.order_description ||
                    t("no_notes") ||
                    "No notes"}
                </p>
              </div>
            </div>
          )}
        </Modal>
      </AdminLayout>
    </ConfigProvider>
  );
};

export default AdminOrders;
