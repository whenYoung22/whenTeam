import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button, Form, Input, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

import { register } from "@/api/auth";

import "../LoginPage/index.css";

const { Title, Text } = Typography;

interface RegisterFormValues {
  name: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);

    try {
      await register({
        name: values.name,
        password: values.password,
      });
      message.success("注册成功，请登录");
      navigate("/login", { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "注册失败，请稍后重试");
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
          <Title level={4}>创建账号</Title>
          <Text type="secondary">注册后即可开始使用 whenTeam</Text>
        </div>

        <Form<RegisterFormValues>
          name="register"
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
              { max: 100, message: "用户名不能超过 100 个字符" },
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
              { min: 8, message: "密码至少需要 8 个字符" },
              {
                validator: async (_rule, value: string | undefined) => {
                  if (value && new TextEncoder().encode(value).length > 72) {
                    throw new Error("密码长度不能超过 72 个字节");
                  }
                },
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="至少 8 个字符"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请再次输入密码" },
              ({ getFieldValue }) => ({
                validator(_, value: string | undefined) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
              autoComplete="new-password"
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
              注册并登录
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <Text type="secondary">已有账号？</Text>{" "}
          <Link to="/login">返回登录</Link>
        </div>

        <div className="login-footer">
          <Text type="secondary">whenTeam · 团队任务协作平台</Text>
        </div>
      </div>
    </div>
  );
}
