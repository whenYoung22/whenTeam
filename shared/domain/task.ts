import type { DateOnly, IsoDateTime } from "../common/date";
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
  assigneeId: number;
  dueDate: DateOnly;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface TaskResponse extends Omit<Task, "assigneeId"> {
  assignee: UserSummary;
}


// 状态则由服务端默认设为 TODO
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId: number;
  dueDate: DateOnly;
}


// 负责人和截止日期只是不传时保持原样，不接受 null 清空
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
  dueDate?: DateOnly;
}
