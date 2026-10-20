import { useNavigate } from "react-router-dom";
import { useState } from "react";

import OverviewPanel from "@/components/ProjectOverviewPage/OverviewPanel";
import ProjectList from "@/components/ProjectOverviewPage/ProjectList";
import CreateProjectModal from "@/components/ProjectOverviewPage/CreateProjectModal";

import { mockOverviewData, mockProjects } from "@/service/seed";

import type { ProjectListItem } from "@shared/index";

export default function ProjectOverviewPage() {
  const navigate = useNavigate();

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  
  const handleProjectClick = (project: ProjectListItem) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <>
      <OverviewPanel data={mockOverviewData} onCreateProject={() => setCreateProjectOpen(true)} />
      <ProjectList projects={mockProjects} onProjectClick={handleProjectClick}/>
      <CreateProjectModal open={createProjectOpen} onClose={() => setCreateProjectOpen(false)} />
    </>
  );
}
