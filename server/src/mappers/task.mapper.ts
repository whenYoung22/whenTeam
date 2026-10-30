import type { TaskResponse } from "../../../shared/index.js";

import { toUserSummary } from "./user.mapper.js";

export function toTaskResponse(task: {
  id: number;
  title: string;
  description: string | null;
  status: TaskResponse["status"];
  priority: TaskResponse["priority"];
  projectId: number;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  assignee: {
    id: number;
    name: string;
    avatarUrl: string | null;
  };
}): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    projectId: task.projectId,
    dueDate: task.dueDate.toISOString().slice(0, 10),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    assignee: toUserSummary(task.assignee),
  };
}
