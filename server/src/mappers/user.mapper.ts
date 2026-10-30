import type { User, UserSummary } from "../../../shared/index.js";

type UserData = {
  id: number;
  name: string;
  avatarUrl: string | null;
};

export function toUser(user: UserData): User {
  return {
    id: user.id,
    name: user.name,
    ...(user.avatarUrl !== null ? { avatarUrl: user.avatarUrl } : {}),
  };
}

export function toUserSummary(user: UserData): UserSummary {
  return toUser(user);
}
