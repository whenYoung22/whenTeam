import { useEffect } from "react";
import { DatePicker, Form, Input, message, Modal, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { ProjectDetailResponse, UpdateProjectRequest } from "@shared/index";
import useProjectMutations from "@/hooks/useProjectMutations";

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
  const memberOptions = project.members.map((member) => ({
    label: member.name,
    value: member.id,
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

        <Form.Item name="memberIds" label="项目成员">
          <Select
            mode="multiple"
            placeholder="请选择项目成员"
            options={memberOptions}
            maxTagCount="responsive"
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
