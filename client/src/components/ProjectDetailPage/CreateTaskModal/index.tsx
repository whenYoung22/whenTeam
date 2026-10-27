import { DatePicker, Form, Input, message, Modal, Select } from "antd";
import useTaskMutations from "@/hooks/useTaskMutations";
import type { Dayjs } from "dayjs";
import type {
  CreateTaskRequest,
  DateOnly,
  TaskPriority,
  TaskResponse,
  UserSummary,
} from "@shared/index";


interface TaskFormValues {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId: number;
  dueDate: Dayjs;
}

interface CreateTaskModalProps {
  open: boolean;
  projectId: number;
  projectDueDate: DateOnly;
  projectMembers: UserSummary[];
  onClose: () => void;
  onCreated: (task: TaskResponse) => void;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "HIGH", label: "高" },
  { value: "MEDIUM", label: "中" },
  { value: "LOW", label: "低" },
];

export default function CreateTaskModal({
  open,
  projectId,
  projectDueDate,
  projectMembers,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const [form] = Form.useForm<TaskFormValues>();
  const { createTask, isPending } = useTaskMutations();
  const today = new Date().toISOString().slice(0, 10);
  const assigneeOptions = projectMembers.map((member) => ({
    label: member.name,
    value: member.id,
  }));

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const request: CreateTaskRequest = {
        title: values.title.trim(),
        description: values.description?.trim(),
        priority: values.priority,
        assigneeId: values.assigneeId,
        dueDate: values.dueDate.format("YYYY-MM-DD"),
      };
      const task = await createTask(projectId, request);
      onCreated(task);
      form.resetFields();
      onClose();
      message.success("任务创建成功");
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "errorFields" in error
      ) {
        return;
      }
      message.error(
        error instanceof Error ? error.message : "创建任务失败，请重试",
      );
    }
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
      confirmLoading={isPending}
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
        initialValues={{ priority: "MEDIUM" }}
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
          name="assigneeId"
          label="负责人"
          rules={[{ required: true, message: "请选择负责人" }]}
        >
          <Select
            placeholder="请选择负责人"
            options={assigneeOptions}
            showSearch
          />
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="截止日期"
          rules={[
            { required: true, message: "请选择截止日期" },
            {
              validator: async (_, dueDate: Dayjs | undefined) => {
                if (dueDate) {
                  const selectedDate = dueDate.format("YYYY-MM-DD");
                  if (selectedDate < today) {
                    throw new Error("任务截止日期不能早于今天");
                  }
                  if (selectedDate > projectDueDate) {
                    throw new Error("任务截止日期不能晚于项目截止日期");
                  }
                }
              },
            },
          ]}
        >
          <DatePicker
            placeholder="请选择截止日期"
            style={{ width: "100%" }}
            disabledDate={(date) => {
              const selectedDate = date.format("YYYY-MM-DD");
              return selectedDate < today || selectedDate > projectDueDate;
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
