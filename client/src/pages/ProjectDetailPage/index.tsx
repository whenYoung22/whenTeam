import {
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { Alert, Button, Empty, message, Spin } from "antd";

import DetailPanel from "@/components/ProjectDetailPage/DetailPanel";
import TaskList from "@/components/ProjectDetailPage/TaskList";
import CreateTaskModal from "@/components/ProjectDetailPage/CreateTaskModal";
import TaskDetailModal from "@/components/ProjectDetailPage/TaskDetailModal";

import useProjectDetailData from "@/hooks/useProjectDetailData";
import { setProjectFavorite } from "@/api/project";

import type { ProjectDetailResponse,ProjectListItem,TaskResponse } from "@shared/index";

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
          title="项目详情加载失败"
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
        <Spin size="large" description="正在加载项目..." />
      </div>
    );
  }

  return (
    <ProjectDetailContent key={id} initialProject={project} initialTasks={tasks} setProjects={setProjects}/>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [project, setProject] = useState(initialProject);
  const [tasks, setTasks] = useState(initialTasks);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [favoritePending, setFavoritePending] = useState(false);
  const taskIdParam = searchParams.get("taskId");
  const taskId = taskIdParam === null ? null : Number(taskIdParam);
  const selectedTask =
    taskId !== null && Number.isSafeInteger(taskId) && taskId > 0
      ? tasks.find((task) => task.id === taskId) ?? null
      : null;

  const clearTaskSelection = () => {
    if (!searchParams.has("taskId")) return;
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("taskId");
    setSearchParams(nextSearchParams, { replace: true });
  };
  const handleTaskClick = (task: TaskResponse) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("taskId", String(task.id));
    setSearchParams(nextSearchParams, { replace: true });
  };

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

  const handleFavoriteToggle = async () => {
    setFavoritePending(true);
    try {
      const isFavorite = await setProjectFavorite(
        project.id,
        !project.isFavorite,
      );
      setProject((current) => ({ ...current, isFavorite }));
      setProjects((projects) =>
        projects.map((item) =>
          item.id === project.id ? { ...item, isFavorite } : item,
        ),
      );
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "更新收藏状态失败",
      );
    } finally {
      setFavoritePending(false);
    }
  };

  const handleTaskCreated = (task: TaskResponse) => {
    const updatedTasks = [...tasks, task].sort(
      (a, b) =>
        a.dueDate.localeCompare(b.dueDate) ||
        b.createdAt.localeCompare(a.createdAt),
    );
    setTasks(updatedTasks);
    updateTaskMetrics(updatedTasks);
  };

  const handleTaskSave = (updatedTask: TaskResponse) => {
    const updatedTasks = tasks
      .map((task) => (task.id === updatedTask.id ? updatedTask : task))
      .sort(
        (a, b) =>
          a.dueDate.localeCompare(b.dueDate) ||
          b.createdAt.localeCompare(a.createdAt),
      );
    setTasks(updatedTasks);
    updateTaskMetrics(updatedTasks);
    clearTaskSelection();
  };

  const updateTaskMetrics = (updatedTasks: TaskResponse[]) => {
    const taskCount = updatedTasks.length;
    const progress =
      taskCount === 0
        ? 0
        : Math.round(
            (updatedTasks.filter((task) => task.status === "DONE").length /
              taskCount) *
              100,
          );

    setProject((currentProject) => ({
      ...currentProject,
      taskCount,
      progress,
    }));
    setProjects((projects) =>
      projects.map((item) =>
        item.id === project.id ? { ...item, taskCount, progress } : item,
      ),
    );
  };

  return (
    <section className="project-detail-page">
      <DetailPanel
        project={project}
        onSave={handleSaveProject}
        onFavoriteToggle={handleFavoriteToggle}
        favoritePending={favoritePending}
      />

      <TaskList
        tasks={tasks}
        onCreateTask={() => setCreateTaskOpen(true)}
        onTaskClick={handleTaskClick}
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
        onClose={clearTaskSelection}
        onSave={handleTaskSave}
      />
    </section>
  );
}
