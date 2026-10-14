// import { useState } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";

import { message } from "antd";

import SideBar from "@/components/SideBar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";

// import ProjectGrid from "@/components/ProjectGrid";
// import ProjectOverview from "@/components/ProjectOverview";

import { mockProjects, mockUserName } from "@/service/seed";

import type { ProjectGridItem } from "@/components/ProjectGrid";

import "./index.css";

export default function MainPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  // 根据 URL 确定当前选中的项目
  const selectedProject: ProjectGridItem | null =
    mockProjects.find((project) => String(project.id) === projectId) ?? null;

  // 返回项目总览
  const handleReturnToProjects = () => {
    navigate("/");
  };

  const handleProjectListClick = () => {
    navigate("/");
  };

  // 点击项目时进入项目详情路由
  const handleProjectClick = (project: ProjectGridItem) => {
    navigate(`/projects/${project.id}`);
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
          userName={mockUserName}
          onReturnToProjects={handleReturnToProjects}
          onSearchClick={handleSearchClick}
          onNotificationsClick={handleNotificationsClick}
        />

        <main className="main-page-content">
          {/* {selectedProject ? (
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
          )} */}
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
