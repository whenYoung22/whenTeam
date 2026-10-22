export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = "AppError";

    // 保持原型链正确（TypeScript 编译到 ES5 时用得上）
    Object.setPrototypeOf(this, AppError.prototype);
  }
}