/** 前端可以获取的用户信息 */
export interface User {
  id: number;
  name: string;
  avatarUrl?: string;
}


// 是 User 的别名，表示在项目成员、任务负责人这类场景中使用的用户摘要。
export type UserSummary = User;

/** 登录请求：前端提交给后端 */
export interface LoginRequest {
  name: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}