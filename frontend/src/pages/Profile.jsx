import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Notification from "../components/Notification";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import { Modal, Table, Tag, Descriptions, Button, Input } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PoweroffOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getOrders = (id) => {
    api
      .get(`/order/user/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setOrders(res.data.reverse());
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");

    api
      .get("/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        getOrders(res.data.id);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  // --- Actions ---
  const cancelOrder = () => {
    api
      .delete(`/order/${selectedOrderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Order cancelled successfully");
          getOrders(user.id);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setOpenCancelModal(false));
  };

  const changePassword = () => {
    const { old, new: newPass, confirm } = passwords;
    if (!old || !newPass || !confirm) {
      toast.error("Please fill all fields");
      return;
    }
    if (newPass !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    api
      .put(
        "/password",
        { old_password: old, new_password: newPass },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      .then(() => {
        toast.success("Password updated!");
        setPasswords({ old: "", new: "", confirm: "" });
        setOpenPasswordModal(false);
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to update"),
      );
  };

  // --- Table Columns ---
  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <span className="font-mono text-gray-500">#{id}</span>,
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (ts) => (
        <span className="text-gray-600">
          {new Date(ts * 1000).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Status",
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
      title: "Payment",
      dataIndex: "paid",
      key: "paid",
      render: (paid) => (
        <Tag color={paid ? "success" : "error"}>{paid ? "PAID" : "UNPAID"}</Tag>
      ),
    },
    {
      title: "Details",
      key: "details",
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => {
            setCustomerDetails({
              name: record.name,
              phone: record.phone,
              address: record.address,
              products: JSON.parse(record.products),
            });
            setOpenCustomerModal(true);
          }}
        >
          View
        </Button>
      ),
    },
    {
      title: "Action",
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
            Cancel
          </Button>
        ),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      <Notification />

      {/* --- Header --- */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl font-bold border-4 border-white shadow-lg">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.username}
              </h1>
              <p className="text-gray-500 flex items-center gap-2">
                <MailOutlined /> {user.email}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              icon={<LockOutlined />}
              onClick={() => setOpenPasswordModal(true)}
            >
              Change Password
            </Button>
            <Button danger icon={<PoweroffOutlined />} onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* --- Orders Section --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
            <ShoppingOutlined className="text-xl text-green-600" />
            <h2 className="text-lg font-bold text-gray-900">Order History</h2>
          </div>

          <div className="p-6">
            <Table
              dataSource={orders}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
              scroll={{ x: 600 }}
            />
          </div>
        </div>
      </div>

      <Footer />

      {/* --- Order Details Modal --- */}
      <Modal
        title="Order Details"
        open={openCustomerModal}
        onCancel={() => setOpenCustomerModal(false)}
        footer={null}
        width={600}
      >
        <Descriptions bordered column={1} size="small" className="mt-4">
          <Descriptions.Item label="Recipient">
            {customerDetails.name}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {customerDetails.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {customerDetails.address}
          </Descriptions.Item>
        </Descriptions>

        <div className="mt-6">
          <h4 className="font-bold mb-2 text-gray-700">Items Ordered:</h4>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            {customerDetails.products?.map((p, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{p.product_name}</span>
                <span className="font-semibold">x{p.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* --- Cancel Modal --- */}
      <Modal
        title="Cancel Order"
        open={openCancelModal}
        onOk={cancelOrder}
        okText="Yes, Cancel Order"
        okButtonProps={{ danger: true }}
        onCancel={() => setOpenCancelModal(false)}
      >
        <p>
          Are you sure you want to cancel this order? This action cannot be
          undone.
        </p>
      </Modal>

      {/* --- Change Password Modal --- */}
      <Modal
        title="Change Password"
        open={openPasswordModal}
        onOk={changePassword}
        okText="Update Password"
        onCancel={() => setOpenPasswordModal(false)}
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <Input.Password
              value={passwords.old}
              onChange={(e) =>
                setPasswords({ ...passwords, old: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <Input.Password
              value={passwords.new}
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <Input.Password
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
