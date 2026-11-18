import { useMemo, useState } from "react";
import "./settings-page.css";
import UserMenu from "./UserMenu.jsx";

export default function SettingsPage() {
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("tourdss_user")) || {}; }
    catch { return {}; }
  }, []);
  const [message, setMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const roleName = user.roleName || "Quản trị viên";
  const username = user.username || "admin";
  const email = user.email || "admin@tourdss.vn";
  const returnPath = sessionStorage.getItem("tourdss_settings_return") || "/tong_quan";
  const returnLabels = { "/": "Tổng quan", "/tong-quan": "Tổng quan", "/tong_quan": "Tổng quan", "/phan-tich-thi-truong": "Phân tích thị trường", "/quyet-dinh-gia": "Quyết định giá", "/tour-va-goi-dich-vu": "Mô phỏng & gói dịch vụ", "/mo-phong-&-goi-dich-vu": "Mô phỏng & gói dịch vụ", "/du-lieu-va-thiet-lap": "Dữ liệu và tham số", "/du-lieu-va-tham-so": "Dữ liệu và tham số", "/quan-tri": "Quản trị" };
  const returnLabel = returnLabels[returnPath] || "trang trước";

  const submitPassword = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("newPassword") !== form.get("confirmPassword")) {
      setMessage("Mật khẩu xác nhận chưa khớp.");
      return;
    }
    setMessage("Đã cập nhật mật khẩu.");
    event.currentTarget.reset();
  };

  const logout = () => {
    localStorage.removeItem("tourdss_user");
    window.location.href = "/";
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="settings-header-left"><button className="settings-back-button" type="button" onClick={() => { window.location.href = returnPath; }}>← {returnLabel}</button><div className="brand"><div className="brand-mark"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M13 35V21a11 11 0 0 1 22 0v14" stroke="currentColor" strokeWidth="2" /><path d="M18 35V22a6 6 0 0 1 12 0v13" stroke="currentColor" strokeWidth="2" /><path d="M11 35h26" stroke="#b39462" strokeWidth="2" strokeLinecap="round" /><circle cx="24" cy="13" r="2.2" fill="#b39462" /></svg></div><div><h1>Tour<span>DSS</span></h1></div></div><div className="nav-item active settings-current-page">✦ <span>Cài đặt</span></div></div>
        <UserMenu user={user} roleName={roleName} userName={user.fullName || "Quản trị viên TourDSS"} canAccessSettings isOpen={isAccountOpen} onToggle={() => setIsAccountOpen((open) => !open)} onSettings={() => setIsAccountOpen(false)} onLogout={logout} />
      </header>
      <main className="settings-content">
        <div className="settings-heading"><span className="settings-eyebrow">ACCOUNT · SETTINGS</span><h1>Cài đặt tài khoản</h1><p>Quản lý thông tin đăng nhập, quyền truy cập và các thao tác quản trị hệ thống.</p></div>
        {message && <div className="settings-message">{message}</div>}
        <section className="settings-card">
          <div className="settings-card-title"><span className="settings-icon">◎</span><div><h2>Thông tin tài khoản</h2><p>Xem thông tin cá nhân của tài khoản đang đăng nhập.</p></div></div>
          <div className="settings-account-grid"><label>Tên tài khoản<input value={username} readOnly /></label><label>Email<input value={email} readOnly /></label><label>Vai trò<input value={roleName} readOnly /></label></div>
        </section>
        <section className="settings-card">
          <div className="settings-card-title"><span className="settings-icon">⌁</span><div><h2>Đổi mật khẩu</h2><p>Đổi mật khẩu của tài khoản đang đăng nhập.</p></div></div>
          <form className="settings-password-form" onSubmit={submitPassword}>
            <label>Mật khẩu hiện tại<div className="settings-password-input"><input name="currentPassword" type={showCurrentPassword ? "text" : "password"} required /><button type="button" onClick={() => setShowCurrentPassword((value) => !value)}>{showCurrentPassword ? "Ẩn" : "Hiện"}</button></div></label>
            <label>Mật khẩu mới<div className="settings-password-input"><input name="newPassword" type={showNewPassword ? "text" : "password"} required /><button type="button" onClick={() => setShowNewPassword((value) => !value)}>{showNewPassword ? "Ẩn" : "Hiện"}</button></div></label>
            <label>Xác nhận mật khẩu mới<div className="settings-password-input"><input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required /><button type="button" onClick={() => setShowConfirmPassword((value) => !value)}>{showConfirmPassword ? "Ẩn" : "Hiện"}</button></div></label>
            <button className="settings-primary-button" type="submit">Thay đổi mật khẩu</button>
          </form>
        </section>
        <section className="settings-logout-card"><div><h2>Đăng xuất</h2><p>Thoát tài khoản khỏi hệ thống TourDSS.</p></div><button type="button" onClick={logout}>Thoát tài khoản ↗</button></section>
      </main>
    </div>
  );
}
