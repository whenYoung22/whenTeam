import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";

import LoginPage from "@/pages/LoginPage";

import MainPage from "@/pages/MainPage";
import ProjectOverviewPage from "@/pages/ProjectOverviewPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";

import { getAuthToken } from "@/utils/authToken";

function RequireAuth({ children }: { children: ReactNode }) {
  return getAuthToken() ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }: { children: ReactNode }) {
  return getAuthToken() ? <Navigate to="/" replace /> : children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />

        <Route
          path="/"
          element={
            <RequireAuth>
              <MainPage />
            </RequireAuth>
          }
        >
          {/* 项目总览 */}
          <Route index element={<ProjectOverviewPage />} />

          {/* 项目详情 */}
          <Route path="projects/:projectId" element={<ProjectDetailPage />}/>
        </Route>

        {/* 未匹配的路径暂时重定向到主页面 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
