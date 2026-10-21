// app.ts：定义应用如何处理请求。
// server.ts：决定服务什么时候、在哪个端口启动。

import "dotenv/config";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
