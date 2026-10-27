import { useEffect } from "react";
import { Alert, DatePicker, Form, Input, message, Modal, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { ProjectDetailResponse, UpdateProjectRequest } from "@shared/index";
import useProjectMutations from "@/hooks/useProjectMutations";
import useUserDirectory from "@/hooks/useUserDirectory";

interface ProjectFormValues {
  name: string;
  description?: string;
  dueDate: Dayjs;
  memberIds: number[];
}

interface EditProjectModalProps {
  open: boolean;
  project: ProjectDetailResponse;
  onClose: () => void;
  onSave: (project: ProjectDetailResponse) => void;
}

export default function EditProjectModal({
  open,
  project,
  onClose,
  onSave,
}: EditProjectModalProps) {
  const [form] = Form.useForm<ProjectFormValues>();
  const { updateProject, isPending } = useProjectMutations();
  const { users, loading: usersLoading, error: usersError, retry } =
    useUserDirectory(open);
  const memberOptions = users.map((user) => ({
    label: user.name,
    value: user.id,
  }));

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
        dueDate: dayjs(project.dueDate),
        memberIds: project.members.map((member) => member.id),
      });
    }
  }, [form, open, project]);

  const handleFinish = async (values: ProjectFormValues) => {
    const memberIds = values.memberIds ?? [];
    const request: UpdateProjectRequest = {
      name: values.name.trim(),
      description: values.description?.trim() ?? "",
      dueDate: values.dueDate.format("YYYY-MM-DD"),
      memberIds,
    };

    try {
      const updatedProject = await updateProject(project.id, request);
      onSave(updatedProject);
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "更新项目失败，请重试",
      );
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="编辑项目"
      open={open}
      onOk={() => form.submit()}
      confirmLoading={isPending}
      onCancel={handleCancel}
      okText="保存"
      cancelText="取消"
      centered
      mask={{ closable: false }}
      keyboard={false}
      destroyOnHidden
    >
      <Form<ProjectFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleFinish}
      >
        <Form.Item
          name="name"
          label="项目名称"
          rules={[{ required: true, whitespace: true, message: "请输入项目名称" }]}
        >
          <Input placeholder="请输入项目名称" maxLength={100} showCount />
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
          label="项目成员"
          extra="项目创建者始终是项目成员；即使取消选择，保存后也会保留。"
        >
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
              placeholder="请选择项目成员"
              options={memberOptions}
              loading={usersLoading}
              disabled={usersLoading || Boolean(usersError)}
              showSearch={{ optionFilterProp: 'label' }} 
              maxTagCount="responsive"
            />
          </Form.Item>
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
