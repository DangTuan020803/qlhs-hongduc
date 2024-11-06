import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Row,
  Col,
  message
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
const { Title } = Typography;
const { Option } = Select;

const ManageUnits = () => {
  const [units, setUnits] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/units/list");
      setUnits(response.data);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách đơn vị.");
    }
  };

  const handleSave = async values => {
    try {
      if (isEditing && editingUnit) {
        // Update existing unit
        await axios.patch(`http://localhost:3000/api/units/update/${editingUnit._id}`, values);
        setUnits(units.map(unit => (unit._id === editingUnit._id ? { ...unit, ...values } : unit)));
        message.success("Đã cập nhật thông tin đơn vị!");
      } else {
        // Create new unit
        const response = await axios.post("http://localhost:3000/api/units/create", values);
        setUnits([...units, response.data]);
        message.success("Đã thêm đơn vị mới!");
      }
      form.resetFields();
      setIsModalVisible(false);
      setIsEditing(false);
    } catch (error) {
      message.error(isEditing ? "Lỗi khi cập nhật đơn vị." : "Lỗi khi thêm đơn vị mới.");
    }
  };

  const handleEdit = unit => {
    setEditingUnit(unit);
    form.setFieldsValue(unit);
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`http://localhost:3000/api/units/delete/${id}`);
      setUnits(units.filter(unit => unit._id !== id));
      message.success("Đã xóa đơn vị!");
    } catch (error) {
      message.error("Lỗi khi xóa đơn vị.");
    }
  };

  const columns = [
    {
      title: "Tên đơn vị",
      dataIndex: "unitName",
      key: "unitName"
    },
    {
      title: "Loại đơn vị",
      dataIndex: "unitType",
      key: "unitType"
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)}>
            Xóa
          </Button>
        </>
      )
    }
  ];

  return (
    <Row justify="center" style={{ marginTop: "20px" }}>
      <Col span={20} className="text-right">
        <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginBottom: "16px" }}>
          Thêm đơn vị
        </Button>
        <Table columns={columns} dataSource={units} rowKey="_id" />

        <Modal
          title={isEditing ? "Chỉnh sửa đơn vị" : "Thêm đơn vị"}
          visible={isModalVisible}
          onCancel={() => {
            form.resetFields();
            setIsModalVisible(false);
            setIsEditing(false);
          }}
          onOk={() => {
            form.validateFields().then(values => handleSave(values)).catch(info => console.log("Validate Failed:", info));
          }}
          okText={isEditing ? "Cập nhật" : "Lưu"}
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Tên đơn vị"
              name="unitName"
              rules={[{ required: true, message: "Vui lòng nhập tên đơn vị!" }]}
            >
              <Input placeholder="Nhập tên đơn vị" />
            </Form.Item>
            <Form.Item
              label="Loại đơn vị"
              name="unitType"
              rules={[{ required: true, message: "Vui lòng chọn loại đơn vị!" }]}
            >
              <Select placeholder="Chọn loại đơn vị">
                <Option value="phong-dao-tao">Phòng Đào tạo</Option>
                <Option value="phong-dam-bao-chat-luong">Phòng Đảm bảo Chất lượng</Option>
                <Option value="ban-giam-hieu">Ban Giám hiệu</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Col>
    </Row>
  );
};

export default ManageUnits;
