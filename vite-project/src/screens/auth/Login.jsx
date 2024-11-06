import { Form, Input, Button, Layout, Typography } from "antd";

const { Title } = Typography;
const { Content } = Layout;

const Login = () => {
  const onFinish = values => {
    console.log("Received values:", values);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage:
            "url('https://firebasestorage.googleapis.com/v0/b/project-kanvan.appspot.com/o/af5f83ff8d28380c635325ac09ecaf5b.jpg?alt=media&token=54b6698f-79f6-42f5-a1c6-8e3cdf1ff5cb')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            padding: "24px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "8px",
            maxWidth: "500px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <img
            src="https://firebasestorage.googleapis.com/v0/b/project-kanvan.appspot.com/o/808271258c41f304080a2bed1d411582.png?alt=media&token=df310bb5-7a03-44f5-b27f-3408301ad77a"
            alt="Logo"
            style={{ marginBottom: "20px", width: "350px" }}
          />
          <Form
            name="login_form"
            onFinish={onFinish}
            layout="vertical"
            style={{ width: "100%" }}
          >
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              ]}
              allowClear
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
      </Content>
    </Layout>
  );
};

export default Login;
