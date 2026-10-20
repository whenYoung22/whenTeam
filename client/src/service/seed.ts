import type {
  ProjectDetailResponse,
  ProjectListItem,
  ProjectOverviewResponse,
  TaskPriority,
  TaskResponse,
  TaskStatus,
  User,
  UserSummary,
} from "@shared/index";

export const mockCollaborators: UserSummary[] = [
  { id: 1, name: "张宇" },
  { id: 2, name: "吴日天" },
  { id: 3, name: "刘博" },
  { id: 4, name: "李哥" },
];

export const mockCurrentUser: User = { id: 5, name: "闻一昂" };

const createdAt = "2026-10-01T00:00:00.000Z";

const makeTask = (
  id: number,
  title: string,
  description: string,
  priority: TaskPriority,
  assignee: UserSummary,
  dueDate: string,
  status: TaskStatus,
): TaskResponse => ({
  id,
  title,
  description,
  priority,
  assignee,
  dueDate,
  status,
  projectId: Math.floor(id / 100),
  createdAt,
  updatedAt: createdAt,
});

export const mockTasksByProject: Record<number, TaskResponse[]> = {
  1: [
    makeTask(101, "完成登录页面", "完成登录页面的开发和测试", "HIGH", mockCollaborators[0], "2026-10-18", "DONE"),
    makeTask(102, "实现项目总览页面", "实现项目总览页面的功能", "HIGH", mockCollaborators[1], "2026-10-20", "DOING"),
    makeTask(103, "实现项目详情页面", "实现项目详情页面的功能", "HIGH", mockCollaborators[2], "2026-10-22", "DOING"),
    makeTask(104, "设计任务列表组件", "设计任务列表组件", "MEDIUM", mockCollaborators[3], "2026-10-24", "TODO"),
    makeTask(105, "接入后端接口", "接入后端接口", "MEDIUM", mockCollaborators[1], "2026-10-28", "TODO"),
  ],
  2: [
    makeTask(201, "复习 React 基础", "复习 React 基础知识", "HIGH", mockCollaborators[0], "2026-10-16", "DONE"),
    makeTask(202, "学习 React Router", "学习 React Router 的使用方法", "HIGH", mockCollaborators[1], "2026-10-18", "DOING"),
    makeTask(203, "学习 Express 基础", "学习 Express 基础", "MEDIUM", mockCollaborators[3], "2026-10-22", "TODO"),
    makeTask(204, "复习 TypeScript", "复习 TypeScript", "LOW", mockCollaborators[2], "2026-10-25", "TODO"),
  ],
  3: [
    makeTask(301, "完成课程需求分析", "完成课程需求分析", "HIGH", mockCollaborators[1], "2026-10-17", "DONE"),
    makeTask(302, "完成系统设计", "完成系统设计", "HIGH", mockCollaborators[2], "2026-10-19", "DONE"),
    makeTask(303, "编写课程报告", "编写课程报告", "MEDIUM", mockCollaborators[3], "2026-10-23", "DOING"),
    makeTask(304, "准备项目演示", "准备项目演示", "LOW", mockCollaborators[0], "2026-10-27", "TODO"),
  ],
};

export const mockProjectDetails: ProjectDetailResponse[] = [
  {
    id: 1,
    name: "whenTeam 开发",
    description: "一个用于团队协作、项目管理和任务跟踪的全栈练习项目。",
    color: "#9c55bd",
    progress: 65,
    taskCount: mockTasksByProject[1].length,
    members: mockCollaborators,
    createdAt: "2026-09-20T00:00:00.000Z",
    dueDate: "2026-11-30",
    isFavorite: true,
  },
  {
    id: 2,
    name: "vue+Agent",
    description: "规划 React、TypeScript、Node.js 等技术的学习进度。",
    color: "#539433",
    progress: 40,
    taskCount: mockTasksByProject[2].length,
    members: mockCollaborators,
    createdAt: "2026-09-25T00:00:00.000Z",
    dueDate: "2026-12-31",
    isFavorite: false,
  },
  {
    id: 3,
    name: "RAG",
    description: "管理课程作业、报告编写和项目演示等任务。",
    color: "#d38d43",
    progress: 85,
    taskCount: mockTasksByProject[3].length,
    members: mockCollaborators,
    createdAt: "2026-09-15T00:00:00.000Z",
    dueDate: "2026-10-30",
    isFavorite: true,
  },
];

export const mockProjects: ProjectListItem[] = mockProjectDetails.map(
  ({ id, name, description, color, createdAt, dueDate, progress, taskCount, isFavorite }) => ({
    id,
    name,
    description,
    color,
    createdAt,
    dueDate,
    progress,
    taskCount,
    isFavorite,
  }),
);

export const mockOverviewData: ProjectOverviewResponse = {
  projectCount: mockProjects.length,
  weekTaskCount: 12,
  collaborators: mockCollaborators,
  collaboratorCount: 8,
};
