import { useNavigate } from "react-router-dom";
import { useState } from "react";

import OverviewPanel from "@/components/MainOverviewPage/OverviewPanel";
import ProjectGrid from "@/components/MainOverviewPage/ProjectGrid";
import CreateProjectModal from "@/components/MainOverviewPage/CreateProjectModal";

import { mockOverviewData, mockProjects } from "@/service/seed";

import type { ProjectListItem } from "@shared/index";

export default function MainOverviewPage() {
  const navigate = useNavigate();

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  
  const handleProjectClick = (project: ProjectListItem) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <>
      <OverviewPanel data={mockOverviewData} onCreateProject={() => setCreateProjectOpen(true)} />
      <ProjectGrid projects={mockProjects} onProjectClick={handleProjectClick}/>
      <CreateProjectModal open={createProjectOpen} onClose={() => setCreateProjectOpen(false)} />
    </>
  );
}
