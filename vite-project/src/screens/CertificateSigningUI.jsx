import React, { useState, useEffect } from "react";
import axios from "axios";
import bcrypt from 'bcryptjs';
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Typography,
  message,
  Card,
  Tag,
  Tabs,
  Steps,
  Progress,
  Table,
} from "antd";
import { EditOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;

const CertificateSigningUI = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [newCertificates, setNewCertificates] = useState([]);
  const [reissuedCertificates, setReissuedCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCertificate, setCurrentCertificate] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [step, setStep] = useState(0);
  const [privateKey, setPrivateKey] = useState(null);
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const [newCertsResponse, reissuedCertsResponse] = await Promise.all([
          axios.get("http://localhost:3000/api/certificates?status=New"),
          axios.get("http://localhost:3000/api/certificates?status=Reissued"),
        ]);

        setNewCertificates(newCertsResponse.data.certificates);
        setReissuedCertificates(reissuedCertsResponse.data.certificates);
        setLoading(false);
      } catch (error) {
        message.error("Lỗi khi lấy danh sách chứng chỉ.");
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/users/list");
      const fetchedUsers = response.data;

      const filteredAdminUsers = fetchedUsers
        .filter(user => user.role === "admin")
        .slice(1)
        .map(user => ({ ...user, status: "Chưa ký" }));

      setAdminUsers(filteredAdminUsers);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách người dùng.");
    }
  };

  const showModal = (certificate) => {
    setCurrentCertificate(certificate);
    setIsModalVisible(true);
    fetchUsers();
    setStep(0);
    form.resetFields();
    setPrivateKey(null);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const { password } = values;
      const currentUser = adminUsers[step];

      // Verify the password of the current user
      const { data: { password: storedPassword } } = await axios.get(`http://localhost:3000/api/users/${currentUser._id}/password`);
      const isMatch = bcrypt.compareSync(password, storedPassword);

      if (!isMatch) {
        message.error("Mật khẩu không chính xác.");
        return;
      }

      // Fetch the private key of the current user
      const { data: { privateKey: fetchedPrivateKey } } = await axios.get(`http://localhost:3000/api/users/${currentUser._id}/private-key`);
      setPrivateKey(fetchedPrivateKey);
      message.success("Mật khẩu chính xác. Khóa bí mật đã được lấy.");
      setShowPrivateKeyModal(true);
    } catch (error) {
      console.error("Error during password verification:", error);
      message.error("Vui lòng nhập mật khẩu của bạn.");
    }
  };

  const handleSign = async () => {
    const currentUser = adminUsers[step];

    try {
      await axios.patch(`http://localhost:3000/api/certificates/sign/${currentUser._id}`, {
        certificateId: currentCertificate.certificateId,
        status: "Đã cấp",
        signature: privateKey,
      });

      const updatedUsers = adminUsers.map((user, index) =>
        index === step ? { ...user, status: "Đã cấp" } : user
      );
      setAdminUsers(updatedUsers);

      // Update the certificate's status in newCertificates array
      const updatedCertificates = newCertificates.map(cert =>
        cert.certificateId === currentCertificate.certificateId
          ? { ...cert, status: "Đã cấp" }
          : cert
      );
      setNewCertificates(updatedCertificates);

      message.success(`${currentUser.username} đã ký thành công`);
      setPrivateKey(null);
      setShowPrivateKeyModal(false);

      // Increase progress
      setStep(prevStep => {
        const nextStep = prevStep + 1;
        if (nextStep < adminUsers.length) {
          return nextStep;
        } else {
          message.success("Tất cả người dùng đã ký. Chứng chỉ đã sẵn sàng!");
          setIsModalVisible(false);
          return prevStep;
        }
      });
    } catch (error) {
      console.error("Error during signing process:", error);
      message.error("Lỗi khi ký chứng chỉ.");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setStep(0);
  };

  const calculateProgress = () => {
    const signedUsersCount = adminUsers.filter(user => user.status === "Đã cấp").length;
    return (signedUsersCount / adminUsers.length) * 100;
  };

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={16} justify="center" style={{ marginBottom: "40px" }}>
        <Col span={24}>
          <Card bordered={true}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Văn Bằng Cấp Mới" key="1">
                <Table
                  dataSource={newCertificates}
                  rowKey="certificateId"
                  loading={loading}
                  pagination={false}
                  bordered
                  style={{ backgroundColor: "#fff", borderRadius: "8px" }}
                  onRow={(record) => ({
                    onClick: () => {
                      // Prevent opening the modal if the status is "Đã cấp"
                      if (record.status !== "Đã cấp") {
                        showModal(record);
                      } else {
                        message.warning("Chứng chỉ đã được ký và không thể ký lại.");
                      }
                    },
                  })}
                >
                  <Table.Column title="Mã văn bằng" dataIndex="certificateId" />
                  <Table.Column title="Tên sinh viên" dataIndex="studentName" />
                  <Table.Column title="Đơn vị cấp" dataIndex="issuingUnit" />
                  <Table.Column title="Ngày cấp" dataIndex="issueDate" />
                  <Table.Column
                    title="Trạng thái"
                    dataIndex="status"
                    render={(status) => (
                      <Tag color={status === "Đã cấp" ? "green" : "red"} style={{ fontWeight: "bold" }}>
                        {status || "Chưa cấp"}
                      </Tag>
                    )}
                  />
                </Table>
              </TabPane>
              <TabPane tab="Văn Bằng Cấp Lại" key="2">
                <Table
                  dataSource={reissuedCertificates}
                  rowKey="certificateId"
                  loading={loading}
                  pagination={false}
                  bordered
                  style={{ backgroundColor: "#fff", borderRadius: "8px" }}
                  onRow={(record) => ({
                    onClick: () => {
                      // Prevent opening the modal if the status is "Đã cấp"
                      if (record.status !== "Đã cấp") {
                        showModal(record);
                      } else {
                        message.warning("Chứng chỉ đã được ký và không thể ký lại.");
                      }
                    },
                  })}
                >
                  <Table.Column title="Mã văn bằng" dataIndex="certificateId" />
                  <Table.Column title="Tên sinh viên" dataIndex="studentName" />
                  <Table.Column title="Đơn vị cấp" dataIndex="issuingUnit" />
                  <Table.Column title="Ngày cấp" dataIndex="issueDate" />
                  <Table.Column
                    title="Trạng thái"
                    dataIndex="status"
                    render={(status) => (
                      <Tag color={status === "Đã cấp" ? "green" : "red"} style={{ fontWeight: "bold" }}>
                        {status || "Chưa cấp"}
                      </Tag>
                    )}
                  />
                </Table>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Modal for signing */}
      <Modal
        title={`Nhập mật khẩu cho ${currentCertificate?.studentName || ""}`}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
          <p>{`Đang yêu cầu mật khẩu từ: ${adminUsers[step]?.username || ""}`}</p>
        </Form>
      </Modal>

      {/* Modal for private key confirmation */}
      <Modal
        title="Khóa bí mật"
        visible={showPrivateKeyModal}
        onOk={handleSign}
        onCancel={() => setShowPrivateKeyModal(false)}
        okText="Xác nhận ký"
        cancelText="Hủy"
      >
        <p>Khóa bí mật của bạn:</p>
        <pre>{privateKey}</pre>
      </Modal>

      {/* Display signing progress */}
      <Row justify="center" style={{ marginTop: "20px" }}>
        <Col span={18}>
          <Steps current={step} progressDot style={{ marginBottom: "20px" }}>
            {adminUsers.map((user, index) => (
              <Step
                key={index}
                title={<span style={{ fontWeight: 600 }}>{user.username}</span>}
                description={user.status === "Đã cấp" ? "Đã cấp" : "Đang chờ ký"}
                icon={
                  user.status === "Đã cấp" ? (
                    <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  ) : (
                    <EditOutlined />
                  )
                }
              />
            ))}
          </Steps>
          <Progress
            percent={calculateProgress()}
            status="active"
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
            style={{ marginBottom: "10px" }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default CertificateSigningUI;
