import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Table,
  Typography,
  message,
  Popconfirm,
  Switch
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const ManagerAccount = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [
    isForgotPasswordModalVisible,
    setIsForgotPasswordModalVisible
  ] = useState(false);
  const [
    isUpdatePasswordModalVisible,
    setIsUpdatePasswordModalVisible
  ] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [keyModalVisible, setKeyModalVisible] = useState(false);
  const [modalKeyContent, setModalKeyContent] = useState("");
  const [modalKeyType, setModalKeyType] = useState("");
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [forgotPasswordForm] = Form.useForm();
  const [updatePasswordForm] = Form.useForm();

  // Fetch users from the API when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/users/list"
        );
        setUsers(response.data);
      } catch (error) {
        message.error("Lỗi khi lấy danh sách người dùng.");
      }
    };

    fetchUsers();
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleEditCancel = () => {
    editForm.resetFields();
    setIsEditModalVisible(false);
    setSelectedUser(null);
  };

  const handleCreateUser = async values => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/create",
        values
      );
      message.success(
        response.data.message || "Người dùng mới đã được tạo thành công!"
      );
      const newUser = {
        ...values,
        _id: response.data._id,
        status: "active",
        publicKey: response.data.publicKey,
        privateKey: response.data.privateKey
      };
      setUsers(prevUsers => [...prevUsers, newUser]);
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Đã xảy ra lỗi khi tạo người dùng.");
    }
  };

  const handleEditUser = async values => {
    try {
      await axios.patch(
        `http://localhost:3000/api/users/update/${selectedUser._id}`,
        values
      );
      setUsers(prevUsers =>
        prevUsers.map(
          user =>
            user._id === selectedUser._id ? { ...user, ...values } : user
        )
      );
      message.success("Người dùng đã được cập nhật!");
      handleEditCancel();
    } catch (error) {
      message.error("Lỗi khi cập nhật người dùng.");
    }
  };

  const handleDeleteUser = async userId => {
    try {
      const userToDelete = users.find(user => user._id === userId);
      if (userToDelete && userToDelete.role === "admin") {
        message.error(
          "Không thể xóa tài khoản có quyền Quản trị viên (admin)!."
        );
        return;
      }
      await axios.delete(`http://localhost:3000/api/users/delete/${userId}`);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      message.success("Người dùng đã được xóa thành công!");
    } catch (error) {
      message.error("Lỗi khi xóa người dùng.");
    }
  };

  const showEditModal = user => {
    setSelectedUser(user);
    editForm.setFieldsValue(user);
    setIsEditModalVisible(true);
  };

  const toggleUserStatus = async (userId, status) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/users/update-status/${userId}`,
        { status }
      );
      setUsers(prevUsers =>
        prevUsers.map(
          user => (user._id === userId ? { ...user, status } : user)
        )
      );
      message.success("Trạng thái người dùng đã được cập nhật!");
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái người dùng.");
    }
  };

  const handleKeyClick = (keyType, keyContent, user) => {
    if (keyType === "Private Key") {
      setSelectedUser(user); // Store the user for password verification
      setIsPasswordModalVisible(true); // Show password modal
    } else {
      setModalKeyType(keyType);
      setModalKeyContent(keyContent);
      setKeyModalVisible(true);
    }
  };

  const closeKeyModal = () => {
    setKeyModalVisible(false);
    passwordForm.resetFields(); // Clear the password field when closing the key modal
  };

  const handlePasswordConfirm = async values => {
    try {
      const { password } = values;
      const response = await axios.post(
        `http://localhost:3000/api/users/verify-password/${selectedUser._id}`,
        { password }
      );
      if (response.data.valid) {
        setModalKeyContent(selectedUser.privateKey); // Show the private key
        setKeyModalVisible(true); // Open modal to show the private key
      } else {
        message.error("Mật khẩu không đúng.");
      }
    } catch (error) {
      message.error("Lỗi xác minh mật khẩu.");
    } finally {
      setIsPasswordModalVisible(false);
    }
  };

  const handleForgotPassword = async values => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/forgot-password",
        { email: values.email }
      );
      message.success(
        response.data.message ||
          "Đã gửi hướng dẫn đặt lại mật khẩu tới email của bạn."
      );
      setIsForgotPasswordModalVisible(false);
    } catch (error) {
      message.error("Lỗi khi gửi hướng dẫn đặt lại mật khẩu.");
    }
  };

  const handleUpdatePassword = async values => {
    const { currentPassword, newPassword, confirmNewPassword } = values;

    if (newPassword !== confirmNewPassword) {
      message.error("Mật khẩu mới và xác nhận không khớp.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/users/verify-password/${selectedUser._id}`,
        { password: currentPassword }
      );

      if (response.data.valid) {
        await axios.patch(
          `http://localhost:3000/api/users/update/${selectedUser._id}`,
          { password: newPassword }
        ); // Gửi mật khẩu mới
        message.success("Mật khẩu đã được cập nhật thành công!");
      } else {
        message.error("Mật khẩu hiện tại không đúng.");
      }
      setIsUpdatePasswordModalVisible(false);
    } catch (error) {
      message.error("Lỗi khi cập nhật mật khẩu.");
    }
  };

  const columns = [
    { title: "Họ và tên", dataIndex: "username", key: "username", width: 150 },
    { title: "Email", dataIndex: "email", key: "email", width: 200 },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 130,
      render: role =>
        role === "admin"
          ? "Quản trị viên"
          : role === "user" ? "Người dùng" : "Sinh viên"
    },
    {
      title: "Mật khẩu",
      dataIndex: "password",
      key: "password",
      width: 300,
      render: password =>
        <span
          onClick={() => {
            setSelectedUser(password); // Save selected user for password update
            setIsUpdatePasswordModalVisible(true);
          }}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: "pointer",
            padding: "2px 4px"
          }}
        >
          Nhấn để cập nhật mật khẩu
        </span>
    },
    {
      title: "Public Key",
      dataIndex: "publicKey",
      key: "publicKey",
      width: 300,
      render: (publicKey, record) =>
        <span
          onClick={() => handleKeyClick("Public Key", publicKey, record)}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: "pointer",
            padding: "2px 4px"
          }}
        >
          {publicKey || "Chưa tạo"}
        </span>
    },
    {
      title: "Private Key",
      dataIndex: "privateKey",
      key: "privateKey",
      width: 300,
      render: (privateKey, record) =>
        <span
          onClick={() => handleKeyClick("Private Key", privateKey, record)} // Pass the user record
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: "pointer",
            padding: "2px 4px"
          }}
        >
          {privateKey || "Chưa tạo"}
        </span>
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status, record) =>
        <Switch
          checked={status === "active"}
          onChange={checked =>
            toggleUserStatus(record._id, checked ? "active" : "inactive")}
        />
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) =>
        <Row>
          <Col>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
              style={{ marginRight: 8 }}
            />
          </Col>
          <Col>
            <Popconfirm
              title="Bạn có chắc muốn xóa người dùng này?"
              onConfirm={() => handleDeleteUser(record._id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Col>
        </Row>
    }
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Card
        style={{
          borderRadius: "8px",
          backgroundColor: "#f5f5f5",
          marginBottom: "20px"
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ color: "#1890ff" }}>
              Quản lý tài khoản
            </Title>
            <p>Danh sách người dùng trong hệ thống</p>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={showModal}
              style={{ borderRadius: "6px" }}
            >
              Thêm người dùng
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        bordered
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1200 }}
      />

      {/* Modal to add a new user */}
      <Modal
        title="Tạo người dùng mới"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateUser}
          initialValues={{ role: "user" }}
        >
          <Form.Item
            label="Họ và tên"
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Select>
              <Option value="user">Người dùng</Option>
              <Option value="admin">Quản trị viên</Option>
              <Option value="student">Sinh viên</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Row justify="end" gutter={10}>
              <Col>
                <Button onClick={handleCancel}>Hủy</Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit">
                  Tạo người dùng
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal to display key */}
      <Modal
        title={modalKeyType === "Private Key" ? "Khóa bí mật" : modalKeyType}
        visible={keyModalVisible}
        onCancel={closeKeyModal}
        footer={
          <Button key="close" type="primary" onClick={closeKeyModal}>
            Đóng
          </Button>
        }
      >
        <Input.TextArea
          value={modalKeyContent}
          rows={6}
          readOnly
          style={{ fontFamily: "monospace" }}
        />
      </Modal>

      {/* Modal to enter password for retrieving private key */}
      <Modal
        title="Nhập mật khẩu để xem khóa bí mật"
        visible={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields(); // Reset password field when closing
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordConfirm}
        >
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Row justify="end" gutter={10}>
              <Col>
                <Button
                  onClick={() => {
                    setIsPasswordModalVisible(false);
                    passwordForm.resetFields(); // Reset password field when canceling
                  }}
                >
                  Hủy
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit">
                  Xác nhận
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal to edit user details */}
      <Modal
        title="Chỉnh sửa người dùng"
        visible={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditUser}>
          <Form.Item
            label="Họ và tên"
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Select>
              <Option value="user">Người dùng</Option>
              <Option value="admin">Quản trị viên</Option>
              <Option value="student">Sinh viên</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Row justify="end" gutter={10}>
              <Col>
                <Button onClick={handleEditCancel}>Hủy</Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for forgot password */}
      <Modal
        title="Quên mật khẩu"
        visible={isForgotPasswordModalVisible}
        onCancel={() => setIsForgotPasswordModalVisible(false)}
        footer={null}
      >
        <Form
          form={forgotPasswordForm}
          layout="vertical"
          onFinish={handleForgotPassword}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" }
            ]}
          >
            <Input placeholder="Nhập email của bạn" />
          </Form.Item>
          <Form.Item>
            <Row justify="end" gutter={10}>
              <Col>
                <Button onClick={() => setIsForgotPasswordModalVisible(false)}>
                  Hủy
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit">
                  Gửi yêu cầu
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for updating password */}
      <Modal
        title="Cập nhật mật khẩu"
        visible={isUpdatePasswordModalVisible}
        onCancel={() => setIsUpdatePasswordModalVisible(false)}
        footer={null}
      >
        <Form
          form={updatePasswordForm}
          layout="vertical"
          onFinish={handleUpdatePassword}
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmNewPassword"
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" }
            ]}
          >
            <Input.Password placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Row justify="end" gutter={10}>
              <Col>
                <Button onClick={() => setIsUpdatePasswordModalVisible(false)}>
                  Hủy
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerAccount;
