import { useCallback, useEffect, useState } from "react";
import type { UserSummary } from "@shared/index";
import { getUsers } from "@/api/user";


// 获取所有注册的用户 在添加/编辑项目时用
export default function useUserDirectory(enabled: boolean) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    getUsers()
      .then((result) => {
        if (active) {
          setUsers(result);
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "加载用户列表失败",
          );
        }
      })
      .finally(() => {
        if (active) setHasLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [attempt, enabled]);

  const retry = useCallback(() => {
    setHasLoaded(false);
    setError(null);
    setAttempt((current) => current + 1);
  }, []);

  return { users, loading: enabled && !hasLoaded, error, retry };
}
