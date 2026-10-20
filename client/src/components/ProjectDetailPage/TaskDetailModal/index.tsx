import { useEffect } from "react";
import { DatePicker, Form, Input, Modal, Select } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { TaskPriority, TaskResponse, TaskStatus } from "@shared/index";

import { mockCollaborators } from "@/service/seed";

interface TaskFormValues {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId: number;
  dueDate: Dayjs;
  status: TaskStatus;
}

interface TaskDetailModalProps {
  task: TaskResponse | null;
  onClose: () => void;
  /** 保存编辑结果：由页面负责更新本地数据 */
  onSave: (task: TaskResponse) => void;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "HIGH", label: "高" },
  { value: "MEDIUM", label: "中" },
  { value: "LOW", label: "低" },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "待开始" },
  { value: "DOING", label: "进行中" },
  { value: "DONE", label: "已完成" },
];

/** 负责人选项：占位数据，后续换成接口返回的成员列表 */
const ASSIGNEE_OPTIONS = mockCollaborators.map((user) => ({
  label: user.name,
  value: user.id,
}));

export default function TaskDetailModal({
  task,
  onClose,
  onSave,
}: TaskDetailModalProps) {
  const [form] = Form.useForm<TaskFormValues>();

  /** 弹窗打开（task 变化）时，把任务数据回填进表单 */
  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        ...task,
        assigneeId: task.assignee?.id,
        dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [task, form]);

  const handleSave = async () => {
    if (!task) return;
    const values = await form.validateFields();
    const { assigneeId, ...formValues } = values;
    onSave({
      ...task,
      ...formValues,
      assignee:
        mockCollaborators.find((user) => user.id === assigneeId) ?? null,
      description: values.description ?? "",
      dueDate: values.dueDate.format("YYYY-MM-DD"),
    });
    onClose();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="任务详情"
      open={!!task}
      onOk={handleSave}
      onCancel={handleCancel}
      okText="保存"
      cancelText="取消"
      mask={{ closable: false }}
      keyboard={false} // 禁止 esc 关闭弹窗，避免误操作
      destroyOnHidden // 关闭后销毁表单，避免残留上一次的值
      centered
    >
      <Form<TaskFormValues> form={form} layout="vertical" requiredMark={false}>
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
            rows={2}
            maxLength={200}
            showCount
            style={{ resize: "none" }}
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
          name="assigneeId"
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

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: "请选择状态" }]}
        >
          <Select placeholder="请选择状态" options={STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
