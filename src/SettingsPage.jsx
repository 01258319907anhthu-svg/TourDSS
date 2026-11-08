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
  const [adminTab, setAdminTab] = useState("Tài khoản");
  const [modelVersion, setModelVersion] = useState("Revenue v2.4");
  const isAdmin = user.role === "admin" || !user.role;
  const roleName = user.roleName || "Quản trị viên";
  const username = user.username || "admin";
  const email = user.email || "admin@tourdss.vn";
  const returnPath = sessionStorage.getItem("tourdss_settings_return") || "/tong_quan";
  const returnLabels = { "/": "Tổng quan", "/tong-quan": "Tổng quan", "/tong_quan": "Tổng quan", "/phan-tich-thi-truong": "Phân tích thị trường", "/quyet-dinh-gia": "Quyết định giá", "/tour-va-goi-dich-vu": "Tour và gói dịch vụ", "/du-lieu-va-thiet-lap": "Dữ liệu và thiết lập" };
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
        {isAdmin && <section className="settings-card"><div className="settings-card-title"><span className="settings-icon">✦</span><div><h2>Quản trị hệ thống</h2><p>Xem dữ liệu vận hành và thực hiện các thao tác quản trị dành riêng cho Quản trị viên.</p></div><span className="settings-admin-badge">ADMIN</span></div><div className="settings-admin-tabs" role="tablist">{["Tài khoản", "Nhập và làm sạch dữ liệu", "Nhật ký thao tác", "Phiên bản mô hình", "Sao lưu dữ liệu"].map((tab) => <button type="button" role="tab" aria-selected={adminTab === tab} className={adminTab === tab ? "active" : ""} key={tab} onClick={() => setAdminTab(tab)}>{tab}</button>)}</div><div className="settings-admin-panel">
          {adminTab === "Tài khoản" && <><h3>Tài khoản</h3><p>Quản lý tài khoản đang có quyền truy cập hệ thống.</p><div className="admin-account-row"><span className="admin-avatar">AD</span><span><strong>admin</strong><small>admin@tourdss.vn · Quản trị viên</small></span><b>Đang hoạt động</b></div><button className="settings-primary-button" type="button" onClick={() => setMessage("Đã mở quản lý tài khoản.")}>Quản lý tài khoản</button></>}
          {adminTab === "Nhập và làm sạch dữ liệu" && <><h3>Nhập và làm sạch dữ liệu</h3><p>Nhập dữ liệu vận hành, kiểm tra lỗi và làm sạch trước khi phân tích.</p><div className="admin-action-grid"><button type="button" onClick={() => setMessage("Đã mở chức năng nhập dữ liệu.")}>＋ Nhập dữ liệu</button><button type="button" onClick={() => setMessage("Đã chạy kiểm tra lỗi dữ liệu.")}>✓ Làm sạch dữ liệu</button></div><div className="admin-data-summary"><div><strong>Lịch sử nhập dữ liệu</strong><span>dat_lieu_dat_cho_thang_11.xlsx · 1.284 bản ghi</span></div><div><strong>Lỗi dữ liệu</strong><span>6 bản ghi cần kiểm tra · 2 trường bị thiếu</span></div></div></>}
          {adminTab === "Nhật ký thao tác" && <><h3>Nhật ký thao tác</h3><p>Theo dõi lịch sử thao tác và các thay đổi quan trọng trong hệ thống.</p><div className="admin-log-list"><p><b>Hôm nay · 09:42</b><span>admin nhập dữ liệu đặt chỗ tháng 11</span></p><p><b>Hôm nay · 09:30</b><span>admin cập nhật phiên bản mô hình Revenue v2.4</span></p><p><b>Hôm qua · 16:18</b><span>admin duyệt bảng giá Deluxe cuối tuần</span></p></div></>}
          {adminTab === "Phiên bản mô hình" && <><h3>Phiên bản mô hình</h3><p>Chọn phiên bản mô hình đang dùng cho dự báo và quyết định giá.</p><label className="admin-select-label">Phiên bản đang áp dụng<select value={modelVersion} onChange={(event) => setModelVersion(event.target.value)}><option>Revenue v2.4</option><option>Revenue v2.3</option><option>Revenue v2.2</option></select></label><button className="settings-primary-button" type="button" onClick={() => setMessage(`Đã chọn ${modelVersion}.`)}>Chọn phiên bản mô hình</button></>}
          {adminTab === "Sao lưu dữ liệu" && <><h3>Sao lưu dữ liệu</h3><p>Tạo bản sao lưu hoặc khôi phục dữ liệu quản trị khi cần.</p><div className="admin-backup-row"><div><strong>Bản sao lưu gần nhất</strong><span>06/11/2026 · 09:15 · 248 MB</span></div><span className="settings-status-pill">An toàn</span></div><div className="admin-action-grid"><button type="button" onClick={() => setMessage("Đã tạo bản sao lưu mới.")}>＋ Sao lưu ngay</button><button type="button" onClick={() => setMessage("Đã mở danh sách bản sao lưu.")}>Xem bản sao lưu</button></div></>}
        </div></section>}
        <section className="settings-logout-card"><div><h2>Đăng xuất</h2><p>Thoát tài khoản khỏi hệ thống TourDSS.</p></div><button type="button" onClick={logout}>Thoát tài khoản ↗</button></section>
      </main>
    </div>
  );
}
