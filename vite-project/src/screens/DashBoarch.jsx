// src/components/Dashboard.js
import React from "react";
import { Row, Col, Card, Typography } from "antd";
import { Pie, Column, Line } from "@ant-design/charts";

const { Title } = Typography;

const DashBoarch = () => {
  // Dữ liệu giả lập cho biểu đồ
  const userData = [
    { type: "Quản trị viên", value: 20 },
    { type: "Người dùng", value: 80 }
  ];

  const unitData = [
    { month: "Tháng 1", units: 5 },
    { month: "Tháng 2", units: 8 },
    { month: "Tháng 3", units: 6 },
    { month: "Tháng 4", units: 12 },
    { month: "Tháng 5", units: 10 }
  ];

  const certificateData = [
    { date: "01-10", value: 3 },
    { date: "02-10", value: 7 },
    { date: "03-10", value: 5 },
    { date: "04-10", value: 10 },
    { date: "05-10", value: 12 }
  ];

  // Cấu hình biểu đồ tròn cho phân bố người dùng
  const userPieConfig = {
    appendPadding: 10,
    data: userData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: {
      type: "outer",
      content: "{name} {percentage}"
    },
    interactions: [{ type: "element-active" }],
    height: 400 // Set height for Pie chart
  };

  // Cấu hình biểu đồ cột cho số lượng đơn vị theo tháng
  const unitColumnConfig = {
    data: unitData,
    xField: "month",
    yField: "units",
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 0.6
      }
    },
    xAxis: { label: { autoHide: true, autoRotate: false } },
    meta: {
      month: { alias: "Tháng" },
      units: { alias: "Số lượng đơn vị" }
    },
    height: 400 // Set height for Column chart
  };

  // Cấu hình biểu đồ đường cho số chứng chỉ đã cấp theo ngày
  const certificateLineConfig = {
    data: certificateData,
    xField: "date",
    yField: "value",
    smooth: true,
    point: {
      size: 5,
      shape: "diamond"
    },
    label: {
      style: {
        fill: "#5B8FF9",
        opacity: 0.6
      }
    },
    height: 400 // Set height for Line chart
  };

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]}>
        {/* Biểu đồ phân bố người dùng */}
        <Col span={8}>
          <Card title="Phân bố người dùng" bordered>
            <Pie {...userPieConfig} />
          </Card>
        </Col>

        {/* Biểu đồ số lượng đơn vị theo tháng */}
        <Col span={8}>
          <Card title="Số lượng đơn vị theo tháng" bordered>
            <Column {...unitColumnConfig} />
          </Card>
        </Col>

        {/* Biểu đồ số chứng chỉ đã cấp theo ngày */}
        <Col span={8}>
          <Card title="Số chứng chỉ đã cấp theo ngày" bordered>
            <Line {...certificateLineConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashBoarch;
