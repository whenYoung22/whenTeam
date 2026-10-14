import { useState } from "react";
import { Empty, message } from "antd";

import SideBar from "@/components/SideBar";
import TopBar from "@/components/TopBar";
import ProjectGrid from "@/components/ProjectGrid";
import ProjectOverview from "@/components/ProjectOverview";
import Footer from "@/components/Footer";

import type { ProjectOverviewData } from "@/components/ProjectOverview";
import type { ProjectGridItem } from "@/components/ProjectGrid";

import "./index.css";

// 临时模拟数据，后续从后端 API 获取
const mockProjects: ProjectGridItem[] = [
  {
    id: 1,
    name: "whenTeam 开发",
    color: "#ac69ca",
    progress: 65,
    taskCount: 12,
    isFavorite: true,
  },
  {
    id: 2,
    name: "学习计划",
    color: "#539433",
    progress: 40,
    taskCount: 8,
    isFavorite: false,
  },
  {
    id: 3,
    name: "课程作业",
    color: "#d38d43",
    progress: 85,
    taskCount: 20,
    isFavorite: true,
  },
];

// 临时模拟数据，后续从后端 API 获取
const mockOverviewData: ProjectOverviewData = {
  projectCount: mockProjects.length,
  weekTaskCount: 12,
  collaborators: ["林", "周", "陈", "许"],
  collaboratorCount: 8,
};

export default function MainPage() {
  // 当前选中的项目；null 表示全部项目
  const [selectedProject, setSelectedProject] =
    useState<ProjectGridItem | null>(null);

  // 当前登录用户，暂时使用模拟数据
  const userName = "管理员";

  const handleReturnToProjects = () => {
    setSelectedProject(null);
  };

  const handleProjectListClick = () => {
    setSelectedProject(null);
  };

  const handleProjectClick = (project: ProjectGridItem) => {
    setSelectedProject(project);
  };

  const handleSearchClick = () => {
    message.info("搜索功能暂未实现");
  };

  const handleNotificationsClick = () => {
    message.info("通知功能暂未实现");
  };

  const handleLogout = () => {
    message.info("退出登录功能暂未接入");
  };

  return (
    <div className="main-page">
      <SideBar
        projects={mockProjects}
        selectedProjectId={selectedProject?.id ?? null}
        onProjectListClick={handleProjectListClick}
        onProjectClick={handleProjectClick}
        onLogout={handleLogout}
      />

      <div className="main-page-body">
        <TopBar
          projectName={selectedProject?.name ?? null}
          userName={userName}
          onReturnToProjects={handleReturnToProjects}
          onSearchClick={handleSearchClick}
          onNotificationsClick={handleNotificationsClick}
        />

        <main className="main-page-content">
          {selectedProject ? (
            <section className="project-detail-placeholder">
              <div className="page-heading">
                <div>
                  <h1>{selectedProject.name}</h1>
                  <p>项目工作空间</p>
                </div>
              </div>
              <Empty description="项目详情页面暂未实现" />
            </section>
          ) : (
            <>
              <ProjectOverview data={mockOverviewData} />
              <ProjectGrid
                projects={mockProjects}
                onProjectClick={handleProjectClick}
              />
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
