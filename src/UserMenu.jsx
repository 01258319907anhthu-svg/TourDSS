export default function UserMenu({ user, roleName, userName, roleOptions = [], activeRole, onRoleChange, canAccessSettings = true, isOpen, onToggle, onSettings, onLogout }) {
  const initials = user?.initials || "AD";
  const username = user?.username || "admin";

  return (
    <div className="user-menu-wrap">
      <button className="avatar-button" type="button" aria-label="Mở menu tài khoản" aria-expanded={isOpen} onClick={onToggle}>
        <span className="avatar">{initials}</span><span className="avatar-name">{roleName}</span>
      </button>
      {isOpen && <div className="account-menu">
        <div className="account-menu-head"><span className="avatar large-avatar">{initials}</span><div><strong>{roleName}</strong><small>{userName} · {username}</small></div></div>
        <div className="account-role"><span>THÔNG TIN CƠ BẢN</span><b>{userName}</b><small>Tài khoản · {username}</small></div>
        {user?.isDemo && roleOptions.length > 0 && <div className="demo-role-switcher">
          <span>VAI TRÒ DEMO</span>
          <select aria-label="Chọn vai trò demo" value={activeRole} onChange={(event) => onRoleChange(event.target.value)}>
            {roleOptions.map((option) => <option key={option.role} value={option.role}>{option.roleName}</option>)}
          </select>
          <small>Đang chọn: {roleName}</small>
        </div>}
        {canAccessSettings && <div className="account-menu-links"><button type="button" onClick={onSettings}>⚙ Cài đặt</button></div>}
        <button className="logout-button" type="button" onClick={onLogout}>↪ Đăng xuất</button>
      </div>}
    </div>
  );
}
