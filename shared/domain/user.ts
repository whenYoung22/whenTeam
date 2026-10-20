/** 前端可以获取的用户信息 */
export interface User {
  id: number;
  name: string;
  avatarUrl?: string;
}

export type UserSummary = User;

export interface LoginResponse {
  user: User;
  token: string;
}

/** 登录请求：前端提交给后端 */
export interface LoginRequest {
  name: string;
  password: string;
}
