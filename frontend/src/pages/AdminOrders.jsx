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
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";

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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
    api
      .get("/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setUsers(res.data));
    fetchOrders();
  }, [dateRange, filters]); // Re-fetch on filter change

  const updateStatus = (id, status) => {
    api
      .patch(
        `/order/${id}/status/${status}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      .then(() => {
        toast.success("Status Updated");
        fetchOrders();
      });
  };

  const togglePaid = (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    api
      .patch(
        `/order/${id}/paid/${newStatus}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      .then(() => {
        toast.success(`Marked as ${newStatus ? "Paid" : "Unpaid"}`);
        fetchOrders();
      });
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    {
      title: "Customer",
      render: (_, r) => (
        <div className="flex flex-col">
          <span className="font-semibold">{r.name}</span>
          <span className="text-xs text-gray-400">{r.phone}</span>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "created_at",
      render: (ts) => dayjs.unix(ts).format("DD MMM YYYY"),
    },
    {
      title: "Products",
      dataIndex: "products",
      width: 300,
      render: (json) => {
        try {
          const items = JSON.parse(json);
          return (
            <div className="flex flex-col gap-1">
              {items.map((i, idx) => (
                <div key={idx} className="text-xs bg-gray-100 p-1 rounded">
                  {i.product_name}{" "}
                  <span className="font-bold">x{i.quantity}</span>
                </div>
              ))}
            </div>
          );
        } catch (e) {
          return "Error parsing products";
        }
      },
    },
    {
      title: "Status",
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
          <Option value="new">New</Option>
          <Option value="processing">Processing</Option>
          <Option value="transit">In Transit</Option>
          <Option value="delivered">Delivered</Option>
        </Select>
      ),
    },
    {
      title: "Payment",
      dataIndex: "paid",
      render: (paid, record) => (
        <Tag
          icon={paid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={paid ? "success" : "error"}
          className="cursor-pointer"
          onClick={() => togglePaid(record.id, paid)}
        >
          {paid ? "PAID" : "UNPAID"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, r) => (
        <div className="flex gap-2">
          <Tooltip title="View Details">
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
                title: "Delete Order?",
                onOk: () => {
                  api
                    .delete(`/order/${r.id}`, {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                    })
                    .then(() => fetchOrders());
                },
              });
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Order History">
      <Card className="shadow-sm border-0 rounded-xl mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <Select
            placeholder="Filter by User"
            style={{ width: 200 }}
            allowClear
            onChange={(v) => setFilters({ ...filters, userId: v })}
          >
            {users.map((u) => (
              <Option key={u.id} value={u.id}>
                {u.username}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Payment Status"
            style={{ width: 150 }}
            allowClear
            onChange={(v) => setFilters({ ...filters, paid: v })}
          >
            <Option value="1">Paid</Option>
            <Option value="0">Unpaid</Option>
          </Select>
          <RangePicker onChange={setDateRange} />
          <Button
            type="primary"
            className="bg-brand ml-auto"
            onClick={fetchOrders}
          >
            Refresh
          </Button>
        </div>
      </Card>

      <Card className="shadow-sm border-0 rounded-xl">
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Order Details"
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, data: null })}
        footer={null}
      >
        {detailModal.data && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
              <div>
                <strong>Name:</strong> {detailModal.data.name}
              </div>
              <div>
                <strong>Email:</strong> {detailModal.data.email}
              </div>
              <div>
                <strong>Phone:</strong> {detailModal.data.phone}
              </div>
              <div>
                <strong>Address:</strong> {detailModal.data.address}
              </div>
            </div>
            <div>
              <strong>Order Notes:</strong>
              <p className="text-gray-500 italic">
                {detailModal.data.order_description || "No notes"}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminOrders;
