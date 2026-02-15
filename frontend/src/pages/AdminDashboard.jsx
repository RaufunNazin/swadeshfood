import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api";
import {
  Card,
  Statistic,
  DatePicker,
  Row,
  Col,
  Spin,
  Table,
  Tag,
  List,
  Avatar,
} from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import dayjs from "dayjs";
import {
  MdAttachMoney,
  MdShoppingBag,
  MdTrendingUp,
  MdWarning,
  MdAccessTime,
} from "react-icons/md";

const { RangePicker } = DatePicker;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dates, setDates] = useState([dayjs().subtract(30, "day"), dayjs()]);

  const fetchData = async () => {
    setLoading(true);
    const start = dates[0].startOf("day").unix();
    const end = dates[1].endOf("day").unix();

    try {
      // 1. Fetch Stats & Graph Data
      const statsRes = await api.get(
        `/admin/dashboard-stats?start_date=${start}&end_date=${end}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setStats(statsRes.data);

      // 2. Fetch Recent Orders (Reusing existing endpoint)
      const ordersRes = await api.get("/order", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Take top 5 recent orders
      setRecentOrders(ordersRes.data.reverse().slice(0, 5));

      // 3. Fetch Products for Low Stock Alert
      const productsRes = await api.get("/products/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Filter items with less than 10 stock
      const lowStock = productsRes.data.filter((p) => p.stock < 10);
      setLowStockProducts(lowStock.slice(0, 5)); // Show max 5
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dates]);

  // -- Component Helpers --
  const StatCard = ({ title, value, prefix, color, subtext }) => (
    <Card
      bordered={false}
      className="shadow-sm rounded-xl h-full overflow-hidden relative"
    >
      <div
        className={`absolute top-0 right-0 p-4 opacity-10 text-6xl ${color}`}
      >
        {prefix}
      </div>
      <Statistic
        title={
          <span className="text-gray-500 font-medium text-sm uppercase tracking-wider">
            {title}
          </span>
        }
        value={value}
        precision={title.includes("Revenue") ? 2 : 0}
        valueStyle={{ fontWeight: 700, fontSize: "2rem" }}
        prefix={<span className={`${color} mr-2`}>{prefix}</span>}
      />
      <div className="mt-2 text-xs text-gray-400">{subtext}</div>
    </Card>
  );

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Welcome back, Admin
          </h2>
          <p className="text-gray-500 text-sm">
            Here's what's happening with your store today.
          </p>
        </div>
        <RangePicker
          value={dates}
          onChange={(values) => setDates(values)}
          className="shadow-sm border-0 py-2 rounded-lg"
        />
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Stats Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <StatCard
                title="Total Revenue"
                value={stats?.total_revenue}
                prefix={<MdAttachMoney />}
                color="text-emerald-500"
                subtext="Total earnings in selected period"
              />
            </Col>
            <Col xs={24} md={8}>
              <StatCard
                title="Orders Placed"
                value={stats?.total_orders}
                prefix={<MdShoppingBag />}
                color="text-blue-500"
                subtext="Total orders processed"
              />
            </Col>
            <Col xs={24} md={8}>
              <StatCard
                title="Products Sold"
                value={stats?.sold_products_count || 0}
                prefix={<MdTrendingUp />}
                color="text-purple-500"
                subtext="Total units moving out"
              />
            </Col>
          </Row>

          {/* Charts & Activity Row */}
          <Row gutter={[16, 16]}>
            {/* Main Chart Area */}
            <Col xs={24} lg={16}>
              <Card
                title="Sales Trends"
                bordered={false}
                className="shadow-sm rounded-xl h-full"
              >
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.sales_graph}>
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f0f0f0"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        prefix="$"
                      />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                        cursor={{ stroke: "#10b981", strokeWidth: 1 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total_revenue"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Revenue"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>

            {/* Right Column: Low Stock Alerts */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <MdWarning className="text-amber-500" /> Low Stock Alerts
                  </div>
                }
                bordered={false}
                className="shadow-sm rounded-xl h-full"
                bodyStyle={{ padding: 0 }}
              >
                {lowStockProducts.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={lowStockProducts}
                    renderItem={(item) => (
                      <List.Item className="px-6 py-3 hover:bg-gray-50 transition-colors">
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              src={item.image1}
                              shape="square"
                              size="large"
                            />
                          }
                          title={
                            <span className="font-medium text-gray-700">
                              {item.name}
                            </span>
                          }
                          description={
                            <span className="text-red-500 font-semibold text-xs">
                              {item.stock} items left
                            </span>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    Inventory looks healthy!
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* Bottom Row: Recent Orders Table */}
          <Row>
            <Col span={24}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <MdAccessTime className="text-blue-500" /> Recent Orders
                  </div>
                }
                bordered={false}
                className="shadow-sm rounded-xl"
              >
                <Table
                  dataSource={recentOrders}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    {
                      title: "ID",
                      dataIndex: "id",
                      width: 80,
                      render: (id) => (
                        <span className="text-gray-400">#{id}</span>
                      ),
                    },
                    {
                      title: "Customer",
                      dataIndex: "name",
                      className: "font-medium",
                    },
                    {
                      title: "Date",
                      dataIndex: "created_at",
                      render: (ts) => dayjs.unix(ts).format("DD MMM YYYY"),
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      render: (s) => {
                        const color =
                          s === "delivered"
                            ? "green"
                            : s === "new"
                              ? "blue"
                              : "orange";
                        return <Tag color={color}>{s.toUpperCase()}</Tag>;
                      },
                    },
                    {
                      title: "Amount",
                      key: "amount",
                      align: "right",
                      render: (_, r) => {
                        // Quick calc for display since backend doesn't send total yet
                        try {
                          const items = JSON.parse(r.products);
                          // This is visual approximation, ideal is backend total
                          return (
                            <span className="font-mono">
                              {items.length} Items
                            </span>
                          );
                        } catch (e) {
                          return "--";
                        }
                      },
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
