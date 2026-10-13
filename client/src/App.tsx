import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

import AppRouter from "./router";

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#7067ef",
        },
      }}
    >
      <AppRouter />
    </ConfigProvider>
  );
}
