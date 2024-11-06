import React, { useState } from "react";
import {
  Layout,
  Input,
  Button,
  Typography,
  Card,
  Modal,
  Form,
  message,
  Row,
  Col,
  DatePicker
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import "../App.css";
import { useNavigate } from "react-router-dom";
const { Header, Content } = Layout;
const { Title, Text } = Typography;

const CheckVanBang = () => {
  const navigate = useNavigate(); // Sử dụng useNavigate
  //   const [form] = useForm();
  const [isAdvancedModalVisible, setIsAdvancedModalVisible] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  const onSearch = value => {
    console.log("Searching for:", value);
  };

  const showAdvancedModal = () => {
    setIsAdvancedModalVisible(true);
  };

  const handleAdvancedOk = values => {
    console.log("Advanced search values:", values);
    setIsAdvancedModalVisible(false);
  };

  const handleAdvancedCancel = () => {
    setIsAdvancedModalVisible(false);
  };

  const showLoginModal = () => {
    setIsLoginModalVisible(true);
  };

  const handleLoginOk = async values => {
    if (!values.username || !values.password) {
      message.error("Vui lòng nhập tên đăng nhập và mật khẩu!");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3000/api/login",
        values
      );
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        message.success("Đăng nhập thành công!");
        setIsLoginModalVisible(false);
        navigate("/trangquantri");
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      message.error("Tên đăng nhập hoặc mật khẩu không đúng.");
      console.error("Login error:", error);
    }
  };

  const handleLoginCancel = () => {
    setIsLoginModalVisible(false);
  };

  return (
    <Layout style={{ minHeight: "100vh" }} className="content-background">
      {/* Header */}
      <Header
        style={{
          background: "rgba(255, 255, 255, 0.5)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          width: "100%",
          backdropFilter: "blur(1px)"
        } // More transparency (50% opacity) // Optional: adds a soft blur effect for clarity
        }
      >
        <img
          src="https://firebasestorage.googleapis.com/v0/b/project-kanvan.appspot.com/o/d564d4101831c0f0848ee54b81a8bb0d.png?alt=media&token=4b38e245-ca8e-4266-9e85-83551dcd46f2"
          alt="Logo"
          style={{ height: "55px", marginRight: "20px" }}
        />
        <div style={{ marginLeft: "auto" }}>
          <Button type="primary" onClick={showLoginModal}>
            Đăng nhập
          </Button>
        </div>
      </Header>
      {/* Content */}
      <Content>
        <div className="content-overlay">
          <Card
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "30px",
              marginTop: "120px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              textAlign: "center"
            }}
          >
            <Title level={3}>Nhập thông tin tìm kiếm</Title>
            <Text type="secondary">
              Nhập tên hoặc mã số của văn bằng chứng chỉ để tìm kiếm.
            </Text>
            <Input.Search
              placeholder="Nhập từ khóa..."
              enterButton="Tìm kiếm"
              size="large"
              prefix={<SearchOutlined />}
              onSearch={onSearch}
              style={{ marginTop: "20px", borderRadius: "5px" }}
            />
            <Button
              type="primary"
              onClick={showAdvancedModal}
              style={{
                marginTop: "20px",
                width: "100%",
                height: "40px",
                borderRadius: "5px"
              }}
            >
              Tìm kiếm nâng cao
            </Button>
          </Card>
        </div>
      </Content>

      {/* Modal for Advanced Search */}
      <Modal
        title="Tìm kiếm nâng cao"
        visible={isAdvancedModalVisible}
        onCancel={handleAdvancedCancel}
        footer={null}
      >
        <Form onFinish={handleAdvancedOk} layout="vertical">
          {/* Hàng đầu tiên: Tên và Mã số */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tên" name="name">
                <Input placeholder="Nhập tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mã số" name="code">
                <Input placeholder="Nhập mã số" />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng thứ hai: Ngày cấp và Loại văn bằng */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ngày cấp" name="issueDate">
                <DatePicker
                  format="DD-MM-YYYY"
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày cấp"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Loại văn bằng" name="certificateType">
                <Input placeholder="Nhập loại văn bằng" />
              </Form.Item>
            </Col>
          </Row>

          {/* Nút Tìm kiếm căn phải */}
          <Form.Item>
            <Row justify="end">
              <Col>
                <Button type="primary" htmlType="submit">
                  Tìm kiếm
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal for Login */}
      <Modal
        visible={isLoginModalVisible}
        onCancel={handleLoginCancel}
        footer={null}
        centered
      >
        <div
          style={{
            padding: "24px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "8px",
            textAlign: "center"
          }}
        >
          <img
            src="https://firebasestorage.googleapis.com/v0/b/project-kanvan.appspot.com/o/808271258c41f304080a2bed1d411582.png?alt=media&token=df310bb5-7a03-44f5-b27f-3408301ad77a"
            alt="Logo"
            style={{ marginBottom: "20px", width: "350px" }}
          />
          <Form
            name="login_form"
            onFinish={handleLoginOk}
            layout="vertical"
            style={{ width: "100%" }}
          >
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" }
              ]}
            >
              <Input placeholder="Tên đăng nhập" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </Layout>
  );
};

export default CheckVanBang;
