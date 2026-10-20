import type { DateOnly, IsoDateTime } from "./date";
import type { UserSummary } from "./user";

export type TaskStatus = "TODO" | "DOING" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assigneeId: number | null;
  dueDate: DateOnly | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface TaskResponse extends Omit<Task, "assigneeId"> {
  assignee: UserSummary | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId: number;
  dueDate: DateOnly;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number | null;
  dueDate?: DateOnly | null;
}
