import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineDashboard,
  AiOutlineShoppingCart,
  AiOutlineBgColors,
  AiOutlineUserSwitch,
  AiOutlineLogout,
} from "react-icons/ai";
import {RiCouponLine} from "react-icons/ri";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SiBrandfolder } from "react-icons/si";
import { BiCategory } from "react-icons/bi";
import { FaClipboardList, FaBloggerB } from "react-icons/fa";
import { ImBlog } from "react-icons/im";
import { Outlet } from "react-router-dom";
import { IoIosNotifications } from "react-icons/io";
import { Link } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const Mainlayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const navigate = useNavigate();
  return (
    <Layout /* onContextMenu={(e)=>e.preventDefault()} */ >
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo text-white">
          <h2 className="text-white text-align fs-5 py-4">
            <span className="sm-logo">DC</span>
            <span className="lg-logo">&nbsp; Dev corner</span>
          </h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          onClick={({ key }) => {
            if (key === "signout") {
              localStorage.clear()
              window.location.reload()
            } else {
              navigate(key);
            }
          }}
          items={[
            {
              key: "",
              icon: <AiOutlineDashboard className="fs-4" />,
              label: "Dashboard",
            },
            {
              key: "customers",
              icon: <AiOutlineUserSwitch className="fs-4" />,
              label: "Customers",
            },
            {
              key: "Catalog",
              icon: <AiOutlineShoppingCart className="fs-4" />,
              label: "catalog",
              children: [
                {
                  key: "Product",
                  icon: <AiOutlineShoppingCart className="fs-4" />,
                  label: "Add Product",
                },
                {
                  key: "product-List",
                  icon: <AiOutlineShoppingCart className="fs-4" />,
                  label: "Product List",
                },
                {
                  key: "Brand",
                  icon: <SiBrandfolder className="fs-4" />,
                  label: "Brand",
                },
                {
                  key: "brand-List",
                  icon: <SiBrandfolder className="fs-4" />,
                  label: "Brand List",
                },
                {
                  key: "category",
                  icon: <BiCategory className="fs-4" />,
                  label: "Category",
                },
                {
                  key: "category-List",
                  icon: <BiCategory className="fs-4" />,
                  label: "Category List",
                },
                {
                  key: "color",
                  icon: <AiOutlineBgColors className="fs-4" />,
                  label: "Color",
                },
                {
                  key: "color-list",
                  icon: <AiOutlineBgColors className="fs-4" />,
                  label: "Color List",
                },
              ],
            },
            {
              key: "orders",
              icon: <FaClipboardList className="fs-4" />,
              label: "orders",
            },
            {
              key: "marketing",
              icon: <RiCouponLine className="fs-4" />,
              label: "Marketing",
              children: [
                {
                  key: "coupon",
                  icon: <ImBlog className="fs-4" />,
                  label: "Add Coupon",
                },
                {
                  key: "coupon-list",
                  icon: <RiCouponLine className="fs-4" />,
                  label: "Coupon List",
                },
              ],
            },
            {
              key: "blog",
              icon: <FaBloggerB className="fs-4" />,
              label: "Blogs",
              children: [
                {
                  key: "add-blog",
                  icon: <ImBlog className="fs-4" />,
                  label: "Add Blogs",
                },
                {
                  key: "blog-list",
                  icon: <FaBloggerB className="fs-4" />,
                  label: "Blog List",
                },
                {
                  key: "blog-category",
                  icon: <ImBlog className="fs-4" />,
                  label: "Add Blog Category",
                },
                {
                  key: "blog-list-category",
                  icon: <FaBloggerB className="fs-4" />,
                  label: "Blog List Category",
                },
              ],
            },
            {
              key: "enquiries",
              icon: <FaClipboardList className="fs-4" />,
              label: "Enquiries",
            },
            {
              key: "signout",
              icon: <AiOutlineLogout className="fs-4" />,
              label: "Sign Out",
            },
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          className="d-flex justify-content-between"
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: "trigger",
              onClick: () => setCollapsed(!collapsed),
            }
          )}
          <div className="d-flex gap-4 align-items-center mb-2">
            <div className="position-relative">
              <IoIosNotifications className="fs-4" />
              <span className="badge bg-warning rounded-circle p-1 position-absolute">3</span>
            </div>
            <div
              className="d-flex gap-3 align-items-center dropdown">
              <div>
                <img
                  width={32}
                  height={32}
                  src="data:image/jpeg;base64,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"
                  alt=""
                />
              </div>
              <div role="button"
                id="dropdownMenuLink"
                data-bs-toggle="dropdown"
                aria-expanded="false">
                <h5 className="mb-0 px-2">Niket</h5>
                <p className="mb-0 px-2">nikettiwari@gmail.com</p>
              </div>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                <li>
                  <Link className="dropdown-item py-1 mb-1"
                    style={{ "height": "auto", "lineHeight": "20px" }}
                    to="/">
                    View Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item py-1 mb-1"
                    style={{ "height": "auto", "lineHeight": "20px" }}
                    to="/">
                    Sign out
                  </Link>
                </li>
              </div>
            </div>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          <main>
            <ToastContainer
              position="top-right"
              autoClose={800}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              theme="light"
            />
            <Outlet />
          </main>
        </Content>
      </Layout>
    </Layout>
  );
};
export default Mainlayout;
