import type { UserSummary } from "./user";
import type { DateOnly, IsoDateTime } from "../common/date";

export interface Project {
  id: number;
  name: string;
  description: string;
  color: string;
  createdAt: IsoDateTime;
  dueDate: DateOnly;
}

export interface ProjectListItem extends Pick<Project, "id" | "name" | "color"> {
  progress: number;
  taskCount: number;
  isFavorite: boolean;
}

export interface ProjectDetailResponse extends Project {
  progress: number;
  taskCount: number;
  isFavorite: boolean;
  members: UserSummary[];
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  dueDate: DateOnly;
  memberIds?: number[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  dueDate?: DateOnly;
  memberIds?: number[];
}

export interface ProjectOverviewResponse {
  projectCount: number;
  weekTaskCount: number;
  collaborators: UserSummary[];
  collaboratorCount: number;
}
