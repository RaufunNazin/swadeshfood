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
import relativeTime from "dayjs/plugin/relativeTime";
import { MdShoppingBag, MdWarning, MdMap, MdDownload } from "react-icons/md";
import { utils, writeFile } from "xlsx";
import { useLanguage } from "../contexts/LanguageContext"; // Import Language Context

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

  // Language Context
  const { t } = useLanguage();

  const fetchData = async () => {
    setLoading(true);
    const start = dates[0].startOf("day").unix();
    const end = dates[1].endOf("day").unix();

    try {
      const [statsRes, topRes, catRes, pendRes, heatRes, profitRes, geoRes] =
        await Promise.all([
          api.get(`/admin/dashboard-stats?start_date=${start}&end_date=${end}`),
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
    utils.book_append_sheet(
      wb,
      salesSheet,
      t("sales_history") || "Sales History",
    );
    utils.book_append_sheet(wb, topSheet, t("top_products") || "Top Products");
    utils.book_append_sheet(wb, categorySheet, t("categories") || "Categories");
    writeFile(wb, "Dashboard_Report.xlsx");
  };

  return (
    <AdminLayout title={t("dashboard_overview") || "Dashboard Overview"}>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {t("analytics_center") || "Analytics Center"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t("analytics_desc") ||
              "Overview of store performance and required actions."}
          </p>
        </div>
        <div className="flex gap-2">
          <RangePicker
            value={dates}
            onChange={setDates}
            className="shadow-sm border-0 py-2 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
          <Button
            icon={<MdDownload />}
            onClick={handleExport}
            className="h-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            {t("export") || "Export"}
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
              <Card
                bordered={false}
                className="shadow-sm rounded-xl h-full dark:bg-gray-800"
              >
                <Statistic
                  title={
                    <span className="dark:text-gray-300">
                      {t("revenue") || "Revenue"}
                    </span>
                  }
                  value={stats?.total_revenue}
                  precision={2}
                  prefix="৳"
                  valueStyle={{ color: "#10b981" }}
                />
                <div className="text-xs text-gray-400 mt-2">
                  {t("gross_income") || "Gross income"}
                </div>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card
                bordered={false}
                className="shadow-sm rounded-xl h-full dark:bg-gray-800"
              >
                <Statistic
                  title={
                    <span className="dark:text-gray-300">
                      {t("total_profit") || "Total Profit"}
                    </span>
                  }
                  value={profitStats?.profit}
                  precision={2}
                  prefix="৳"
                  valueStyle={{ color: "#3b82f6" }}
                />
                <div className="text-xs text-gray-400 mt-2">
                  {t("net_profit_desc") || "Revenue - Recipe Costs"}
                </div>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card
                bordered={false}
                className="shadow-sm rounded-xl h-full dark:bg-gray-800"
              >
                <Statistic
                  title={
                    <span className="dark:text-gray-300">
                      {t("profit_margin") || "Profit Margin"}
                    </span>
                  }
                  value={
                    profitStats?.revenue
                      ? (profitStats.profit / profitStats.revenue) * 100
                      : 0
                  }
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: "#3b82f6" }} // Ensuring visible color
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
                  trailColor="#e5e7eb" // Default trail color, works in dark mode too mostly
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card
                bordered={false}
                className="shadow-sm rounded-xl h-full dark:bg-gray-800"
              >
                <Statistic
                  title={
                    <span className="dark:text-gray-300">
                      {t("orders") || "Orders"}
                    </span>
                  }
                  value={stats?.total_orders}
                  prefix={
                    <MdShoppingBag className="text-gray-600 dark:text-gray-400" />
                  } // Icon color adjusted
                  valueStyle={{ color: "#374151" }} // Default text color override might be needed for dark mode if AntD config isn't global
                  // For dark mode specifically, AntD requires ConfigProvider. Assuming manual overrides:
                  // valueStyle={{ color: theme === 'dark' ? '#f3f4f6' : '#374151' }} - would need theme context
                />
                <div className="text-xs text-gray-400 mt-2">
                  {t("total_processed") || "Total processed"}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Row 2: Sales Graph & Pending Actions */}
          <Row gutter={[16, 16]} align="stretch">
            <Col xs={24} lg={16}>
              <Card
                title={
                  <span className="dark:text-white">
                    {t("revenue_trends") || "Revenue Trends"}
                  </span>
                }
                bordered={false}
                className="shadow-sm rounded-xl h-full dark:bg-gray-800"
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
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#374151"
                      />
                      <XAxis dataKey="date" hide />
                      <YAxis stroke="#9ca3af" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          borderColor: "#374151",
                          color: "#f3f4f6",
                        }}
                        itemStyle={{ color: "#f3f4f6" }}
                      />
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
                    <MdWarning /> {t("pending_actions") || "Pending Actions"}
                  </div>
                }
                bordered={false}
                className="shadow-sm rounded-xl h-full dark:bg-gray-800"
                styles={{ body: { padding: 0 } }}
              >
                <div className="overflow-y-auto max-h-[300px]">
                  <List
                    dataSource={pendingOrders}
                    renderItem={(item) => (
                      <List.Item className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer">
                        <div className="flex justify-between w-full">
                          <div>
                            <div className="font-medium text-gray-700 dark:text-gray-200">
                              {t("order") || "Order"} #{item.id}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
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
                      {t("all_caught_up") || "All caught up!"}
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
                title={
                  <span className="dark:text-white">
                    {t("top_selling_products") || "Top Selling Products"}
                  </span>
                }
                bordered={false}
                className="shadow-sm rounded-xl h-full dark:bg-gray-800"
              >
                <Table
                  dataSource={topSelling}
                  rowKey="name"
                  pagination={false}
                  columns={[
                    {
                      title: t("product") || "Product",
                      dataIndex: "name",
                      className: "dark:text-gray-300",
                    },
                    {
                      title: t("category") || "Category",
                      dataIndex: "category",
                      render: (c) => <Tag>{c}</Tag>,
                    },
                    {
                      title: t("sold") || "Sold",
                      dataIndex: "value",
                      align: "right",
                      render: (v) => <b className="dark:text-gray-300">{v}</b>,
                    },
                  ]}
                  className="dark:bg-gray-800"
                  // Note: AntD Table inner styles for dark mode might need global ConfigProvider or CSS overrides for rows/cells
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title={
                  <span className="dark:text-white">
                    {t("sales_by_category") || "Sales by Category"}
                  </span>
                }
                bordered={false}
                className="shadow-sm rounded-xl h-full dark:bg-gray-800"
              >
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
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          borderColor: "#374151",
                          color: "#f3f4f6",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#9ca3af" }} />
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
                title={
                  <span className="dark:text-white">
                    {t("peak_order_times") || "Peak Order Times"}
                  </span>
                }
                bordered={false}
                className="shadow-sm rounded-xl h-full dark:bg-gray-800"
              >
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={heatmap}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#374151"
                      />
                      <XAxis dataKey="time" stroke="#9ca3af" />
                      <YAxis allowDecimals={false} stroke="#9ca3af" />
                      <RechartsTooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          borderColor: "#374151",
                          color: "#f3f4f6",
                        }}
                      />
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
                  <div className="flex items-center gap-2 dark:text-white">
                    <MdMap />{" "}
                    {t("regional_distribution") || "Regional Distribution"}
                  </div>
                }
                bordered={false}
                className="shadow-sm rounded-xl h-full dark:bg-gray-800"
              >
                <List
                  dataSource={geoData}
                  renderItem={(item) => (
                    <List.Item className="px-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between w-full dark:text-gray-300">
                        <span>{item.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
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
