import { useNavigate } from "react-router-dom";
import { useState } from "react";

import ProjectOverview from "@/components/MainOverviewPage/ProjectOverview";
import ProjectGrid from "@/components/MainOverviewPage/ProjectGrid";
import CreateProjectModal from "@/components/MainOverviewPage/CreateProjectModal";

import { mockOverviewData, mockProjects } from "@/service/seed";

import type { ProjectGridItem } from "@/components/MainOverviewPage/ProjectGrid";

export default function MainOverviewPage() {
  const navigate = useNavigate();

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  
  const handleProjectClick = (project: ProjectGridItem) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <>
      <ProjectOverview data={mockOverviewData} onCreateProject={() => setCreateProjectOpen(true)} />
      <ProjectGrid projects={mockProjects} onProjectClick={handleProjectClick}/>
      <CreateProjectModal open={createProjectOpen} onClose={() => setCreateProjectOpen(false)} />
    </>
  );
}
