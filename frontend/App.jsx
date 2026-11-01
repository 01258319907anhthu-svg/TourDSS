import App from "../src/App.jsx";
import Login from "./pages/Login.jsx";

const routePages = {
  "/tong-quan": "Tổng quan",
  "/du-lieu-thi-truong": "Dữ liệu & thị trường",
  "/phan-tich-du-bao": "Phân tích & dự báo",
  "/phan-tich-kinh-doanh": "Phân tích & dự báo",
  "/du-bao-nhu-cau": "Phân tích & dự báo",
  "/quyet-dinh-gia": "Ra quyết định giá",
  "/phe-duyet-bao-cao": "Phê duyệt & báo cáo",
};

function FrontendEntry() {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
  if (path === "/login") return <Login />;
  return <App initialPage={routePages[path] || "Tổng quan"} />;
}

export default FrontendEntry;
export * from "./pages/index.jsx";
