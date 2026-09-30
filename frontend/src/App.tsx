import { Navigate, Outlet, ScrollRestoration, createBrowserRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
import StockDetailPage from "./pages/StockDetailPage";
import "./App.css";

function RootLayout() {
  return (
    <>
      <Outlet />
      {/* 상세 진입 시 맨 위로, 뒤로 가기 시 이전 스크롤 위치로 */}
      <ScrollRestoration />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <MainPage /> },
      { path: "/stocks/:stockCode", element: <StockDetailPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
