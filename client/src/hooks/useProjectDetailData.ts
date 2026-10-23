import { useCallback, useEffect, useState } from "react";
import type { ProjectDetailResponse, TaskResponse } from "@shared/index";
import { getProjectDetail, getProjectTaskList } from "@/api/project";

interface ProjectDetailData {
  project: ProjectDetailResponse;
  tasks: TaskResponse[];
}

interface LoadState {
  projectId: number;
  data: ProjectDetailData | null;
  error: string | null;
}

export default function useProjectDetailData(projectId: number) {
  const [loadState, setLoadState] = useState<LoadState | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      return () => {
        cancelled = true;
      };
    }

    Promise.all([getProjectDetail(projectId), getProjectTaskList(projectId)])
      .then(([project, tasks]) => {
        if (!cancelled) {
          setLoadState({
            projectId,
            data: { project, tasks },
            error: null,
          });
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setLoadState({
            projectId,
            data: null,
            error:
              requestError instanceof Error
                ? requestError.message
                : "加载项目数据失败，请重试",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt, projectId]);

  const retry = useCallback(() => {
    setLoading(true);
    setLoadState(null);
    setAttempt((current) => current + 1);
  }, []);

  const currentState =
    loadState?.projectId === projectId ? loadState : null;

  return {
    project: currentState?.data?.project ?? null,
    tasks: currentState?.data?.tasks ?? [],
    loading: loading || currentState === null,
    error: currentState?.error ?? null,
    retry,
  };
}
