import { Button } from "antd";
import {
  AppstoreOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import "./index.css";

import type { ProjectGridItem } from "@/components/MainOverviewPage/ProjectGrid";

interface SideBarProps {
  projects: ProjectGridItem[];
  selectedProjectId: number | null;
  onProjectListClick: () => void;
  onProjectClick: (project: ProjectGridItem) => void;
  onLogout: () => void;
}

export default function SideBar({
  projects,
  selectedProjectId,
  onProjectListClick,
  onProjectClick,
  onLogout,
}: SideBarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">W</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-product-name">whenTeam</span>
          <span className="sidebar-product-desc">Team Workspace</span>
        </div>
      </div>

      <div className="sidebar-section-label">工作空间</div>

      <nav className="sidebar-nav">
        {/* 全部项目 */}
        <button
          type="button"
          className={`sidebar-nav-item ${
            selectedProjectId === null ? "selected" : ""
          }`}
          onClick={onProjectListClick}
        >
          <AppstoreOutlined className="sidebar-nav-icon" />
          <span className="sidebar-nav-label">全部项目</span>
        </button>

        <div className="sidebar-nav-divider" />

        <div className="sidebar-nav-group-title">我的项目</div>

        {/* 项目列表 */}
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            className={`sidebar-nav-item ${
              selectedProjectId === project.id ? "selected" : ""
            }`}
            onClick={() => onProjectClick(project)}
          >
            <i
              className="project-color-dot"
              style={{ backgroundColor: project.color }}
            />
            <span className="sidebar-nav-label">{project.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-bottom-divider" />
        <Button
          className="sidebar-logout"
          type="text"
          block
          icon={<LogoutOutlined />}
          onClick={onLogout}
        >
          退出登录
        </Button>
        <div className="sidebar-version">whenTeam · v1.0</div>
      </div>
    </aside>
  );
}