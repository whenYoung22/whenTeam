export type TaskStatus = "TODO" | "DOING" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  createdAt: Date;
  updatedAt: Date;
}
