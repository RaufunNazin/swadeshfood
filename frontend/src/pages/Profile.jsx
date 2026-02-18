import Footer from "../components/Footer";
import "react-toastify/dist/ReactToastify.css";
import Notification from "../components/Notification";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import {
  Modal,
  Table,
  Tag,
  Descriptions,
  Button,
  Input,
  ConfigProvider,
  theme as antdTheme,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  PoweroffOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useLanguage } from "../contexts/LanguageContext"; // Import Language Context
import { useTheme } from "../contexts/ThemeContext";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Language Context
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Modal States
  const [customerDetails, setCustomerDetails] = useState({});
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");

  // Password Form State
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });

  // --- Auth & Data Fetching ---
  const logout = () => {
    // Call the backend to delete the cookie
    api.post("/logout").finally(() => {
      // Clear local state
      localStorage.removeItem("user");
      // Do NOT remove "token" because it's not there anymore
      navigate("/login");
    });
  };

  const getOrders = (id) => {
    api
      .get(`/order/user/${id}`)
      .then((res) => {
        setOrders(res.data.reverse());
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    api
      .get("/me")
      .then((res) => {
        setUser(res.data);
        getOrders(res.data.id);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  // --- Actions ---
  const cancelOrder = () => {
    api
      .delete(`/order/${selectedOrderId}`)
      .then((res) => {
        if (res.status === 200) {
          toast.success(t("order_cancelled") || "Order cancelled successfully");
          getOrders(user.id);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setOpenCancelModal(false));
  };

  const changePassword = () => {
    const { old, new: newPass, confirm } = passwords;
    if (!old || !newPass || !confirm) {
      toast.error(t("fill_required") || "Please fill all fields");
      return;
    }
    if (newPass !== confirm) {
      toast.error(t("passwords_mismatch") || "Passwords do not match");
      return;
    }

    api
      .put("/password", { old_password: old, new_password: newPass })
      .then(() => {
        toast.success(t("password_updated") || "Password updated!");
        setPasswords({ old: "", new: "", confirm: "" });
        setOpenPasswordModal(false);
      })
      .catch((err) =>
        toast.error(
          err.response?.data?.message ||
            t("update_failed") ||
            "Failed to update",
        ),
      );
  };

  // --- Table Columns ---
  const columns = [
    {
      title: t("order_id") || "Order ID",
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <span className="font-mono text-neutral-500 dark:text-neutral-400">
          #{id}
        </span>
      ),
    },
    {
      title: t("date") || "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (ts) => (
        <span className="text-neutral-600 dark:text-neutral-300">
          {new Date(ts * 1000).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: t("status") || "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "new") color = "blue";
        if (status === "processing") color = "gold";
        if (status === "delivered") color = "green";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: t("payment") || "Payment",
      dataIndex: "paid",
      key: "paid",
      render: (paid) => (
        <Tag color={paid ? "success" : "error"}>{paid ? "PAID" : "UNPAID"}</Tag>
      ),
    },
    {
      title: t("details") || "Details",
      key: "details",
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => {
            setCustomerDetails({
              name: record.name,
              phone: record.phone,
              address: record.address,
              products: record.products,
            });
            setOpenCustomerModal(true);
          }}
        >
          {t("view") || "View"}
        </Button>
      ),
    },
    {
      title: t("action") || "Action",
      key: "action",
      render: (_, record) =>
        record.status === "new" && (
          <Button
            danger
            size="small"
            onClick={() => {
              setSelectedOrderId(record.id);
              setOpenCancelModal(true);
            }}
          >
            {t("cancel") || "Cancel"}
          </Button>
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
      <div className="bg-neutral-50 dark:bg-neutral-900 min-h-screen font-sans text-neutral-800 dark:text-neutral-200 transition-colors duration-300">
        <Notification />

        {/* --- Header --- */}
        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-3xl font-bold border-4 border-white dark:border-neutral-700 shadow-lg">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                  {user.username}
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 flex items-center justify-center md:justify-start gap-2">
                  <MailOutlined /> {user.email}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                icon={<LockOutlined />}
                onClick={() => setOpenPasswordModal(true)}
                className="dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
              >
                {t("change_password") || "Change Password"}
              </Button>
              <Button danger icon={<PoweroffOutlined />} onClick={logout}>
                {t("logout") || "Logout"}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* --- Orders Section --- */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 overflow-hidden transition-colors duration-300">
            <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-700 flex items-center gap-2">
              <ShoppingOutlined className="text-xl text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {t("order_history") || "Order History"}
              </h2>
            </div>

            <div className="p-6">
              <Table
                dataSource={orders}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 5 }}
                scroll={{ x: 600 }}
                className="dark:border-neutral-700"
                // Note: For full dark mode on AntD tables, global ConfigProvider or CSS overrides are best.
              />
            </div>
          </div>
        </div>

        <Footer />

        {/* --- Order Details Modal --- */}
        <Modal
          title={
            <span className="dark:text-white">
              {t("order_details") || "Order Details"}
            </span>
          }
          open={openCustomerModal}
          onCancel={() => setOpenCustomerModal(false)}
          footer={null}
          width={600}
          // Modal styling for dark mode usually requires global overrides
        >
          <Descriptions bordered column={1} size="small" className="mt-4">
            <Descriptions.Item label={t("recipient") || "Recipient"}>
              <span className="dark:text-neutral-300">
                {customerDetails.name}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label={t("phone") || "Phone"}>
              <span className="dark:text-neutral-300">
                {customerDetails.phone}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label={t("address") || "Address"}>
              <span className="dark:text-neutral-300">
                {customerDetails.address}
              </span>
            </Descriptions.Item>
          </Descriptions>

          <div className="mt-6">
            <h4 className="font-bold mb-2 text-neutral-700 dark:text-neutral-200">
              {t("items_ordered") || "Items Ordered"}:
            </h4>
            <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-3 space-y-2">
              {customerDetails.products?.map((p, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm dark:text-neutral-300"
                >
                  <span>{p.product_name || p.name}</span>
                  <span className="font-semibold">x{p.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>

        {/* --- Cancel Modal --- */}
        <Modal
          title={t("cancel_order") || "Cancel Order"}
          open={openCancelModal}
          onOk={cancelOrder}
          okText={t("yes_cancel") || "Yes, Cancel Order"}
          okButtonProps={{ danger: true }}
          onCancel={() => setOpenCancelModal(false)}
        >
          <p className="dark:text-neutral-300">
            {t("cancel_confirm_msg") ||
              "Are you sure you want to cancel this order? This action cannot be undone."}
          </p>
        </Modal>

        {/* --- Change Password Modal --- */}
        <Modal
          title={
            <span className="dark:text-white">
              {t("change_password") || "Change Password"}
            </span>
          }
          open={openPasswordModal}
          onOk={changePassword}
          okText={t("update_password") || "Update Password"}
          onCancel={() => setOpenPasswordModal(false)}
          okButtonProps={{
            className:
              "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500",
          }}
        >
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t("current_password") || "Current Password"}
              </label>
              <Input.Password
                value={passwords.old}
                onChange={(e) =>
                  setPasswords({ ...passwords, old: e.target.value })
                }
                className="dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t("new_password") || "New Password"}
              </label>
              <Input.Password
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                className="dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t("confirm_password") || "Confirm New Password"}
              </label>
              <Input.Password
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                className="dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
              />
            </div>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Profile;
