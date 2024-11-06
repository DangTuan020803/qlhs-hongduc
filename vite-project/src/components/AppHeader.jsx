import React, { useEffect, useState } from "react";
import { Layout, Typography, Button, message, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get("http://localhost:3000/api/user", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsername(response.data.username);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        message.error("Không thể tải thông tin người dùng");
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem("token");

    // Hiển thị thông báo đăng xuất thành công
    message.success("Đã đăng xuất thành công!");

    // Điều hướng về trang đăng nhập
    navigate("/");
  };

  return (
    <Header
      style={{
        position: "fixed",
        zIndex: 1,
        width: "100%",
        backgroundColor: "#fff",
        padding: "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #eee"
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src="https://firebasestorage.googleapis.com/v0/b/project-kanvan.appspot.com/o/d564d4101831c0f0848ee54b81a8bb0d.png?alt=media&token=4b38e245-ca8e-4266-9e85-83551dcd46f2"
          alt="Logo"
          style={{ height: "55px", marginRight: "16px" }}
        />
      </div>

      {/* Username and Logout */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <Avatar
          style={{ backgroundColor: "#87d068", marginRight: "8px" }}
          icon={<UserOutlined />}
        />
        <Text
          style={{ color: "#333", marginRight: "16px", fontWeight: "bold" }}
        >
          {username || "User"}
        </Text>
        <Button type="primary" danger onClick={handleLogout}>
          Đăng xuất
        </Button>
      </div>
    </Header>
  );
};

export default AppHeader;
