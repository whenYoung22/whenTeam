import type { ProjectGridItem } from "@/components/ProjectGrid";
import type { ProjectPanelData, ProjectMember } from "@/components/ProjectPanel";
import type { TaskItem } from "@/components/TaskList";

// 项目成员
const members: ProjectMember[] = [
  { id: 1, name: "林" },
  { id: 2, name: "周" },
  { id: 3, name: "陈" },
  { id: 4, name: "许" },
];

// 按项目 ID 保存任务数据
export const mockTasksByProject: Record<number, TaskItem[]> = {
  1: [
    {
      id: 101,
      title: "完成登录页面",
      priority: "high",
      assignee: "林",
      dueDate: "2026-10-18",
      status: "done",
    },
    {
      id: 102,
      title: "实现项目总览页面",
      priority: "high",
      assignee: "周",
      dueDate: "2026-10-20",
      status: "doing",
    },
    {
      id: 103,
      title: "实现项目详情页面",
      priority: "high",
      assignee: "林",
      dueDate: "2026-10-22",
      status: "doing",
    },
    {
      id: 104,
      title: "设计任务列表组件",
      priority: "medium",
      assignee: "陈",
      dueDate: "2026-10-24",
      status: "todo",
    },
    {
      id: 105,
      title: "接入后端接口",
      priority: "medium",
      assignee: "周",
      dueDate: "2026-10-28",
      status: "todo",
    },
  ],

  2: [
    {
      id: 201,
      title: "复习 React 基础",
      priority: "high",
      assignee: "林",
      dueDate: "2026-10-16",
      status: "done",
    },
    {
      id: 202,
      title: "学习 React Router",
      priority: "high",
      assignee: "林",
      dueDate: "2026-10-18",
      status: "doing",
    },
    {
      id: 203,
      title: "学习 Express 基础",
      priority: "medium",
      assignee: "林",
      dueDate: "2026-10-22",
      status: "todo",
    },
    {
      id: 204,
      title: "复习 TypeScript",
      priority: "low",
      assignee: "林",
      dueDate: "2026-10-25",
      status: "todo",
    },
  ],

  3: [
    {
      id: 301,
      title: "完成课程需求分析",
      priority: "high",
      assignee: "周",
      dueDate: "2026-10-17",
      status: "done",
    },
    {
      id: 302,
      title: "完成系统设计",
      priority: "high",
      assignee: "陈",
      dueDate: "2026-10-19",
      status: "done",
    },
    {
      id: 303,
      title: "编写课程报告",
      priority: "medium",
      assignee: "林",
      dueDate: "2026-10-23",
      status: "doing",
    },
    {
      id: 304,
      title: "准备项目演示",
      priority: "low",
      assignee: "许",
      dueDate: "2026-10-27",
      status: "todo",
    },
  ],
};

// 项目详情数据
const projectDetails: ProjectPanelData[] = [
  {
    id: 1,
    name: "whenTeam 开发",
    description: "一个用于团队协作、项目管理和任务跟踪的全栈练习项目。",
    color: "#9c55bd",
    progress: 65,
    taskCount: mockTasksByProject[1].length,
    members,
    createdAt: "2026-09-20",
    dueDate: "2026-11-30",
  },
  {
    id: 2,
    name: "学习计划",
    description: "规划 React、TypeScript、Node.js 等技术的学习进度。",
    color: "#539433",
    progress: 40,
    taskCount: mockTasksByProject[2].length,
    members: [members[0]],
    createdAt: "2026-09-25",
    dueDate: "2026-12-31",
  },
  {
    id: 3,
    name: "课程作业",
    description: "管理课程作业、报告编写和项目演示等任务。",
    color: "#d38d43",
    progress: 85,
    taskCount: mockTasksByProject[3].length,
    members,
    createdAt: "2026-09-15",
    dueDate: "2026-10-30",
  },
];

// 项目详情页使用的完整项目数据
export const mockProjectDetails = projectDetails;

// 项目列表和侧边栏使用精简数据
export const mockProjects: ProjectGridItem[] = projectDetails.map(
  ({ id, name, color, progress, taskCount }) => ({
    id,
    name,
    color,
    progress,
    taskCount,
    isFavorite: id !== 2,
  }),
);

export const mockOverviewData = {
  projectCount: mockProjects.length,
  weekTaskCount: 12,
  collaborators: ["林", "周", "陈", "许"],
  collaboratorCount: 8,
};

export const mockUserName = "管理员";