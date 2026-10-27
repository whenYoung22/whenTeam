import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Form, Input, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

import { login } from "@/api/auth";
import { setAuthToken } from "@/utils/authToken";

import "./index.css";

const { Title, Text } = Typography;

interface LoginFormValues {
  name: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const result = await login(values);
      setAuthToken(result.token);
      navigate("/", { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">W</div>
          <Title level={2} className="login-title">
            whenTeam
          </Title>
          <Text className="login-subtitle">
            团队协作，让每个任务井然有序
          </Text>
        </div>

        <div className="login-form-header">
          <Title level={4}>欢迎回来</Title>
          <Text type="secondary">登录你的账号以继续使用</Text>
        </div>

        <Form<LoginFormValues>
          name="login"
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          autoComplete="on"
          size="large"
        >
          <Form.Item
            label="用户名"
            name="name"
            rules={[
              { required: true, message: "请输入用户名" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item className="login-submit-item">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="login-submit"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <Text type="secondary">
            whenTeam · 团队任务协作平台
          </Text>
        </div>
      </div>
    </div>
  );
}