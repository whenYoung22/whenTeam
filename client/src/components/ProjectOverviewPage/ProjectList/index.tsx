import { useState } from "react";
import { Button, Card, Empty, Progress, Segmented } from "antd";
import { FolderOutlined, StarFilled, StarOutlined } from "@ant-design/icons";

import type { ProjectListItem } from "@shared/index";

import "./index.css";

type ProjectFilter = "all" | "favorite";

interface ProjectListProps {
  projects: ProjectListItem[];
  onProjectClick: (project: ProjectListItem) => void;
  onFavoriteToggle: (project: ProjectListItem) => void;
  favoritePendingProjectId: number | null;
}

export default function ProjectList({
  projects,
  onProjectClick,
  onFavoriteToggle,
  favoritePendingProjectId,
}: ProjectListProps) {
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
              <Button
                type="text"
                className={`project-card-favorite-button${project.isFavorite ? " is-favorite" : ""}`}
                icon={project.isFavorite ? <StarFilled /> : <StarOutlined />}
                aria-label={project.isFavorite ? "取消收藏项目" : "收藏项目"}
                aria-pressed={project.isFavorite}
                title={project.isFavorite ? "取消收藏" : "收藏项目"}
                loading={favoritePendingProjectId === project.id}
                disabled={
                  favoritePendingProjectId !== null &&
                  favoritePendingProjectId !== project.id
                }
                onClick={(event) => {
                  event.stopPropagation();
                  onFavoriteToggle(project);
                }}
              />
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
          <Empty
            description={
              filter === "favorite" ? "暂无收藏项目" : "暂无项目"
            }
          />
        </div>
      )}
    </section>
  );
}
