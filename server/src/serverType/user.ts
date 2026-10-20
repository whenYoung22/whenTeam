import type { User } from "../../../shared/index.js";

/** 后端内部使用的用户数据 */
export interface UserRecord extends User {
  passwordHash: string;
}
