import type { UserSummary } from "./user";
import type { DateOnly, IsoDateTime } from "../common/date";


// 这里没有 progress、taskCount、isFavorite，因为这些不是项目记录本身的基础字段
// progress 和 taskCount 是根据任务计算或查询出来的
// isFavorite 是“当前用户是否收藏”，属于用户和项目之间的关系结果
export interface Project {
  id: number;
  name: string;
  description: string;
  color: string;
  createdAt: IsoDateTime;
  dueDate: DateOnly;
}



// 代表项目列表卡片需要的数据，包含卡片会用到的项目 ID、名称、颜色，以及进度、任务数、收藏状态
export interface ProjectListItem extends Pick<Project, "id" | "name" | "color"> {
  progress: number;
  taskCount: number;
  isFavorite: boolean;
}



// 项目详情上方的看板所需要的数据
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
  memberIds: number[];
}


export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  dueDate?: DateOnly;
  memberIds?: number[];
}



// 总览上方的看板所需要的数据
export interface ProjectOverviewResponse {
  projectCount: number;
  weekTaskCount: number;
  collaborators: UserSummary[];
  collaboratorCount: number;
}
