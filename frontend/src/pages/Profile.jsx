import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Notification from "../components/Notification";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import { Modal, Select, Table } from "antd";
import Column from "antd/es/table/Column";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [Customer, setCustomer] = useState({});
  const [openCustomer, setOpenCustomer] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [openChangePassword, setOpenChangePassword] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const cancelOrder = () => {
    api
      .delete(`/order/${selectedUserId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Order cancelled successfully");
          getOrders(user.id);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setOpenCancel(false);
      });
  };

  const changePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all the required fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    api
      .put(
        "/password",
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          toast.success("Password changed successfully");
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      })
      .finally(() => {
        setOpenChangePassword(false);
      });
  };

  const statusColor = {
    new: "text-blue-500",
    processing: "text-yellow-500",
    transit: "text-orange-500",
    delivered: "text-green-500",
  };

  const getOrders = (id) => {
    api
      .get(`/order/user/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setOrders(res.data.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getProfile = () => {
    api
      .get("/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setUser(res.data);
        getOrders(res.data.id);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="relative">
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
      <Notification />
      <div className="lg:sticky top-0 z-50 bg-accent">
        <Navbar active="home" />
      </div>
      <div
        className="h-40 md:h-72 text-center flex flex-col gap-y-1 md:gap-y-3 items-center justify-start pt-3 md:pt-10"
        style={{
          backgroundImage: "url('/Navigation.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="text-xdark text-4xl md:text-7xl font-bold">Profile</div>
        <div className="">Home / Profile</div>
      </div>
      <div className="px-3 md:w-4/5 lg:w-4/5 xl:w-3/5 mx-auto py-5 my-5 lg:my-10">
        <div className="text-xl font-semibold">Your Information</div>
        <hr />
        <div className="grid grid-cols-1 md:grid-cols-3 justify-center items-center">
          <div className="mt-3">
            <div className="text-lg text-xlightgray font-semibold">Name</div>
            <div className="text-lg">{user.username}</div>
          </div>
          <div className="mt-3">
            <div className="text-lg text-xlightgray font-semibold">Email</div>
            <div className="text-lg">{user.email}</div>
          </div>
          <div className="mt-3">
            <button
              onClick={logout}
              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition duration-200 ease-in-out"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="mt-10">
          <div className="text-xl font-semibold">Change Password</div>
          <hr />
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-3 md:col-span-1 mt-3">
              <label htmlFor="oldPassword" className="text-sm">
                Old Password
              </label>
              <input
                type="password"
                id="oldPassword"
                className="w-full border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="col-span-3 md:col-span-1 mt-3">
              <label htmlFor="newPassword" className="text-sm">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                className="w-full border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="col-span-3 md:col-span-1 mt-3">
              <label htmlFor="confirmPassword" className="text-sm">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="col-span-3 md:col-span-1 mt-1">
              <button
                onClick={() => {
                  setOpenChangePassword(true);
                }}
                className="bg-brand text-white px-3 py-1 rounded-md transition duration-200 ease-in-out"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <div className="text-xl font-semibold">Your Orders</div>
          <hr />
          <div className="mt-5 w-92 md:w-full overflow-x-auto">
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
                title="Products (Name, Quantity)"
                dataIndex="products"
                key="products"
                render={(products) => (
                  <ul>
                    {JSON.parse(products).map((product) => (
                      <li key={product.id}>
                        {product.product_name}, {product.quantity}
                      </li>
                    ))}
                  </ul>
                )}
              />
              <Column
                title="Status"
                dataIndex="status"
                key="status"
                render={(status) => (
                  <div className={`${statusColor[status]}`}>{status}</div>
                )}
              />
              <Column
                title="Payment Status"
                dataIndex="paid"
                key="paid"
                render={(paid) => (
                  <div
                    className={`${paid ? "text-green-500" : "text-red-500"}`}
                  >
                    {paid ? "Paid" : "Not Paid"}
                  </div>
                )}
              />
              <Column
                title="Payment Method"
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
                    {record.status === "new" && (
                      <button
                        onClick={() => {
                          setSelectedUserId(record.id);
                          setOpenCancel(true);
                        }}
                        className="px-3 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all duration-200"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                )}
              />
            </Table>
          </div>
        </div>
      </div>
      <Footer />
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
        title="Cancel Order"
        open={openCancel}
        onOk={cancelOrder}
        okText="Confirm"
        onCancel={() => setOpenCancel(false)}
        centered
      >
        <div className="mx-2 my-4">
          Are you sure you want to cancel this order?
        </div>
      </Modal>
      <Modal
        title="Change Password"
        open={openChangePassword}
        onOk={changePassword}
        okText="Confirm"
        onCancel={() => setOpenChangePassword(false)}
        centered
      >
        <div className="mx-2 my-4">
          Are you sure you want to change your password?
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
