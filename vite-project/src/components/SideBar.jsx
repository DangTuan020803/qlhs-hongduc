// src/components/SideBar.js

import React from "react";
import { Button, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  AppstoreOutlined,
  FileAddOutlined,
  SyncOutlined,
  SearchOutlined,
  TeamOutlined,
  UserAddOutlined
} from "@ant-design/icons";
import Title from "antd/es/skeleton/Title";

const SideBar = () => {
  const location = useLocation(); // Lấy đường dẫn hiện tại để xác định mục menu nào đang được chọn

  return (
    <Menu
      theme="light"
      mode="inline"
      selectedKeys={[location.pathname]}
      style={{ height: "603px", padding: "1px" } // Xác định mục menu nào đang được chọn
      }
    >
      <Menu.Item key="/trangquantri/dashboarch" icon={<AppstoreOutlined />}>
        <Link to="/trangquantri/dashboarch" style={{ textDecoration: "none" }}>
          Dashboard
        </Link>
      </Menu.Item>
      <Menu.Item key="/trangquantri/new-certificate" icon={<FileAddOutlined />}>
        <Link
          to="/trangquantri/new-certificate"
          style={{ textDecoration: "none" }}
        >
          Cấp mới văn bằng
        </Link>
      </Menu.Item>
      <Menu.Item key="/trangquantri/update-certificate" icon={<SyncOutlined />}>
        <Link
          to="/trangquantri/update-certificate"
          style={{ textDecoration: "none" }}
        >
          Cấp lại văn bằng
        </Link>
      </Menu.Item>
      <Menu.Item key="/trangquantri/manager-acount" icon={<UserAddOutlined />}>
        <Link
          to="/trangquantri/manager-acount"
          style={{ textDecoration: "none" }}
        >
          Quản lý tài khoản
        </Link>
      </Menu.Item>
      <Menu.Item key="/trangquantri/manage-units" icon={<TeamOutlined />}>
        <Link
          to="/trangquantri/manage-units"
          style={{ textDecoration: "none" }}
        >
          Quản lý đơn vị
        </Link>
      </Menu.Item>
      <Menu.Item
        key="/trangquantri/certificate-signingUI"
        icon={<TeamOutlined />}
      >
        <Link
          to="/trangquantri/certificate-signingUI"
          style={{ textDecoration: "none" }}
        >
          Quá trình xác nhận chữ ký
        </Link>
      </Menu.Item>
    </Menu>
  );
};

export default SideBar;
