import { useCallback, useEffect, useState } from "react";
import type { ProjectListItem } from "@shared/index";
import { getProjects } from "@/api/project";

export default function useProjectList() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getProjects()
      .then((result) => {
        if (!cancelled) {
          setProjects(result);
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "加载项目列表失败",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setAttempt((current) => current + 1);
  }, []);

  return { projects, setProjects, loading, error, reload };
}
