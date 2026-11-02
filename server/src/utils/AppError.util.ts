import { errorDictionary, type ErrorCode } from "./errorDictionary.util.js";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;

  constructor(code: ErrorCode, message?: string) {
    super(message ?? errorDictionary[code].message);
    this.statusCode = errorDictionary[code].statusCode;
    this.code = code;
    this.name = "AppError";

    // 保持原型链正确（TypeScript 编译到 ES5 时用得上）
    Object.setPrototypeOf(this, AppError.prototype);
  }
}