/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
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
  Progress,
  Button,
} from "antd";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; // Import the plugin
import { MdShoppingBag, MdWarning, MdMap, MdDownload } from "react-icons/md";
import { utils, writeFile } from "xlsx";

// 1. EXTEND DAYJS WITH THE PLUGIN
dayjs.extend(relativeTime);

const { RangePicker } = DatePicker;
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const [topSelling, setTopSelling] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [profitStats, setProfitStats] = useState(null);
  const [geoData, setGeoData] = useState([]);

  const [dates, setDates] = useState([dayjs().subtract(30, "day"), dayjs()]);

  const fetchData = async () => {
    setLoading(true);
    const start = dates[0].startOf("day").unix();
    const end = dates[1].endOf("day").unix();

    try {
      const [statsRes, topRes, catRes, pendRes, heatRes, profitRes, geoRes] =
        await Promise.all([
          api.get(
            `/admin/dashboard-stats?start_date=${start}&end_date=${end}`
          ),
          api.get(`/admin/top-selling`),
          api.get(`/admin/category-sales`),
          api.get(`/admin/pending-actions`),
          api.get(`/admin/order-heatmap`),
          api.get(`/admin/profit-stats?start_date=${start}&end_date=${end}`),
          api.get(`/admin/geo-distribution`),
        ]);

      setStats(statsRes.data);
      setTopSelling(topRes.data);
      setCategorySales(catRes.data);
      setPendingOrders(pendRes.data);
      setHeatmap(heatRes.data);
      setProfitStats(profitRes.data);
      setGeoData(geoRes.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dates]);

  const handleExport = () => {
    if (!stats) return;
    const wb = utils.book_new();
    const salesSheet = utils.json_to_sheet(stats.sales_graph);
    const topSheet = utils.json_to_sheet(topSelling);
    const categorySheet = utils.json_to_sheet(categorySales);
    utils.book_append_sheet(wb, salesSheet, "Sales History");
    utils.book_append_sheet(wb, topSheet, "Top Products");
    utils.book_append_sheet(wb, categorySheet, "Categories");
    writeFile(wb, "Dashboard_Report.xlsx");
  };

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Analytics Center</h2>
          <p className="text-gray-500 text-sm">
            Overview of store performance and required actions.
          </p>
        </div>
        <div className="flex gap-2">
          <RangePicker
            value={dates}
            onChange={setDates}
            className="shadow-sm border-0 py-2 rounded-lg"
          />
          <Button
            icon={<MdDownload />}
            onClick={handleExport}
            className="h-full"
          >
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <div className="space-y-6 pb-10">
          {/* Row 1: Key Metrics */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card bordered={false} className="shadow-sm rounded-xl h-full">
                <Statistic
                  title="Revenue"
                  value={stats?.total_revenue}
                  precision={2}
                  prefix="৳"
                  valueStyle={{ color: "#10b981" }}
                />
                <div className="text-xs text-gray-400 mt-2">Gross income</div>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} className="shadow-sm rounded-xl h-full">
                <Statistic
                  title="Total Profit"
                  value={profitStats?.profit}
                  precision={2}
                  prefix="৳"
                  valueStyle={{ color: "#3b82f6" }}
                />
                <div className="text-xs text-gray-400 mt-2">
                  Revenue - Recipe Costs
                </div>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} className="shadow-sm rounded-xl h-full">
                <Statistic
                  title="Profit Margin"
                  value={
                    profitStats?.revenue
                      ? (profitStats.profit / profitStats.revenue) * 100
                      : 0
                  }
                  precision={1}
                  suffix="%"
                />
                <Progress
                  percent={
                    profitStats?.revenue
                      ? Math.round(
                          (profitStats.profit / profitStats.revenue) * 100,
                        )
                      : 0
                  }
                  showInfo={false}
                  strokeColor="#3b82f6"
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} className="shadow-sm rounded-xl h-full">
                <Statistic
                  title="Orders"
                  value={stats?.total_orders}
                  prefix={<MdShoppingBag />}
                />
                <div className="text-xs text-gray-400 mt-2">
                  Total processed
                </div>
              </Card>
            </Col>
          </Row>

          {/* Row 2: Sales Graph & Pending Actions */}
          <Row gutter={[16, 16]} align="stretch">
            <Col xs={24} lg={16}>
              <Card
                title="Revenue Trends"
                bordered={false}
                className="shadow-sm rounded-xl h-full"
              >
                {/* Fixed height to prevent Recharts collapse */}
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
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
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis />
                      <RechartsTooltip />
                      <Area
                        type="monotone"
                        dataKey="total_revenue"
                        stroke="#10b981"
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card
                title={
                  <div className="flex items-center gap-2 text-orange-500">
                    <MdWarning /> Pending Actions
                  </div>
                }
                bordered={false}
                className="shadow-sm rounded-xl h-full"
                styles={{ body: { padding: 0 } }} // Updated from bodyStyle
              >
                <div className="overflow-y-auto max-h-[300px]">
                  <List
                    dataSource={pendingOrders}
                    renderItem={(item) => (
                      <List.Item className="px-4 py-3 border-b hover:bg-orange-50 cursor-pointer">
                        <div className="flex justify-between w-full">
                          <div>
                            <div className="font-medium text-gray-700">
                              Order #{item.id}
                            </div>
                            {/* Fixed: .fromNow() needs plugin */}
                            <div className="text-xs text-gray-500">
                              {item.name} •{" "}
                              {dayjs.unix(item.created_at).fromNow()}
                            </div>
                          </div>
                          <Tag
                            color={item.status === "new" ? "blue" : "orange"}
                          >
                            {item.status.toUpperCase()}
                          </Tag>
                        </div>
                      </List.Item>
                    )}
                  />
                  {pendingOrders.length === 0 && (
                    <div className="p-4 text-center text-gray-400">
                      All caught up!
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Row 3: Top Products & Categories */}
          <Row gutter={[16, 16]} align="stretch">
            <Col xs={24} md={12}>
              <Card
                title="Top Selling Products"
                bordered={false}
                className="shadow-sm rounded-xl h-full"
              >
                <Table
                  dataSource={topSelling}
                  rowKey="name"
                  pagination={false}
                  columns={[
                    { title: "Product", dataIndex: "name" },
                    {
                      title: "Category",
                      dataIndex: "category",
                      render: (c) => <Tag>{c}</Tag>,
                    },
                    {
                      title: "Sold",
                      dataIndex: "value",
                      align: "right",
                      render: (v) => <b>{v}</b>,
                    },
                  ]}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="Sales by Category"
                bordered={false}
                className="shadow-sm rounded-xl h-full"
              >
                {/* Fixed height for Recharts */}
                <div
                  style={{ width: "100%", height: 300 }}
                  className="flex items-center justify-center"
                >
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={categorySales}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categorySales.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => `৳${value.toFixed(2)}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Row 4: Heatmap & Geography */}
          <Row gutter={[16, 16]} align="stretch">
            <Col xs={24} md={12}>
              <Card
                title="Peak Order Times"
                bordered={false}
                className="shadow-sm rounded-xl h-full"
              >
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={heatmap}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="time" />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip cursor={{ fill: "transparent" }} />
                      <Bar
                        dataKey="orders"
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <MdMap /> Regional Distribution
                  </div>
                }
                bordered={false}
                className="shadow-sm rounded-xl h-full"
              >
                <List
                  dataSource={geoData}
                  renderItem={(item) => (
                    <List.Item className="px-4">
                      <div className="flex justify-between w-full">
                        <span>{item.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full"
                              style={{
                                width: `${Math.min(item.value * 10, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold w-6">
                            {item.value}
                          </span>
                        </div>
                      </div>
                    </List.Item>
                  )}
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
