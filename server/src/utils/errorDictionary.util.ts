export const errorDictionary = {
  AUTH_REQUIRED: { statusCode: 401, message: "请先登录" },
  INVALID_TOKEN: { statusCode: 401, message: "登录状态无效或已过期" },
  INVALID_REFRESH_TOKEN: { statusCode: 401, message: "登录已失效，请重新登录" },
  INVALID_CREDENTIALS: { statusCode: 401, message: "用户名或密码错误" },
  INVALID_NOTIFICATION_ID: { statusCode: 400, message: "通知 ID 无效" },
  INVALID_PROJECT_ID: { statusCode: 400, message: "项目 ID 无效" },
  INVALID_TASK_ID: { statusCode: 400, message: "任务 ID 无效" },
  VALIDATION_ERROR: { statusCode: 400, message: "请求参数无效" },
  MEMBER_NOT_FOUND: { statusCode: 400, message: "部分项目成员不存在" },
  ASSIGNEE_NOT_PROJECT_MEMBER: {
    statusCode: 400,
    message: "任务负责人必须是项目成员",
  },
  TASK_DUE_DATE_IN_PAST: {
    statusCode: 400,
    message: "任务截止日期不能早于今天",
  },
  PROJECT_FORBIDDEN: { statusCode: 403, message: "无权操作此项目" },
  TASK_FORBIDDEN: { statusCode: 403, message: "无权操作此任务" },
  NOTIFICATION_NOT_FOUND: { statusCode: 404, message: "通知不存在" },
  PROJECT_NOT_FOUND: { statusCode: 404, message: "项目不存在" },
  TASK_NOT_FOUND: { statusCode: 404, message: "任务不存在" },
  NOT_FOUND: { statusCode: 404, message: "接口不存在" },
  USERNAME_TAKEN: { statusCode: 409, message: "用户名已被使用" },
  TASK_DUE_DATE_CONFLICT: {
    statusCode: 409,
    message: "任务截止日期不能晚于项目截止日期",
  },
  PROJECT_DUE_DATE_CONFLICT: {
    statusCode: 409,
    message: "项目截止日期不能早于已有任务的截止日期",
  },
  DUPLICATE_ENTRY: { statusCode: 409, message: "数据已存在" },
  INTERNAL_SERVER_ERROR: { statusCode: 500, message: "服务器内部错误" },
} as const;

export type ErrorCode = keyof typeof errorDictionary;
