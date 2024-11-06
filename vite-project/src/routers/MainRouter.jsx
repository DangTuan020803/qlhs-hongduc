import React from "react";
import { Layout, Row, Col, Progress } from "antd";
import AppHeader from "../components/AppHeader";
import SideBar from "../components/SideBar";
import AppFooter from "../components/AppFooter";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NewCertificate from "../screens/NewCertificate";
import DashBoarch from "../screens/DashBoarch";
import ManageUnits from "../screens/ManageUnits";
import UpdateCertificate from "../screens/UpdateCertificate";
import ManagerAccount from "../screens/ManagerAccount";
import CertificateSigningUI from "../screens/CertificateSigningUI";

const { Content } = Layout;

const MainRouter = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader> </AppHeader>
      {/* Header cố định */}
      <Layout style={{ marginTop: 64 }}>
        {" "}{/* Thêm khoảng trống để tránh header */}
        <Row style={{ display: "flex" }}>
          <Col span={4}>
            <SideBar /> {/* Sidebar chiếm 8 cột bên trái */}
          </Col>
          <Col
            span={20}
            style={{ background: "#fff", padding: 24, minHeight: "561px" }}
          >
            <Content>
              <Routes>
                <Route path="dashboarch" element={<DashBoarch />} />
                <Route path="new-certificate" element={<NewCertificate />} />
                <Route
                  path="update-certificate"
                  element={<UpdateCertificate />}
                />
                <Route path="manager-acount" element={<ManagerAccount />} />
                <Route path="manage-units" element={<ManageUnits />} />
                <Route
                  path="certificate-SigningUI"
                  element={<CertificateSigningUI />}
                />
              </Routes>
            </Content>
          </Col>
        </Row>
      </Layout>
      <AppFooter /> {/* Footer cố định */}
    </Layout>
  );
};

export default MainRouter;
