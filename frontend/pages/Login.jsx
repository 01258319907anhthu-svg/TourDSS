import { useState } from "react";
import "../../src/login.css";

function LoginLogo() {
  return <span className="login-logo-mark"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M13 35V21a11 11 0 0 1 22 0v14" stroke="currentColor" strokeWidth="2" /><path d="M18 35V22a6 6 0 0 1 12 0v13" stroke="currentColor" strokeWidth="2" /><path d="M11 35h26" stroke="#b39462" strokeWidth="2" strokeLinecap="round" /><circle cx="24" cy="13" r="2.2" fill="#b39462" /></svg></span>;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Tài khoản hoặc mật khẩu không đúng.");
      localStorage.setItem("tourdss_user", JSON.stringify(result.user));
      window.location.href = "/";
    } catch (loginError) {
      setError(loginError.message || "Không thể kết nối máy chủ đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  return <main className="login-page">
    <section className="login-visual" aria-label="Không gian khách sạn luxury"><div className="login-visual-overlay" /><div className="login-brand"><LoginLogo /><span>Tour<strong>DSS</strong></span></div><div className="login-visual-copy"><span className="login-eyebrow">REVENUE INTELLIGENCE PLATFORM</span><h1>Quyết định tốt hơn.<br /><em>Doanh thu đẹp hơn.</em></h1><p>Không gian điều hành riêng cho những quyết định giá tinh tế, có dữ liệu và có dấu vết.</p><div className="login-visual-note"><span>01</span><b>Revenue desk</b><small>Luxury hotel & tour management</small></div></div></section>
    <section className="login-panel"><div className="login-panel-inner"><div className="login-mobile-brand"><LoginLogo /><span>Tour<strong>DSS</strong></span></div><span className="login-eyebrow">WELCOME BACK</span><h2>Đăng nhập vào<br /><em>Revenue Desk</em></h2><p className="login-description">Sử dụng tài khoản được cấp để truy cập không gian làm việc của bạn.</p><form className="login-form" onSubmit={handleSubmit}><label>Email hoặc mã tài khoản<input type="text" placeholder="Ví dụ: quan.ly" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /></label><label>Mật khẩu<div className="password-field"><input type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{showPassword ? "Ẩn" : "Hiện"}</button></div></label><div className="login-options"><label className="remember-option"><input type="checkbox" defaultChecked /> <span>Ghi nhớ tài khoản</span></label><button type="button" className="forgot-link">Quên mật khẩu?</button></div>{error && <p className="login-error" role="alert">{error}</p>}<button className="login-submit" type="submit" disabled={loading}>{loading ? "Đang xác thực..." : "Đăng nhập vào hệ thống"} <span>↗</span></button></form><p className="login-footer">© 2026 TourDSS · Hệ thống hỗ trợ quyết định giá</p></div></section>
  </main>;
}
