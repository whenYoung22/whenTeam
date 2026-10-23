import { useState, type Dispatch, type SetStateAction } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { Alert, Button, Empty, Spin } from "antd";

import DetailPanel from "@/components/ProjectDetailPage/DetailPanel";
import TaskList from "@/components/ProjectDetailPage/TaskList";
import CreateTaskModal from "@/components/ProjectDetailPage/CreateTaskModal";
import TaskDetailModal from "@/components/ProjectDetailPage/TaskDetailModal";
import useProjectDetailData from "@/hooks/useProjectDetailData";

import type {
  ProjectDetailResponse,
  ProjectListItem,
  TaskResponse,
} from "@shared/index";

interface ProjectOutletContext {
  setProjects: Dispatch<SetStateAction<ProjectListItem[]>>;
}

export default function ProjectDetailPage() {
  const { setProjects } = useOutletContext<ProjectOutletContext>();
  const { projectId } = useParams();
  const id = Number(projectId);
  const isValidId = Number.isSafeInteger(id) && id > 0;
  const { project, tasks, loading, error, retry } = useProjectDetailData(id);

  if (!isValidId) {
    return <Empty description="项目 ID 无效" />;
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          type="error"
          showIcon
          message="项目详情加载失败"
          description={error}
          action={
            <Button size="small" onClick={retry}>重试</Button>
          }
        />
      </div>
    );
  }

  if (loading || !project) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "96px 0",
        }}
      >
        <Spin size="large" tip="正在加载项目..." />
      </div>
    );
  }

  return (
    <ProjectDetailContent
      key={id}
      initialProject={project}
      initialTasks={tasks}
      setProjects={setProjects}
    />
  );
}

interface ProjectDetailContentProps {
  initialProject: ProjectDetailResponse;
  initialTasks: TaskResponse[];
  setProjects: Dispatch<SetStateAction<ProjectListItem[]>>;
}

function ProjectDetailContent({
  initialProject,
  initialTasks,
  setProjects,
}: ProjectDetailContentProps) {
  const [project, setProject] = useState(initialProject);
  const [tasks, setTasks] = useState(initialTasks);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

  const handleSaveProject = (updated: ProjectDetailResponse) => {
    setProject(updated);
    setProjects((projects) =>
      projects.map((item) =>
        item.id === updated.id
          ? {
              ...item,
              name: updated.name,
              color: updated.color,
              progress: updated.progress,
              taskCount: updated.taskCount,
              isFavorite: updated.isFavorite,
            }
          : item,
      ),
    );
  };

  const handleTaskCreated = (task: TaskResponse) => {
    setTasks((currentTasks) =>
      [...currentTasks, task].sort(
        (a, b) =>
          a.dueDate.localeCompare(b.dueDate) ||
          b.createdAt.localeCompare(a.createdAt),
      ),
    );

    const taskCount = project.taskCount + 1;
    const updatedProject = {
      ...project,
      taskCount,
      progress: Math.round(
        (tasks.filter((item) => item.status === "DONE").length / taskCount) *
          100,
      ),
    };
    setProject(updatedProject);
    setProjects((projects) =>
      projects.map((item) =>
        item.id === updatedProject.id
          ? {
              ...item,
              taskCount: updatedProject.taskCount,
              progress: updatedProject.progress,
            }
          : item,
      ),
    );
  };

  const handleTaskSave = (updatedTask: TaskResponse) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      ),
    );
    setSelectedTask(null);
  };

  return (
    <section className="project-detail-page">
      <DetailPanel project={project} onSave={handleSaveProject} />
      <TaskList
        tasks={tasks}
        onCreateTask={() => setCreateTaskOpen(true)}
        onTaskClick={setSelectedTask}
      />
      <CreateTaskModal
        open={createTaskOpen}
        projectId={project.id}
        projectDueDate={project.dueDate}
        projectMembers={project.members}
        onClose={() => setCreateTaskOpen(false)}
        onCreated={handleTaskCreated}
      />
      <TaskDetailModal
        task={selectedTask}
        projectDueDate={project.dueDate}
        projectMembers={project.members}
        onClose={() => setSelectedTask(null)}
        onSave={handleTaskSave}
      />
    </section>
  );
}
