import { useNavigate, useParams, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import { message } from "antd";

import TopBar from "@/components/common/TopBar";
import SideBar from "@/components/common/SideBar";
import Footer from "@/components/common/Footer";

import useProjectStore from "@/stores/projectStore";

import { getCurrentUser } from "@/api/user";
import { logout } from "@/api/auth";
import { clearAuthToken } from "@/utils/authToken";
import useNotificationWebSocket from "@/hooks/useNotificationWebSocket";

import type { ProjectListItem, User } from "@shared/index";

import "./index.css";

export default function MainPage() {
  useNotificationWebSocket();

  const navigate = useNavigate();
  const { projectId } = useParams();

  const projects = useProjectStore((state) => state.projects);
  const error = useProjectStore((state) => state.error);
  const loadProjects = useProjectStore((state) => state.loadProjects);
  const resetProjects = useProjectStore((state) => state.resetProjects);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((user) => {
        if (active) setCurrentUser(user);
      })
      .catch((requestError: unknown) => {
        if (active) {
          message.error(
            requestError instanceof Error
              ? requestError.message
              : "获取用户信息失败",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedProject: ProjectListItem | null =
    projects.find((project) => String(project.id) === projectId) ?? null;

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

  const handleLogout = async () => {
    try {
      await logout();
      clearAuthToken();
      resetProjects();
      navigate("/login", { replace: true });
    } catch (logoutError) {
      message.error(
        logoutError instanceof Error
          ? logoutError.message
          : "退出登录失败，请稍后重试",
      );
    }
  };

  return (
    <div className="main-page">
      <SideBar
        projects={projects}
        selectedProjectId={selectedProject?.id ?? null}
        onProjectListClick={handleProjectListClick}
        onProjectClick={handleProjectClick}
        onLogout={handleLogout}
      />

      <div className="main-page-body">
        <TopBar
          projectName={selectedProject?.name ?? null}
          userName={currentUser?.name ?? ""}
          onSearchClick={handleSearchClick}
        />

        <main className="main-page-content">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
