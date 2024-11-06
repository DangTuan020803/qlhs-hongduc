import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
  Card,
  List,
  Tag,
  message,
  Pagination
} from "antd";
import axios from "axios";

const { Option } = Select;

const UpdateCertificate = () => {
  const [form] = Form.useForm();
  const [certificates, setCertificates] = useState([]); // State to hold existing certificates
  const [reissuedCertificates, setReissuedCertificates] = useState([]); // State to hold reissued certificates
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const itemsPerPage = 2; // Maximum items per page
  const [newCertificate, setNewCertificate] = useState(null); // State to hold newly created certificate details

  // Fetch all existing certificates and reissued certificates when the component mounts
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/certificates"
        );
        setCertificates(response.data.certificates); // Load existing certificates

        // Load reissued certificates
        const reissuedResponse = await axios.get(
          "http://localhost:3000/api/certificates?status=Reissued"
        );
        setReissuedCertificates(reissuedResponse.data.certificates); // Load reissued certificates
      } catch (error) {
        console.error("Error fetching certificates:", error);
        message.error("Lỗi khi tải danh sách văn bằng.");
      }
    };

    fetchCertificates();
  }, []);

  const onFinish = async values => {
    const {
      oldCertificateId,
      studentName,
      reissueReason,
      reissueDate,
      reissuingUnit
    } = values;

    try {
      // Step 1: Check for the old certificate
      const existingCertificateResponse = await axios.get(
        `http://localhost:3000/api/certificates/search?query=${oldCertificateId}`
      );

      if (existingCertificateResponse.data.certificates.length === 0) {
        message.error("Văn bằng cũ không tồn tại.");
        return;
      }

      const existingCertificate =
        existingCertificateResponse.data.certificates[0];

      // Step 2: Preserve the old certificate's secretKey and publicKey
      const { secretKey, publicKey } = existingCertificate;

      // Step 3: Delete the old certificate
      await axios.delete(
        `http://localhost:3000/api/certificates/delete/${oldCertificateId}`
      );

      // Step 4: Generate a new unique certificate ID
      const newCertificateId = await generateUniqueCertificateId();

      // Step 5: Create a new reissued certificate, preserving keys
      const formattedValues = {
        studentName,
        studentId: existingCertificate.studentId,
        certificateId: newCertificateId,
        course: existingCertificate.course,
        major: existingCertificate.major,
        issueDate: reissueDate.toDate(),
        degreeType: existingCertificate.degreeType,
        issuingUnit: reissuingUnit,
        secretKey,
        publicKey,
        status: "Pending",
        oldCertificateId
      }; // Use the same studentId // Generate a new unique certificate ID // Use the same course // Use the same major // Convert moment date to JavaScript Date object // Use the same degree type // Preserve the original secret key // Preserve the original public key // Set the status to Pending // Include the old certificate ID

      const response = await axios.post(
        "http://localhost:3000/api/certificates/create",
        formattedValues
      );

      if (response.status === 201) {
        message.success("Cấp lại văn bằng thành công!");
        // Store the new certificate details to display
        setNewCertificate({
          certificateId: newCertificateId, // Use the newly generated certificate ID
          studentName: response.data.certificate.studentName,
          issuingUnit: reissuingUnit, // Use the reissuing unit
          issueDate: response.data.certificate.issueDate,
          oldCertificateId // Include the old certificate ID
        });

        // Add the new certificate to the reissued list
        setReissuedCertificates(prev => [
          ...prev,
          { ...response.data.certificate, status: "Pending" } // Include the status
        ]);
        form.resetFields(); // Reset the form after submission
      }
    } catch (error) {
      console.error("Error in reissuing certificate:", error);
      message.error("Có lỗi xảy ra khi cấp lại văn bằng.");
    }
  };

  const generateUniqueCertificateId = async () => {
    let id;
    const existingIds = await axios
      .get("http://localhost:3000/api/certificates")
      .then(res => res.data.certificates.map(cert => cert.certificateId));

    do {
      id = Math.floor(100000 + Math.random() * 900000).toString(); // Generate random 6-digit number
    } while (existingIds.includes(id)); // Repeat if it already exists

    return id;
  };

  // Calculate the indices for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reissuedCertificates.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <Row justify="center" gutter={30} style={{ marginTop: "10px" }}>
      {/* Left Section - Form */}
      <Col span={16}>
        <Card
          title="Cấp Lại Văn Bằng"
          bordered={true}
          style={{ borderRadius: "8px", backgroundColor: "#fff" }}
        >
          <Form
            form={form}
            name="reissue-certificate-form"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              label="Mã văn bằng cũ"
              name="oldCertificateId"
              rules={[
                { required: true, message: "Vui lòng nhập mã văn bằng cũ!" }
              ]}
            >
              <Select placeholder="Chọn mã văn bằng cũ">
                {certificates.map(cert =>
                  <Option key={cert.certificateId} value={cert.certificateId}>
                    {cert.certificateId}
                  </Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item
              label="Tên sinh viên"
              name="studentName"
              rules={[
                { required: true, message: "Vui lòng nhập tên sinh viên!" }
              ]}
            >
              <Input placeholder="Nhập tên sinh viên" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Lý do cấp lại"
                  name="reissueReason"
                  rules={[
                    { required: true, message: "Vui lòng chọn lý do cấp lại!" }
                  ]}
                >
                  <Select placeholder="Chọn lý do">
                    <Option value="mat">Mất</Option>
                    <Option value="hu-hong">Hư hỏng</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Ngày cấp lại"
                  name="reissueDate"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày cấp lại!" }
                  ]}
                >
                  <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Đơn vị cấp lại"
              name="reissuingUnit"
              rules={[
                { required: true, message: "Vui lòng chọn đơn vị cấp lại!" }
              ]}
            >
              <Select placeholder="Chọn đơn vị cấp lại">
                <Option value="phong-dao-tao">Phòng Đào tạo</Option>
                <Option value="ban-giam-hieu">Ban Giám hiệu</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
              >
                Xác nhận cấp lại
              </Button>
            </Form.Item>
          </Form>
          {/* Display the new certificate details if available */}
          {newCertificate &&
            <Card title="Thông Tin Văn Bằng Mới" style={{ marginTop: "16px" }}>
              <p>
                <strong>Mã văn bằng mới:</strong> {newCertificate.certificateId}
              </p>
              <p>
                <strong>Tên sinh viên:</strong> {newCertificate.studentName}
              </p>
              <p>
                <strong>Đơn vị cấp lại:</strong> {newCertificate.issuingUnit}
              </p>
              <p>
                <strong>Ngày cấp lại:</strong>{" "}
                {new Date(newCertificate.issueDate).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <strong>Mã văn bằng cũ:</strong>{" "}
                {newCertificate.oldCertificateId}
              </p>
              <p style={{ color: "red" }}>
                <strong>Trạng thái:</strong> Đang chờ xử lý
              </p>
            </Card>}
        </Card>
      </Col>

      {/* Right Section - Reissued Certificates List */}
      <Col span={8}>
        <Card
          title="Danh Sách Văn Bằng Đã Cấp Lại"
          bordered={true}
          style={{ borderRadius: "8px", backgroundColor: "#f9f9f9" }}
        >
          {currentItems.length === 0
            ? <p>Chưa có văn bằng nào được cấp lại.</p>
            : <List
                dataSource={currentItems}
                renderItem={cert =>
                  <List.Item>
                    <Card
                      title={cert.studentName}
                      style={{ width: "100%" }}
                      extra={<Tag color="red">Đang chờ xử lý</Tag>}
                    >
                      <p>
                        <strong>Mã văn bằng mới:</strong> {cert.certificateId}
                      </p>
                      {/* <p>
                        <strong>Mã văn bằng cũ:</strong> {cert.oldCertificateId}
                      </p> */}
                      <p>
                        <strong>Ngày cấp lại:</strong>{" "}
                        {new Date(cert.issueDate).toLocaleDateString("vi-VN")}
                      </p>
                      <p>
                        <strong>Lý do cấp lại:</strong>{" "}
                        {cert.reissueReason === "mat" ? "Mất" : "Hư hỏng"}
                      </p>
                      <p>
                        <strong>Đơn vị cấp lại:</strong> {cert.reissuingUnit}
                      </p>
                    </Card>
                  </List.Item>}
              />}
          {/* Pagination Component */}
          <Pagination
            current={currentPage}
            pageSize={itemsPerPage}
            total={reissuedCertificates.length}
            onChange={page => setCurrentPage(page)}
            showSizeChanger={false}
            style={{ marginTop: "10px", textAlign: "right" }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default UpdateCertificate;
