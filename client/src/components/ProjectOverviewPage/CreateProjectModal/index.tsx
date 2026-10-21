import { DatePicker, Form, Input, Modal, Select } from "antd";
import type { Dayjs } from "dayjs";
import type { CreateProjectRequest } from "@shared/index";

import { mockCollaborators } from "@/service/seed";

interface ProjectFormValues {
  name: string;
  description?: string;
  dueDate: Dayjs;
  memberIds: number[];
}

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

const MEMBER_OPTIONS = mockCollaborators.map((user) => ({
  label: user.name,
  value: user.id,
}));

export default function CreateProjectModal({
  open,
  onClose,
}: CreateProjectModalProps) {
  const [form] = Form.useForm<ProjectFormValues>();

  const handleSubmit = async () => {
    // TODO: 后续接 service，成功后通知页面刷新列表
    const values = await form.validateFields();
    const request: CreateProjectRequest = {
      ...values,
      dueDate: values.dueDate.format("YYYY-MM-DD"),
    };
    console.log("创建项目：", request);
    onClose();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="新建项目"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="创建"
      cancelText="取消"
      centered
      mask={{ closable: false }}
      keyboard={false}
    >
      <Form<ProjectFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label="项目名称"
          rules={[{ required: true, message: "请输入项目名称" }]}
        >
          <Input placeholder="请输入项目名称" maxLength={30} showCount />
        </Form.Item>

        <Form.Item name="description" label="项目描述">
          <Input.TextArea
            placeholder="请输入项目描述（选填）"
            rows={3}
            maxLength={200}
            showCount
            style={{ resize: "none" }}
          />
        </Form.Item>

        <Form.Item
          name="memberIds"
          label="项目成员"
          rules={[
            { required: true, message: "请选择至少一位项目成员" },
            {
              type: "array",
              min: 1,
              message: "项目至少需要一位成员",
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="请选择至少一位项目成员"
            options={MEMBER_OPTIONS}
            maxTagCount="responsive" // 选中多了自动折叠成 +N
          />
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="截止日期"
          rules={[{ required: true, message: "请选择截止日期" }]}
        >
          <DatePicker
            placeholder="请选择截止日期"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
