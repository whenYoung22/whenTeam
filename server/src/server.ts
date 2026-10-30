// app.ts：定义应用如何处理请求。
// server.ts：决定服务什么时候、在哪个端口启动。

import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import { getAuthSecret } from "./utils/access-token.util.js";
import { createNotificationWebSocketServer } from "./websocket/notification.gateway.js";

const PORT = Number(process.env.PORT) || 3000;

getAuthSecret();

const server = createServer(app);
createNotificationWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
