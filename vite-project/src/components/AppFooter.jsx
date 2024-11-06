// src/components/Footer.js
import React from "react";
import { Layout } from "antd";

const { Footer } = Layout;

const AppFooter = () =>
  <Footer
    style={{
      textAlign: "center",
      backgroundColor: "#fff",
      color: "black",
      borderTop: "1px solid #eee"
    }}
  >
    ©2024 Created by Trịnh Đăng Tuấn
  </Footer>;

export default AppFooter;
