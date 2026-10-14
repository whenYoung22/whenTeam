import { useNavigate } from "react-router-dom";

import ProjectOverview from "@/components/ProjectOverview";
import ProjectGrid from "@/components/ProjectGrid";

import { mockOverviewData, mockProjects } from "@/service/seed";

import type { ProjectGridItem } from "@/components/ProjectGrid";

export default function MainOverviewPage() {
  const navigate = useNavigate();

  const handleProjectClick = (project: ProjectGridItem) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <>
      <ProjectOverview data={mockOverviewData} />
      <ProjectGrid
        projects={mockProjects}
        onProjectClick={handleProjectClick}
      />
    </>
  );
}
