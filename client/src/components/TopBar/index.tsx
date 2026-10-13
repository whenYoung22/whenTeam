import { Avatar, Badge, Button, Tooltip } from "antd";
import {
  BellOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

import "./index.css";

interface TopBarProps {
  projectName: string | null;
  userName: string;
  onReturnToProjects: () => void;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
}

export default function TopBar({
  projectName,
  userName,
  onReturnToProjects,
  onSearchClick,
  onNotificationsClick,
}: TopBarProps) {
  const avatarText = userName.trim().charAt(0) || "U";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Tooltip title="返回全部项目">
          <button
            type="button"
            className="topbar-logo"
            onClick={onReturnToProjects}
            aria-label="返回全部项目"
          >
            <ArrowLeftOutlined className="topbar-logo-icon" />
            whenTeam
          </button>
        </Tooltip>

        <div className="topbar-title">
          <span className="topbar-project-name">
            {projectName || "全部项目"}
          </span>
          <span className="topbar-breadcrumb">
            {projectName ? "项目空间" : "项目总览"}
          </span>
        </div>
      </div>

      <div className="topbar-right">
        <Tooltip title="搜索项目或任务">
          <Button
            type="text"
            className="topbar-icon-button"
            icon={<SearchOutlined />}
            onClick={onSearchClick}
            aria-label="搜索项目或任务"
          />
        </Tooltip>

        <Tooltip title="消息通知">
          <Badge dot offset={[-3, 3]}>
            <Button
              type="text"
              className="topbar-icon-button"
              icon={<BellOutlined />}
              onClick={onNotificationsClick}
              aria-label="消息通知"
            />
          </Badge>
        </Tooltip>

        <div className="topbar-user">
          <Avatar className="topbar-avatar">{avatarText}</Avatar>

          <span className="topbar-user-name">{userName}</span>
        </div>
      </div>
    </header>
  );
}
