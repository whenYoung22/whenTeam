import { useCallback, useEffect, useState } from "react";
import type { ProjectOverviewResponse } from "@shared/index";
import { getProjectOverview } from "@/api/project";

export default function useProjectOverview() {
  const [overview, setOverview] = useState<ProjectOverviewResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getProjectOverview()
      .then((result) => {
        if (!cancelled) {
          setOverview(result);
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "加载项目总览失败",
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

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProjectOverview();
      setOverview(result);
      return result;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "加载项目总览失败",
      );
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setAttempt((current) => current + 1);
  }, []);

  return { overview, loading, error, reload, retry };
}
