import { useNavigate, useParams, Outlet } from "react-router-dom";

import { message } from "antd";

import TopBar from "@/components/common/TopBar";
import SideBar from "@/components/common/SideBar";
import Footer from "@/components/common/Footer";

import { mockCurrentUser, mockProjects } from "@/service/seed";

import type { ProjectListItem } from "@shared/index";

import "./index.css";

export default function MainPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  // 根据 URL 确定当前选中的项目
  const selectedProject: ProjectListItem | null =
    mockProjects.find((project) => String(project.id) === projectId) ?? null;

  // 返回项目总览
  const handleProjectListClick = () => {
    navigate("/");
  };

  // 点击项目时进入项目详情路由
  const handleProjectClick = (project: ProjectListItem) => {
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
          userName={mockCurrentUser.name}
          onSearchClick={handleSearchClick}
          onNotificationsClick={handleNotificationsClick}
        />

        <main className="main-page-content">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
