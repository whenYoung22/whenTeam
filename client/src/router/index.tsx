import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "@/pages/LoginPage";
import MainPage from "@/pages/MainPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainPage />} />

        {/* 未匹配的路径暂时重定向到主页面 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}