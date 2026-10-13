/** 前端可以获取的用户信息 */
export interface User {
  id: number;
  name: string;
}

/** 登录请求：前端提交给后端 */
export interface LoginRequest {
  name: string;
  password: string;
}

/** 后端内部使用的用户数据 */
export interface UserRecord extends User {
  password: string;
}