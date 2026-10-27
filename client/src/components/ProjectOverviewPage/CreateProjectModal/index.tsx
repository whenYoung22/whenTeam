import { Alert, DatePicker, Form, Input, message, Modal, Select } from "antd";
import type { Dayjs } from "dayjs";
import type {
  CreateProjectRequest,
  ProjectDetailResponse,
} from "@shared/index";

import useProjectMutations from "@/hooks/useProjectMutations";
import useUserDirectory from "@/hooks/useUserDirectory";

interface ProjectFormValues {
  name: string;
  description?: string;
  dueDate: Dayjs;
  memberIds: number[];
}

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (project: ProjectDetailResponse) => Promise<void>;
}

export default function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [form] = Form.useForm<ProjectFormValues>();
  const { createProject, isPending } = useProjectMutations();
  const {
    users,
    loading: usersLoading,
    error: usersError,
    retry,
  } = useUserDirectory(open);

  const memberOptions = users.map((user) => ({
    label: user.name,
    value: user.id,
  }));

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const request: CreateProjectRequest = {
        name: values.name.trim(),
        description: values.description?.trim(),
        dueDate: values.dueDate.format("YYYY-MM-DD"),
        memberIds: values.memberIds ?? [],
      };
      const project = await createProject(request);
      await onCreated(project);
      form.resetFields();
      message.success("项目创建成功");
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "errorFields" in error
      ) {
        return;
      }
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("创建项目失败，请重试");
      }
    }
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
      confirmLoading={isPending}
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

        <Form.Item label="项目成员" extra="项目创建者会自动加入此项目中">
          {usersError && (
            <Alert
              type="error"
              showIcon
              title="用户列表加载失败"
              description={usersError}
              action={
                <button type="button" onClick={retry}>
                  重试
                </button>
              }
              style={{ marginBottom: 8 }}
            />
          )}
          <Form.Item name="memberIds" noStyle>
            <Select
              mode="multiple"
              placeholder="可选：添加项目成员"
              options={memberOptions}
              loading={usersLoading}
              disabled={usersLoading || Boolean(usersError)}
              showSearch={{ optionFilterProp: "label" }}
              maxTagCount="responsive" // 选中多了自动折叠成 +N
            />
          </Form.Item>
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
