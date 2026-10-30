import { create } from "zustand";

import { getProjects } from "@/api/project";
import type { ProjectListItem } from "@shared/index";

interface ProjectStore {
  projects: ProjectListItem[];
  loading: boolean;
  error: string | null;
  loadProjects: () => Promise<void>;
  addProject: (project: ProjectListItem) => void;
  removeProject: (projectId: number) => void;
  updateProject: (
    projectId: number,
    updates: Partial<Omit<ProjectListItem, "id">>,
  ) => void;
  resetProjects: () => void;
}

let latestLoadRequest = 0;

const initialState: Pick<ProjectStore, "projects" | "loading" | "error"> = {
  projects: [],
  loading: true,
  error: null,
};

const useProjectStore = create<ProjectStore>((set) => ({
  ...initialState,
  loadProjects: async () => {
    const requestId = ++latestLoadRequest;
    set({ loading: true, error: null });

    try {
      const projects = await getProjects();
      if (requestId === latestLoadRequest) {
        set({ projects, error: null });
      }
    } catch (requestError) {
      if (requestId === latestLoadRequest) {
        set({
          error:
            requestError instanceof Error
              ? requestError.message
              : "加载项目列表失败",
        });
      }
    } finally {
      if (requestId === latestLoadRequest) {
        set({ loading: false });
      }
    }
  },
  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),
  removeProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== projectId),
    })),
  updateProject: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId ? { ...project, ...updates } : project,
      ),
    })),
  resetProjects: () => {
    latestLoadRequest += 1;
    set({ ...initialState });
  },
}));

export default useProjectStore;
