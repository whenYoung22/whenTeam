import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
      <svg
        className="login-fish"
        viewBox="0 0 220 140"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M47 70c22-28 62-39 99-26 14 5 25 14 34 26-9 12-20 21-34 26-37 13-77 2-99-26Z"
          fill="#fff"
          fillOpacity=".72"
          stroke="#7067ef"
          strokeOpacity=".42"
          strokeWidth="3"
        />
        <path
          d="m48 70-32-25 8 25-8 25 32-25Z"
          fill="#7067ef"
          fillOpacity=".2"
          stroke="#7067ef"
          strokeOpacity=".42"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M105 48c7 9 10 16 10 22s-3 13-10 22c18-4 30-12 38-22-8-10-20-18-38-22Z"
          fill="#43c4be"
          fillOpacity=".2"
        />
        <circle cx="158" cy="64" r="3.5" fill="#48558c" fillOpacity=".65" />
        <path
          d="M168 77c-5 5-11 7-17 7"
          stroke="#48558c"
          strokeOpacity=".45"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="193" cy="40" r="5" stroke="#43c4be" strokeOpacity=".55" strokeWidth="2" />
        <circle cx="208" cy="25" r="3" stroke="#43c4be" strokeOpacity=".45" strokeWidth="2" />
      </svg>

      <div className="login-watermarks" aria-hidden="true">
        <span className="login-watermark-title">whenTeam</span>
        <span className="login-watermark-subtitle">
          团队协作，让每个任务井然有序
        </span>
      </div>

      <div className="login-card">
        <div className="login-logo">W</div>
        <div className="login-form-header">
          <Title level={3}>欢迎回来</Title>
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
          <Text type="secondary">还没有账号？</Text>{" "}
          <Link to="/register">立即注册</Link>
        </div>

        <div className="login-footer">
          <Text type="secondary">
            whenTeam · 团队任务协作平台
          </Text>
        </div>
      </div>
    </div>
  );
}