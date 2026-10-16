import { DatePicker, Form, Input, Modal, Select } from "antd";
import type { Dayjs } from "dayjs";
import type { TaskPriority } from "@/service/seed";

interface TaskFormValues {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignee: string;
  dueDate: Dayjs;
}

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
}

/** 负责人选项：占位数据，后续换成接口返回的成员列表 */
const ASSIGNEE_OPTIONS = [
  { value: "张伟", label: "张伟" },
  { value: "吴昊", label: "吴昊" },
  { value: "王强", label: "王强" },
  { value: "赵敏", label: "赵敏" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

export default function CreateTaskModal({
  open,
  onClose,
}: CreateTaskModalProps) {
  const [form] = Form.useForm<TaskFormValues>();

  const handleSubmit = async () => {
    // TODO: 后续接 service，成功后通知页面刷新列表
    const values = await form.validateFields();
    console.log("创建任务：", values);
    onClose();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="创建任务"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="创建"
      cancelText="取消"
      mask={{ closable: false }}
      keyboard={false}
      centered
    >
      <Form<TaskFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ priority: "medium" }}
      >
        <Form.Item
          name="title"
          label="任务标题"
          rules={[{ required: true, message: "请输入任务标题" }]}
        >
          <Input placeholder="请输入任务标题" maxLength={50} showCount />
        </Form.Item>

        <Form.Item name="description" label="任务描述">
          <Input.TextArea
            placeholder="请输入任务描述（选填）"
            rows={3}
            maxLength={200}
            showCount
            style={{ resize: 'none' }} 
          />
        </Form.Item>

        <Form.Item
          name="priority"
          label="优先级"
          rules={[{ required: true, message: "请选择优先级" }]}
        >
          <Select placeholder="请选择优先级" options={PRIORITY_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="assignee"
          label="负责人"
          rules={[{ required: true, message: "请选择负责人" }]}
        >
          <Select
            placeholder="请选择负责人"
            options={ASSIGNEE_OPTIONS}
            showSearch
          />
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="截止日期"
          rules={[{ required: true, message: "请选择截止日期" }]}
        >
          <DatePicker placeholder="请选择截止日期" style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
