import type { ProjectDetailResponse, ProjectListItem } from "../../../shared/index.js";

import { toUserSummary } from "./user.mapper.js";

type ProjectTaskStatus = { status: string };

type ProjectDetailData = {
  id: number;
  name: string;
  description: string | null;
  color: string;
  createdAt: Date;
  dueDate: Date;
  tasks: ProjectTaskStatus[];
  members: {
    user: {
      id: number;
      name: string;
      avatarUrl: string | null;
    };
  }[];
};

function getTaskMetrics(tasks: ProjectTaskStatus[]) {
  const taskCount = tasks.length;
  const completedCount = tasks.filter((task) => task.status === "DONE").length;

  return {
    taskCount,
    progress:
      taskCount === 0 ? 0 : Math.round((completedCount / taskCount) * 100),
  };
}

export function toProjectListItem(project: {
  id: number;
  name: string;
  color: string;
  tasks: ProjectTaskStatus[];
  favorites: { projectId: number }[];
}): ProjectListItem {
  const { taskCount, progress } = getTaskMetrics(project.tasks);

  return {
    id: project.id,
    name: project.name,
    color: project.color,
    progress,
    taskCount,
    isFavorite: project.favorites.length > 0,
  };
}

export function toProjectDetailResponse(
  project: ProjectDetailData,
  isFavorite = false,
): ProjectDetailResponse {
  const { taskCount, progress } = getTaskMetrics(project.tasks);

  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    color: project.color,
    createdAt: project.createdAt.toISOString(),
    dueDate: project.dueDate.toISOString().slice(0, 10),
    progress,
    taskCount,
    isFavorite,
    members: project.members.map(({ user }) => toUserSummary(user)),
  };
}
