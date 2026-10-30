import { useState } from "react";
import {
  Avatar,
  Button,
  Dropdown,
  message,
  Modal,
  Progress,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  EllipsisOutlined,
  StarFilled,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ProjectDetailResponse } from "@shared/index";
import EditProjectModal from "@/components/ProjectDetailPage/EditProjectModal";
import "./index.css";

function getMutedProjectColor(color: string): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(color);
  if (!match) return "#667085";

  const channels = match[1].match(/.{2}/g);
  if (!channels) return "#667085";

  const [red, green, blue] = channels.map((channel) =>
    Number.parseInt(channel, 16),
  );
  const gray = Math.round(red * 0.299 + green * 0.587 + blue * 0.114);
  const mix = (channel: number) => Math.round(channel * 0.55 + gray * 0.45);

  return `#${[red, green, blue]
    .map((channel) => mix(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

interface DetailPanelProps {
  project: ProjectDetailResponse;
  onSave: (project: ProjectDetailResponse) => void;
  onDelete: () => Promise<void>;
  onFavoriteToggle: () => void;
  favoritePending: boolean;
}

export default function DetailPanel({
  project,
  onSave,
  onDelete,
  onFavoriteToggle,
  favoritePending,
}: DetailPanelProps) {
  const [editOpen, setEditOpen] = useState(false);
  const projectAccentColor = getMutedProjectColor(project.color);

  const handleSave = (updatedProject: ProjectDetailResponse) => {
    onSave(updatedProject);
    setEditOpen(false);
    message.success("项目已更新");
  };

  return (
    <section className="project-panel">
      <div className="project-panel-header">
        <div className="project-panel-title-group">
          <span
            className="project-panel-color"
            style={{ backgroundColor: projectAccentColor }}
          />

          <div className="project-panel-title-content">
            <h1 className="project-panel-title">{project.name}</h1>
            <p className="project-panel-description">
              {project.description || "暂无项目介绍"}
            </p>
          </div>
        </div>

        <div className="project-panel-actions">
          <Button
            type="text"
            className={`project-panel-favorite-button${project.isFavorite ? " is-favorite" : ""}`}
            icon={project.isFavorite ? <StarFilled /> : <StarOutlined />}
            aria-label={project.isFavorite ? "取消收藏项目" : "收藏项目"}
            aria-pressed={project.isFavorite}
            title={project.isFavorite ? "取消收藏" : "收藏项目"}
            loading={favoritePending}
            onClick={onFavoriteToggle}
          />
          <Dropdown
            menu={{
              items: [
                { key: "edit", label: "编辑项目" },
                { key: "delete", label: "删除项目", danger: true },
              ],
              onClick: ({ key }) => {
                if (key === "edit") {
                  setEditOpen(true);
                  return;
                }

                Modal.confirm({
                  title: "删除项目",
                  content:
                    "删除后，项目中的任务、成员关系和通知也会被删除，且无法恢复。确认删除？",
                  okText: "删除",
                  okButtonProps: { danger: true },
                  cancelText: "取消",
                  onOk: onDelete,
                });
              },
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              className="project-panel-edit-button"
              icon={<EllipsisOutlined />}
              aria-label="项目操作"
              title="项目操作"
            />
          </Dropdown>
        </div>
      </div>

      <div className="project-panel-progress">
        <div className="project-panel-progress-header">
          <span>项目进度</span>
          <span className="project-panel-progress-value" style={{ color: projectAccentColor }}>
            {project.progress}%
          </span>
        </div>

        <Progress
          percent={project.progress}
          showInfo={false}
          strokeColor={projectAccentColor}
          size={{ height: 8 }}
        />
      </div>

      <div className="project-panel-divider" />

      <div className="project-panel-info">
        <div className="project-panel-info-item">
          <div className="project-panel-info-label">
            <CheckSquareOutlined />
            <span>任务数量</span>
          </div>
          <span className="project-panel-info-value">
            {project.taskCount} 个任务
          </span>
        </div>


        <div className="project-panel-info-item">
          <div className="project-panel-info-label">
            <UserOutlined />
            <span>项目创建者</span>
          </div>
          <div className="project-panel-creator">
            <Avatar
              size="small"
              src={project.creator.avatarUrl}
              style={{ backgroundColor: "#b4b9c7", fontSize: 12 }}
            >
              {project.creator.name.slice(0, 1)}
            </Avatar>
            <span className="project-panel-info-value">
              {project.creator.name}
            </span>
          </div>
        </div>

        <div className="project-panel-info-item">
          <div className="project-panel-info-label">
            <TeamOutlined />
            <span>项目成员</span>
          </div>

          <div className="project-panel-members">
            <Avatar.Group>
              {project.members.map((member) => (
                <Tooltip key={member.id} title={member.name}>
                  <Avatar
                    src={member.avatarUrl}
                    style={{
                      backgroundColor: "#b4b9c7",
                      fontSize: 12,
                    }}
                  >
                    {member.name.slice(0, 1)}
                  </Avatar>
                </Tooltip>
              ))}
            </Avatar.Group>

            <span className="project-panel-member-count">
              {project.members.length} 人
            </span>
          </div>
        </div>

        <div className="project-panel-info-item">
          <div className="project-panel-info-label">
            <CalendarOutlined />
            <span>创建日期</span>
          </div>
          <span className="project-panel-info-value">
            {project.createdAt.slice(0, 10)}
          </span>
        </div>

        <div className="project-panel-info-item">
          <div className="project-panel-info-label">
            <ClockCircleOutlined />
            <span>截止日期</span>
          </div>
          <span className="project-panel-info-value">
            {project.dueDate}
          </span>
        </div>
      </div>

      <EditProjectModal
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />
    </section>
  );
}
