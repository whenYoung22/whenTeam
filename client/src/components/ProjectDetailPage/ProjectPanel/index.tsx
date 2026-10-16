import { Avatar, Progress, Tooltip } from "antd";
import {
  CalendarOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import "./index.css";

export interface ProjectMember {
  id: number;
  name: string;
  avatar?: string;
}

export interface ProjectPanelData {
  id: number;
  name: string;
  description: string;
  color: string;
  progress: number;
  taskCount: number;
  members: ProjectMember[];
  createdAt: string;
  dueDate: string;
}

interface ProjectPanelProps {
  project: ProjectPanelData;
}

export default function ProjectPanel({ project }: ProjectPanelProps) {
  return (
    <section className="project-panel">
      <div className="project-panel-header">
        <div className="project-panel-title-group">
          <span
            className="project-panel-color"
            style={{ backgroundColor: project.color }}
          />

          <div className="project-panel-title-content">
            <h1 className="project-panel-title">{project.name}</h1>
            <p className="project-panel-description">
              {project.description || "暂无项目介绍"}
            </p>
          </div>
        </div>
      </div>

      <div className="project-panel-progress">
        <div className="project-panel-progress-header">
          <span>项目进度</span>
          <span className="project-panel-progress-value">
            {project.progress}%
          </span>
        </div>

        <Progress
          percent={project.progress}
          showInfo={false}
          strokeColor="#7067ef"
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
            <TeamOutlined />
            <span>项目成员</span>
          </div>

          <div className="project-panel-members">
            <Avatar.Group>
              {project.members.map((member) => (
                <Tooltip key={member.id} title={member.name}>
                  <Avatar
                    src={member.avatar}
                    style={{
                      backgroundColor: "#7067ef",
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
          <span className="project-panel-info-value">{project.createdAt}</span>
        </div>

        <div className="project-panel-info-item">
          <div className="project-panel-info-label">
            <ClockCircleOutlined />
            <span>截止日期</span>
          </div>
          <span className="project-panel-info-value">
            {project.dueDate || "未设置"}
          </span>
        </div>
      </div>
    </section>
  );
}
