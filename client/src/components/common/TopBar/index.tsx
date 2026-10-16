import { Avatar, Badge, Button, Tooltip } from "antd";
import {
  BellOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useMatch, useNavigate } from "react-router-dom";

import "./index.css";

interface TopBarProps {
  projectName: string | null;
  userName: string;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  // onReturnToProjects 删掉了：返回逻辑组件内部用 navigate 处理
}

export default function TopBar({
  projectName,
  userName,
  onSearchClick,
  onNotificationsClick,
}: TopBarProps) {
  const navigate = useNavigate();

  // 匹配项目详情路由，命中说明当前在项目页
  const projectMatch = useMatch("/projects/:projectId");
  const isProjectPage = projectMatch !== null;

  const avatarText = userName.trim().charAt(0) || "U";

  return (
    <header className="topbar">
      <div className="topbar-left">
        {isProjectPage ? (
          <button
            type="button"
            className="topbar-logo topbar-logo-back"
            onClick={() => navigate("/")}
          >
            <ArrowLeftOutlined className="topbar-logo-icon" />
            全部项目
          </button>
        ) : (
          <button
            type="button"
            className="topbar-logo"
          >
            whenTeam
          </button>
        )}

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
        <Tooltip title="搜索">
          <Button
            type="text"
            className="topbar-icon-button"
            icon={<SearchOutlined />}
            onClick={onSearchClick}
            aria-label="搜索项目或任务"
          />
        </Tooltip>

        <Badge dot offset={[-3, 3]}>
          <Button
            type="text"
            className="topbar-icon-button"
            icon={<BellOutlined />}
            onClick={onNotificationsClick}
            aria-label="消息通知"
          />
        </Badge>

        <div className="topbar-user">
          <Avatar size="small">{avatarText}</Avatar>
          <span className="topbar-username">{userName}</span>
        </div>
      </div>
    </header>
  );
}
