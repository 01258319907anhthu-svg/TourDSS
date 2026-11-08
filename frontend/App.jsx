import App from "../src/App.jsx";
import Login from "./pages/Login.jsx";
import SettingsPage from "../src/SettingsPage.jsx";
const routePages = {
  "/phan-tich-thi-truong": "Phân tích thị trường",
  "/tong-quan": "Tổng quan",
  "/tong_quan": "Tổng quan",
  "/cai-dat": "Dữ liệu và thiết lập",
  "/quyet-dinh-gia": "Quyết định giá",
  "/tour-va-goi-dich-vu": "Tour và gói dịch vụ",
  "/du-lieu-va-thiet-lap": "Dữ liệu và thiết lập",
};

function FrontendEntry() {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
  if (path === "/login") {
    window.history.replaceState({}, "", "/");
  }
  if (path === "" || path === "/login") return <Login />;
  if (path === "/cai-dat") return <SettingsPage />;
  return <App initialPage={routePages[path] || "Tổng quan"} />;
}

export default FrontendEntry;
export * from "./pages/index.jsx";
