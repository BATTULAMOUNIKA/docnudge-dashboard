import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../auth";

const NAV = [
  { to: "/dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
  { to: "/patients", icon: "ti-users", label: "Patients" },
  { to: "/appointments", icon: "ti-calendar", label: "Appointments" },
  { to: "/reminders", icon: "ti-bell", label: "Reminders" },
  { to: "/recovery", icon: "ti-heart-rate-monitor", label: "Recovery" },
];

const BOTTOM_NAV = [
  { to: "/admin", icon: "ti-building-hospital", label: "Clinics", adminOnly: true },
  { to: "/settings", icon: "ti-settings", label: "Settings" },
];

export default function Sidebar({ user, basePath = "", showAdminNav = true }) {
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const doctorWorkspace = Boolean(basePath);
  const doctorName = user?.doctor_name || user?.email?.split("@")[0] || "Doctor";

  function handleLogout() {
    logout();
    navigate(basePath ? `${basePath}/login` : "/login");
  }

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <img src="/logo.png" alt="DocNudge" style={styles.logoImg} />
      </div>

      <nav style={styles.nav}>
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} basePath={basePath} />
        ))}

        <div style={styles.divider} />

        {!doctorWorkspace && showAdminNav && BOTTOM_NAV.map((item) => (item.adminOnly && !isAdmin ? null : <NavItem key={item.to} {...item} basePath={basePath} />))}
      </nav>

      <div style={styles.footer}>
        <button style={styles.userPill} onClick={() => navigate(`${basePath}/settings?tab=profile`)}>
          <div style={styles.avatar}>{user?.email?.slice(0, 2).toUpperCase() || "DR"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.userName}>{doctorName}</div>
            <div style={styles.userRole}>{user?.designation || user?.role || "admin"}</div>
          </div>
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleLogout();
            }}
            title="Logout"
            style={styles.logoutBtn}
          >
            <i className="ti ti-logout" style={{ fontSize: 15 }} />
          </button>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ to, icon, label, basePath = "" }) {
  return (
    <NavLink
      to={`${basePath}${to}`}
      style={({ isActive }) => ({
        ...styles.navItem,
        ...(isActive ? styles.navActive : {}),
      })}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
      {label}
    </NavLink>
  );
}

const styles = {
  sidebar: { width: 228, minHeight: "100vh", background: "linear-gradient(180deg,#f7fbff 0%,#fdfcf7 100%)", borderRight: "1px solid rgba(12,68,124,0.08)", display: "flex", flexDirection: "column", flexShrink: 0, fontFamily: "'DM Sans', sans-serif" },
  logo: { padding: "18px 18px 14px", borderBottom: "1px solid rgba(12,68,124,0.06)" },
  logoImg: { width: 142, maxWidth: "100%", display: "block" },
  nav: { padding: "14px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  divider: { height: "1px", background: "rgba(12,68,124,0.08)", margin: "8px 6px" },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 14, cursor: "pointer", fontSize: 13, color: "#4f5f6f", textDecoration: "none", transition: "background 0.12s, color 0.12s, transform 0.12s" },
  navActive: { background: "linear-gradient(135deg,rgba(12,68,124,0.94),rgba(13,148,136,0.92))", color: "#fff", fontWeight: 700, boxShadow: "0 12px 30px rgba(12,68,124,0.18)" },
  footer: { padding: "12px 12px 18px", borderTop: "1px solid rgba(12,68,124,0.06)" },
  userPill: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 16, border: "1px solid rgba(12,68,124,0.08)", background: "#fff", cursor: "pointer", textAlign: "left", boxShadow: "0 10px 25px rgba(15,23,42,0.05)" },
  avatar: { width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#0c447c,#0d9488)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 },
  userName: { fontSize: 13, fontWeight: 700, color: "#11243a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  userRole: { fontSize: 11, color: "#708092", textTransform: "capitalize", marginTop: 2 },
  logoutBtn: { background: "#f6f8fb", border: "1px solid rgba(12,68,124,0.08)", cursor: "pointer", color: "#708092", padding: 7, borderRadius: 10, display: "flex", alignItems: "center" },
};
