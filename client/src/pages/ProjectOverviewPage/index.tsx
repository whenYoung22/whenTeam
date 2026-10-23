import { Alert, Spin, message } from "antd";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import OverviewPanel from "@/components/ProjectOverviewPage/OverviewPanel";
import ProjectList from "@/components/ProjectOverviewPage/ProjectList";
import CreateProjectModal from "@/components/ProjectOverviewPage/CreateProjectModal";

import useProjectOverview from "@/hooks/useProjectOverview";

import type {
  ProjectDetailResponse,
  ProjectListItem,
} from "@shared/index";

interface ProjectOutletContext {
  projects: ProjectListItem[];
  setProjects: Dispatch<SetStateAction<ProjectListItem[]>>;
  reloadProjects: () => void;
}

export default function ProjectOverviewPage() {
  const navigate = useNavigate();
  const { projects, setProjects, reloadProjects } =
    useOutletContext<ProjectOutletContext>();

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const {
    overview,
    loading: overviewLoading,
    error: overviewError,
    reload: reloadOverview,
    retry: retryOverview,
  } = useProjectOverview();

  const handleProjectClick = (project: ProjectListItem) => {
    navigate(`/projects/${project.id}`);
  };

  const handleProjectCreated = async (project: ProjectDetailResponse) => {
    setProjects((current) => [
      {
        id: project.id,
        name: project.name,
        color: project.color,
        progress: project.progress,
        taskCount: project.taskCount,
        isFavorite: project.isFavorite,
      },
      ...current,
    ]);
    setCreateProjectOpen(false);
    reloadProjects();

    try {
      await reloadOverview();
    } catch (error) {
      message.error(
        error instanceof Error
          ? `项目已创建，但总览数据刷新失败：${error.message}`
          : "项目已创建，但总览数据刷新失败",
      );
    }
  };

  return (
    <>
      {overview && (
        <OverviewPanel
          data={overview}
          onCreateProject={() => setCreateProjectOpen(true)}
        />
      )}
      {overviewError ? (
        <Alert
          type="error"
          showIcon
          message="项目总览加载失败"
          description={overviewError}
          action={
            <button type="button" onClick={retryOverview}>
              重试
            </button>
          }
        />
      ) : overviewLoading && !overview ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spin tip="正在加载项目总览..." />
        </div>
      ) : (
        overview && (
          <ProjectList projects={projects} onProjectClick={handleProjectClick} />
        )
      )}
      <CreateProjectModal
        open={createProjectOpen}
        collaborators={overview?.collaborators ?? []}
        onClose={() => setCreateProjectOpen(false)}
        onCreated={handleProjectCreated}
      />
    </>
  );
}
