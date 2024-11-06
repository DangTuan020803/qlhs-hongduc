import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Typography,
  Row,
  Col,
  message,
  Card,
  Tag,
  Pagination
} from "antd";

const { Title } = Typography;
const { Option } = Select;

const NewCertificate = () => {
  const [form] = Form.useForm();
  const [certificates, setCertificates] = useState([]); // State to hold new certificates
  const [certificateId, setCertificateId] = useState(""); // State to hold generated certificate ID
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [currentPage, setCurrentPage] = useState(1); // State for pagination
  const itemsPerPage = 3; // Number of items per page
  const [expandedKeys, setExpandedKeys] = useState([]); // State to manage which certificates are expanded

  // Function to generate a random 6-digit certificate ID
  const generateUniqueCertificateId = () => {
    let id;
    const existingIds = certificates.map(cert => cert.certificateId); // Get current IDs

    do {
      id = Math.floor(100000 + Math.random() * 900000).toString(); // Generate random 6-digit number
    } while (existingIds.includes(id)); // Repeat if it already exists

    return id;
  };

  // Use useEffect to generate the unique certificate ID when the component mounts
  useEffect(() => {
    const newCertificateId = generateUniqueCertificateId();
    setCertificateId(newCertificateId);
    form.setFieldsValue({ certificateId: newCertificateId }); // Set the generated ID in the form
  }, []);

  // Fetch all certificates from the database
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/certificates");
        setCertificates(response.data.certificates); // Assuming the response data contains an array of certificates
      } catch (error) {
        console.error("Error fetching certificates:", error);
        message.error("Lỗi khi tải dữ liệu văn bằng.");
      }
    };

    fetchCertificates();
  }, []);

  const onFinish = async values => {
    try {
      // Use the generated certificate ID
      const formattedValues = {
        ...values,
        issueDate: values.issueDate.format("YYYY-MM-DD"),
        certificateId, // Include generated certificateId
        status: "Pending" // Set initial status to Pending
      };

      // Send data to backend using axios
      const response = await axios.post(
        "http://localhost:3000/api/certificates/create",
        formattedValues
      );

      if (response.status === 201) {
        message.success("Văn bằng đã được cấp thành công và đang chờ xử lý!");

        // Add the new certificate to the list of certificates
        setCertificates(prev => [
          ...prev,
          {
            ...response.data.certificate,
            createdAt: new Date()
          }
        ]);

        form.resetFields(); // Reset form after successful submission
        setCertificateId(""); // Reset the certificate ID state
      } else {
        message.error("Có lỗi xảy ra khi cấp văn bằng.");
        console.error("Error:", response.data.message);
      }
    } catch (error) {
      if (error.response) {
        console.error("Error response data:", error.response.data);
        message.error(
          `Server error: ${error.response.data.message || "Lỗi không xác định"}`
        );
      } else {
        message.error("Không thể kết nối với server.");
        console.error("Error:", error);
      }
    }
  };

  // Function to handle search
  const handleSearch = async () => {
    setCurrentPage(1); // Reset to the first page on new search
    if (searchTerm.trim() === "") {
      message.warning("Vui lòng nhập thông tin tìm kiếm."); // Warn if the search term is empty
      return;
    }

    try {
      const response = await axios.get("http://localhost:3000/api/certificates/search", {
        params: { query: searchTerm }
      });
      setCertificates(response.data.certificates); // Update certificates with search results
    } catch (error) {
      console.error("Error fetching search results:", error);
      message.error("Lỗi khi tìm kiếm văn bằng.");
    }
  };

  // Filtered certificates based on the search term
  const filteredCertificates = certificates.filter(
    cert =>
      cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate the total pages
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const currentCertificates = filteredCertificates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle function for expanded certificates
  const toggleExpand = (index) => {
    setExpandedKeys(prev => 
      prev.includes(index) ? prev.filter(key => key !== index) : [...prev, index]
    );
  };

  return (
    <Row justify="center" gutter={30} style={{ marginTop: "10px" }}>
      {/* Left Section - Form */}
      <Col span={16}>
        <Title level={5} style={{ color: "#1890ff", marginBottom: "20px" }}>
          Nhập Thông Tin Văn Bằng
        </Title>
        <Form
          form={form}
          name="certificate-form"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Tên sinh viên"
            name="studentName"
            rules={[{ required: true, message: "Vui lòng nhập tên sinh viên!" }]}
          >
            <Input placeholder="Nhập tên sinh viên" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Mã sinh viên"
                name="studentId"
                rules={[{ required: true, message: "Vui lòng nhập mã sinh viên!" }]}
              >
                <Input placeholder="Nhập mã sinh viên" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Mã văn bằng"
                name="certificateId"
                rules={[{ required: true, message: "Vui lòng nhập mã văn bằng!" }]}
              >
                <Input
                  placeholder="Nhập mã văn bằng"
                  value={certificateId} // Automatically set the value
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Khóa học"
                name="course"
                rules={[{ required: true, message: "Vui lòng nhập khóa học!" }]}
              >
                <Input placeholder="Nhập khóa học" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Ngành học"
                name="major"
                rules={[{ required: true, message: "Vui lòng chọn ngành học!" }]}
              >
                <Select placeholder="Chọn ngành học">
                  <Option value="cntt">Công nghệ Thông tin</Option>
                  <Option value="ketoan">Kế toán</Option>
                  <Option value="quantri">Quản trị Kinh doanh</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Ngày cấp bằng"
                name="issueDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày cấp!" }]}
              >
                <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Loại bằng"
            name="degreeType"
            rules={[{ required: true, message: "Vui lòng chọn loại bằng!" }]}
          >
            <Select placeholder="Chọn loại bằng">
              <Option value="cu-nhan">Cử nhân</Option>
              <Option value="thac-si">Thạc sĩ</Option>
              <Option value="tien-si">Tiến sĩ</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Đơn vị cấp"
            name="issuingUnit"
            rules={[{ required: true, message: "Vui lòng chọn đơn vị cấp!" }]}
          >
            <Select placeholder="Chọn đơn vị cấp">
              <Option value="phong-dao-tao">Phòng Đào tạo</Option>
              <Option value="ban-giam-hieu">Ban Giám hiệu</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Xác nhận cấp mới
            </Button>
          </Form.Item>
        </Form>
      </Col>

      {/* Right Section - Certificates Display */}
      <Col span={8}>
        <Card
          title="Văn bằng cấp mới"
          bordered={true}
          style={{ borderRadius: "8px", backgroundColor: "#f9f9f9" }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Input
                placeholder="Tìm kiếm theo tên, mã sinh viên hoặc mã văn bằng"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ marginBottom: "16px" }}
              />
            </Col>
            <Col span={8}>
              <Button onClick={handleSearch} style={{ marginBottom: "16px", width: "100%" }}>
                Tìm kiếm
              </Button>
            </Col>
          </Row>
          {currentCertificates.length === 0
            ? <p>Chưa có văn bằng nào được cấp.</p>
            : currentCertificates.map((cert, index) =>
                <Card
                  key={index}
                  style={{ marginBottom: "10px", borderRadius: "8px" }}
                  onClick={() => toggleExpand(index)} // Toggle expand on click
                >
                  <p>
                    <strong>Tên sinh viên:</strong> {cert.studentName}
                  </p>
                  <p>
                    <strong>Mã sinh viên:</strong> {cert.studentId}
                  </p>
                  {/* Show additional info if expanded */}
                  {expandedKeys.includes(index) && (
                    <>
                      <p><strong>Mã văn bằng:</strong> {cert.certificateId}</p>
                      <p><strong>Khóa học:</strong> {cert.course}</p>
                      <p><strong>Ngành học:</strong> {cert.major}</p>
                      <p><strong>Ngày cấp:</strong> {cert.issueDate}</p>
                      <p><strong>Loại bằng:</strong> {cert.degreeType}</p>
                      <p><strong>Ngày tạo:</strong> {new Date(cert.createdAt).toLocaleDateString("vi-VN")}</p>
                      <Tag color={cert.status === "Pending" ? "red" : "green"}>
                        {cert.status === "Pending" ? "Đang chờ xử lý" : "Hiệu lực"}
                      </Tag>
                    </>
                  )}
                </Card>
              )}
        </Card>
        <Pagination
          current={currentPage}
          pageSize={itemsPerPage}
          total={filteredCertificates.length}
          onChange={page => setCurrentPage(page)}
          style={{ textAlign: "center", marginTop: "16px" }}
        />
      </Col>
    </Row>
  );
};

export default NewCertificate;
