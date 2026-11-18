import App from "../src/App.jsx";
import Login from "./pages/Login.jsx";
import SettingsPage from "../src/SettingsPage.jsx";
const routePages = {
  "/phan-tich-thi-truong": "Phân tích thị trường",
  "/du-bao-nhu-cau": "Dự báo & pick-up",
  "/tong-quan": "Tổng quan KPI",
  "/tong_quan": "Tổng quan KPI",
  "/cai-dat": "Dữ liệu và thiết lập",
  "/quyet-dinh-gia": "Quyết định giá",
  "/tour-va-goi-dich-vu": "Mô phỏng & gói dịch vụ",
  "/mo-phong-&-goi-dich-vu": "Mô phỏng & gói dịch vụ",
  "/du-lieu-va-thiet-lap": "Dữ liệu và tham số",
  "/du-lieu-va-tham-so": "Dữ liệu và tham số",
};

function FrontendEntry() {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
  if (path === "/login") {
    window.history.replaceState({}, "", "/");
  }
  if (path === "" || path === "/login") return <Login />;
  if (path === "/cai-dat") return <SettingsPage />;
  return <App initialPage={routePages[path] || "Tổng quan KPI"} />;
}

export default FrontendEntry;
export * from "./pages/index.jsx";
