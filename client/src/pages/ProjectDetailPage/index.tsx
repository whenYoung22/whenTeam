import { Empty } from "antd";
import { useParams } from "react-router-dom";

import ProjectPanel from "@/components/ProjectPanel";
import TaskList from "@/components/TaskList";

import {
  mockProjectDetails,
  mockTasksByProject,
} from "@/service/seed";

import "./index.css";

export default function ProjectDetailPage() {
  const { projectId } = useParams();

  // URL 参数是字符串，需要转换为数字
  const id = Number(projectId);

  // 查找项目详情
  const project = mockProjectDetails.find(
    (item) => item.id === id,
  );

  // 项目不存在时显示空状态
  if (!project || !Number.isInteger(id)) {
    return <Empty description="项目不存在" />;
  }

  // 获取当前项目的任务列表
  const tasks = mockTasksByProject[id] ?? [];

  return (
    <section className="project-detail-page">
      <ProjectPanel project={project} />

      <TaskList tasks={tasks} />
    </section>
  );
}