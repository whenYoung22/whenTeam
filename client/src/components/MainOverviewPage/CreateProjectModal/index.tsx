import { DatePicker, Form, Input, Modal, Select } from "antd";
import type { Dayjs } from "dayjs";

interface ProjectFormValues {
  name: string;
  description?: string;
  color: string;
  dueDate?: Dayjs;
  members: string[];
}

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

const MEMBER_OPTIONS = [
  { value: "张伟", label: "张伟" },
  { value: "吴昊", label: "吴昊" },
  { value: "王强", label: "王强" },
  { value: "赵敏", label: "赵敏" },
];

export default function CreateProjectModal({
  open,
  onClose,
}: CreateProjectModalProps) {
  const [form] = Form.useForm<ProjectFormValues>();

  const handleSubmit = async () => {
    // TODO: 后续接 service，成功后通知页面刷新列表
    const values = await form.validateFields();
    console.log("创建项目：", {
      ...values,
      dueDate: values.dueDate?.format("YYYY-MM-DD"),
    });
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

        <Form.Item name="members" label="项目成员">
          <Select
            mode="multiple"
            placeholder="请选择项目成员（选填）"
            options={MEMBER_OPTIONS}
            maxTagCount="responsive" // 选中多了自动折叠成 +N
          />
        </Form.Item>

        <Form.Item name="dueDate" label="截止日期">
          <DatePicker
            placeholder="请选择截止日期（选填）"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
