import { useState } from "react";
import { Card, Empty, Progress, Segmented } from "antd";
import { FolderOutlined } from "@ant-design/icons";
import type { ProjectListItem } from "@shared/index";

import "./index.css";

type ProjectFilter = "all" | "favorite";

interface ProjectGridProps {
  projects: ProjectListItem[];
  onProjectClick: (project: ProjectListItem) => void;
}

export default function ProjectGrid({
  projects,
  onProjectClick,
}: ProjectGridProps) {
  const [filter, setFilter] = useState<ProjectFilter>("all");

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((project) => project.isFavorite);

  return (
    <section className="project-grid-section">
      <div className="project-grid-header">
        <div className="project-grid-heading">
          <h1>全部项目</h1>
          <p>查看和管理你的团队项目</p>
        </div>

        <Segmented
          className="project-grid-filter"
          options={[
            { label: "全部项目", value: "all" },
            { label: "收藏项目", value: "favorite" },
          ]}
          value={filter}
          onChange={(value) => setFilter(value as ProjectFilter)}
        />
      </div>

      {filteredProjects.length > 0 ? (
        <div className="project-grid">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="project-card"
              hoverable
              onClick={() => onProjectClick(project)}
            >
              <div className="project-card-icon">
                <FolderOutlined style={{ color: project.color }} />
              </div>

              <div className="project-card-name">{project.name}</div>

              <div className="project-card-task-count">
                {project.taskCount} 个任务
              </div>

              <div className="project-card-progress">
                <div className="project-card-progress-header">
                  <span>项目进度</span>
                  <span>{project.progress}%</span>
                </div>

                <Progress
                  percent={project.progress}
                  showInfo={false}
                  strokeColor={project.color}
                  size="small"
                />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="project-grid-empty">
          <Empty description="暂无收藏项目" />
        </div>
      )}
    </section>
  );
}
