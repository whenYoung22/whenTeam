import { useParams } from "react-router-dom";
import { useState } from "react";

import { Empty } from "antd";

import ProjectPanel from "@/components/ProjectDetailPage/ProjectPanel";
import TaskList from "@/components/ProjectDetailPage/TaskList";
import CreateTaskModal from "@/components/ProjectDetailPage/CreateTaskModal";
import TaskDetailModal from "@/components/ProjectDetailPage/TaskDetailModal";

import { mockProjectDetails, mockTasksByProject } from "@/service/seed";

import type { TaskResponse } from "@shared/index";


export default function ProjectDetailPage() {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

  const { projectId } = useParams();

  // URL 参数是字符串，需要转换为数字
  const id = Number(projectId);

  // 查找项目详情
  const project = mockProjectDetails.find((item) => item.id === id);

  const [tasks, setTasks] = useState<TaskResponse[]>(
    () => mockTasksByProject[id] ?? [],
  );

  // 项目不存在时显示空状态（注意：hooks 必须都在这个 return 之前）
  if (!project || !Number.isInteger(id)) {
    return <Empty description="项目不存在" />;
  }

  /** 保存编辑结果：替换对应 id 的任务 */
  const handleSaveTask = (updated: TaskResponse) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  return (
    <section className="project-detail-page">
      <ProjectPanel project={project} />

      <TaskList
        tasks={tasks}
        onCreateTask={() => setCreateTaskOpen(true)}
        onTaskClick={(task) => setSelectedTask(task)}
      />

      <CreateTaskModal
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={handleSaveTask}
      />
    </section>
  );
}
