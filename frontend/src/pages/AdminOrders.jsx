import React, { useEffect, useState } from "react";
import SidePanel from "../components/SidePanel";
import api from "../api";
import { Col, Modal, Select, Table } from "antd";
import Column from "antd/es/table/Column";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [Customer, setCustomer] = useState({});
  const [openCustomer, setOpenCustomer] = useState(false);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [openDelete, setOpenDelete] = useState(false);
  const [paid, setPaid] = useState("");
  const [status, setStatus] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const statuses = {
    new: "New",
    processing: "Processing",
    transit: "In Transit",
    delivered: "Delivered",
  };

  const statusColor = {
    new: "text-blue-500",
    processing: "text-yellow-500",
    transit: "text-orange-500",
    delivered: "text-green-500",
  };

  const deleteOrder = () => {
    api
      .delete(`/order/${selectedUserId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Order deleted successfully");
          userId !== "" || paid !== "" || status !== ""
            ? filterData()
            : getOrders();
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setOpenDelete(false);
      });
  };

  const filterData = () => {
    api
      .get(
        `/order${userId !== "" ? `/user/${userId}` : ""}${
          paid !== "" ? `/paid/${paid}` : ""
        }${status !== "" ? `/status/${status}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        setOrders(res.data?.reverse());
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getUsers = () => {
    api
      .get("/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setUsers(res.data?.reverse());
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getOrders = () => {
    api
      .get("/order", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setOrders(res.data?.reverse());
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getOrders();
    getUsers();
  }, []);

  return (
    <div className="flex flex-1">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        draggable={true}
        pauseOnHover={false}
        theme="colored"
      />
      <SidePanel />
      <div className="flex flex-col flex-1">
        <div className="w-full p-2 lg:p-10">
          <h1 className="text-2xl font-semibold text-gray-800 mb-5">Orders</h1>
          <div className="flex justify-end">
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-wrap gap-3">
                <Select
                  defaultValue="All Users"
                  onChange={setUserId}
                  value={userId}
                  className="w-full md:w-[150px]"
                  options={
                    users.length > 0
                      ? [
                          {
                            label: "All Users",
                            value: "",
                          },
                          ...users.map((user) => ({
                            label: user.name,
                            value: user.id,
                          })),
                        ]
                      : [{ label: "All Users", value: "" }]
                  }
                />
                <Select
                  defaultValue="All Payment Types"
                  value={paid}
                  onChange={setPaid}
                  className="w-full md:w-[150px]"
                  options={[
                    {
                      label: "All Payment Types",
                      value: "",
                    },
                    {
                      label: "Paid",
                      value: 1,
                    },
                    {
                      label: "Unpaid",
                      value: 0,
                    },
                  ]}
                />
                <Select
                  defaultValue="All Statuses"
                  value={status}
                  onChange={setStatus}
                  className="w-full md:w-[150px]"
                  options={[
                    {
                      label: "All Statuses",
                      value: "",
                    },
                    {
                      label: "New",
                      value: "new",
                    },
                    {
                      label: "Processing",
                      value: "processing",
                    },
                    {
                      label: "In Transit",
                      value: "transit",
                    },
                    {
                      label: "Delivered",
                      value: "delivered",
                    },
                  ]}
                />
              </div>
              <div className="flex flex-row-reverse md:flex-row flex-1 gap-3">
                <button
                  className="w-full md:w-fit px-3 py-1 bg-blue-500 text-white rounded-md"
                  onClick={filterData}
                >
                  Filter
                </button>
                {(userId !== "" || paid !== "" || status !== "") && (
                  <button
                    className="w-full md:w-fit px-3 py-1 border border-red-600 text-red-600 rounded-md"
                    onClick={() => {
                      setUserId("");
                      setPaid("");
                      setStatus("");
                      getOrders();
                    }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 w-72 md:w-full overflow-x-auto">
            <Table
              dataSource={orders}
              loading={loading}
              rowKey="id"
              style={{ overflowX: "auto" }}
              pagination={{
                defaultPageSize: 20,
                showSizeChanger: true,
                pageSizeOptions: ["20", "50", "100"],
              }}
            >
              <Column title="ID" dataIndex="id" key="id" />
              <Column title="Ordered By" dataIndex="user_id" key="user_id" />
              <Column
                title="Customer Details"
                dataIndex="details"
                key="details"
                render={(details, record) => (
                  <div>
                    <button
                      className="px-2 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition duration-200 ease-in-out"
                      onClick={() => {
                        setCustomer({
                          name: record.name,
                          phone: record.phone,
                          email: record.email,
                          address: record.address,
                          description: record.order_description,
                        });
                        setOpenCustomer(true);
                      }}
                    >
                      {record.name || "View Details"}
                    </button>
                  </div>
                )}
              />
              <Column
                title="Products (ID, Name, Quantity)"
                dataIndex="products"
                key="products"
                render={(products) => (
                  <ul>
                    {JSON.parse(products).map((product) => (
                      <li key={product.id}>
                        {product.product}, {product.product_name},{" "}
                        {product.quantity}
                      </li>
                    ))}
                  </ul>
                )}
              />
              <Column
                title="Status"
                dataIndex="status"
                key="status"
                render={(status, record) => (
                  <div className={`${statusColor[status]}`}>
                    <Select
                      defaultValue={
                        statuses[status].charAt(0).toUpperCase() +
                        statuses[status].slice(1)
                      }
                      variant="borderless"
                      value={status}
                      className={`${statusColor[status]} w-full`}
                      onChange={(value) => {
                        api
                          .patch(
                            `/order/${record.id}/status/${value}`,
                            {},
                            {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                  "token"
                                )}`,
                              },
                            }
                          )
                          .then((res) => {
                            if (res.status === 200) {
                              toast.success("Status updated successfully");
                              userId !== "" || paid !== "" || status !== ""
                                ? filterData()
                                : getOrders();
                            }
                          })
                          .catch((err) => {
                            console.log(err);
                          });
                      }}
                      options={Object.keys(statuses).map((key) => ({
                        label: (
                          <span className={statusColor[key]}>
                            {statuses[key].charAt(0).toUpperCase() +
                              statuses[key].slice(1)}
                          </span>
                        ),
                        value: key,
                      }))}
                    />
                  </div>
                )}
              />
              <Column
                title="Paid"
                dataIndex="paid"
                key="paid"
                render={(paid) => (
                  <div
                    className={`${paid ? "text-green-500" : "text-red-500"}`}
                  >
                    {paid ? "Yes" : "No"}
                  </div>
                )}
              />
              <Column
                title="Method"
                dataIndex="method"
                key="method"
                render={(method) => (
                  <div>
                    {method === 1 ? "Cash on Delivery" : "Digital Payment"}
                  </div>
                )}
              />
              <Column
                title="Created At"
                dataIndex="created_at"
                key="created_at"
                render={(created_at) => (
                  <div>{new Date(created_at * 1000).toLocaleString()}</div>
                )}
              />
              <Column
                title="Actions"
                key="actions"
                render={(action, record) => (
                  <div className="flex gap-3">
                    {record.paid === 0 ? (
                      <button
                        onClick={() => {
                          api
                            .patch(
                              `/order/${record.id}/paid/1`,
                              {},
                              {
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                  )}`,
                                },
                              }
                            )
                            .then((res) => {
                              if (res.status === 200) {
                                toast.success("Order marked as Paid");
                                userId !== "" || paid !== "" || status !== ""
                                  ? filterData()
                                  : getOrders();
                              }
                            })
                            .catch((err) => {
                              console.log(err);
                            });
                        }}
                        className="px-3 py-1 border border-green-500 text-green-500 rounded-md hover:bg-green-500 hover:text-white transition-all duration-200"
                      >
                        Mark as Paid
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          api
                            .patch(
                              `/order/${record.id}/paid/0`,
                              {},
                              {
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                  )}`,
                                },
                              }
                            )
                            .then((res) => {
                              if (res.status === 200) {
                                toast.success("Order marked as Unpaid");
                                userId !== "" || paid !== "" || status !== ""
                                  ? filterData()
                                  : getOrders();
                              }
                            })
                            .catch((err) => {
                              console.log(err);
                            });
                        }}
                        className="px-3 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all duration-200"
                      >
                        Mark as Unpaid
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setOpenDelete(true);
                        setSelectedUserId(record.id);
                      }}
                      className="px-3 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all duration-200"
                    >
                      Delete Order
                    </button>
                  </div>
                )}
              />
            </Table>
          </div>
        </div>
      </div>
      <Modal
        title="Customer Details"
        open={openCustomer}
        onCancel={() => {
          setOpenCustomer(false);
        }}
        okButtonProps={{ style: { display: "none" } }}
        centered
      >
        <div className="grid grid-cols-3 gap-5">
          {Object.keys(Customer).map((key) => (
            <div
              key={key}
              className={`${
                key === "description" && "col-span-2"
              } flex flex-col gap-1`}
            >
              <div>
                <strong>{key}</strong>
              </div>
              <div>{Customer[key] || "N/A"}</div>
            </div>
          ))}
        </div>
      </Modal>
      <Modal
        title="Delete Order"
        open={openDelete}
        onOk={deleteOrder}
        okText="Delete"
        onCancel={() => setOpenDelete(false)}
        centered
      >
        <div className="mx-2 my-4">
          Are you sure you want to delete this order ?
        </div>
      </Modal>
    </div>
  );
};

export default AdminOrders;
