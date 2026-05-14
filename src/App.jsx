import { Component, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getToken } from "./auth";
import API from "./api";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import AddPatient from "./pages/AddPatient";
import QueuePage from "./pages/QueuePage";
import Appointments from "./pages/Appointments";
import OPSheet from "./pages/OPSheet";
import Reminders from "./pages/Reminders";
import Recovery from "./pages/Recovery";
import AdminPanel from "./pages/AdminPanel";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import RoleSelector from "./components/RoleSelector";
import PatientPortalApp, { EmergencyPublicPage } from "./portal/PortalApp";
import { getPatientToken } from "./portal/patientApi";

export default function App() {
  const [user, setUser] = useState(null);
  const [resolvedClinicId, setResolvedClinicId] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const appMode = getAppMode();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }
    API.get("/auth/me")
      .then(async (response) => {
        const nextUser = response.data;
        let clinicId = nextUser?.clinic_id ?? null;

        if (!clinicId && nextUser?.role === "admin") {
          try {
            const clinicsResponse = await API.get("/clinics");
            clinicId = clinicsResponse.data?.[0]?.id ?? null;
          } catch (error) {
            console.error("Could not resolve clinic for admin user", error);
          }
        }

        setResolvedClinicId(clinicId);
        setUser({ ...nextUser, clinic_id: clinicId });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: 14, color: "#aaa", fontFamily: "'DM Sans', sans-serif" }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppErrorBoundary>
        {appMode === "admin" ? (
          <AdminRoutes user={user} />
        ) : appMode === "patient" ? (
          <PatientRoutes />
        ) : appMode === "doctor" ? (
          <DoctorRoutes user={user} clinicId={resolvedClinicId} />
        ) : (
          <PublicRoutes user={user} clinicId={resolvedClinicId} />
        )}
      </AppErrorBoundary>
    </BrowserRouter>
  );
}

function getAppMode() {
  const host = window.location.hostname.toLowerCase();
  if (host.startsWith("admin.")) return "admin";
  if (host.startsWith("patient.")) return "patient";
  if (host.startsWith("dashboard.")) return "doctor";
  return "public";
}

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Doctor workspace render failed", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={errorStyles.page}>
        <div style={errorStyles.card}>
          <div style={errorStyles.mark}>DN</div>
          <h1 style={errorStyles.title}>Workspace could not load</h1>
          <p style={errorStyles.copy}>Please refresh the page. If it continues, log out and sign in again.</p>
          <div style={errorStyles.actions}>
            <button style={errorStyles.primary} onClick={() => window.location.reload()}>Refresh</button>
            <button style={errorStyles.secondary} onClick={() => { sessionStorage.clear(); window.location.href = "/doctor/login"; }}>Log in again</button>
          </div>
        </div>
      </div>
    );
  }
}

const errorStyles = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8f7f4", padding: 20, fontFamily: "'DM Sans', sans-serif" },
  card: { width: "100%", maxWidth: 420, background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: 24, boxShadow: "0 20px 60px rgba(15,23,42,0.08)", textAlign: "center" },
  mark: { width: 44, height: 44, margin: "0 auto 14px", borderRadius: 12, background: "#E1F5EE", color: "#0F6E56", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 900 },
  title: { margin: 0, fontSize: 22, color: "#1a1a18" },
  copy: { margin: "8px 0 18px", fontSize: 13, lineHeight: 1.6, color: "#64748b" },
  actions: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" },
  primary: { border: "none", borderRadius: 8, padding: "9px 14px", background: "#1D9E75", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  secondary: { border: "0.5px solid rgba(0,0,0,0.14)", borderRadius: 8, padding: "9px 14px", background: "transparent", color: "#475569", fontSize: 13, fontWeight: 700, cursor: "pointer" },
};

function handleLogin() {
  window.location.reload();
}

function PublicRoutes({ user, clinicId }) {
  return (
    <Routes>
      <Route path="/" element={<RoleSelector doctorSignedIn={Boolean(user)} patientSignedIn={Boolean(getPatientToken())} />} />
      <Route path="/patient/*" element={<PatientPortalApp />} />
      <Route path="/portal/*" element={<PatientPortalApp />} />
      <Route path="/emergency/:token" element={<EmergencyPublicPage />} />
      <Route path="/doctor/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/doctor/patients" />} />
      <Route path="/doctor/*" element={!user ? <Navigate to="/doctor/login" /> : <DoctorLayout user={user} clinicId={clinicId} />} />
      <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/patients" />} />
      <Route path="/*" element={!user ? <Navigate to="/login" /> : <Layout user={user} clinicId={clinicId} />} />
    </Routes>
  );
}

function DoctorRoutes({ user, clinicId }) {
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
      <Route path="/doctor/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/doctor/dashboard" />} />
      <Route path="/doctor/*" element={!user ? <Navigate to="/login" /> : <DoctorLayout user={user} clinicId={clinicId} />} />
      <Route path="/*" element={!user ? <Navigate to="/login" /> : <Layout user={user} clinicId={clinicId} />} />
    </Routes>
  );
}

function PatientRoutes() {
  return (
    <Routes>
      <Route path="/emergency/:token" element={<EmergencyPublicPage />} />
      <Route path="/*" element={<PatientPortalApp />} />
    </Routes>
  );
}

function AdminRoutes({ user }) {
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
      <Route path="/*" element={!user ? <Navigate to="/login" /> : user?.role === "admin" ? <OwnerLayout user={user} /> : <AdminDenied />} />
    </Routes>
  );
}

function Layout({ user, clinicId }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f7f4", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar user={user} />
      <main style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard clinicId={clinicId} />} />
          <Route path="/queue" element={<QueuePage clinicId={clinicId} />} />
          <Route path="/appointments" element={<Appointments clinicId={clinicId} />} />
          <Route path="/patients" element={<Patients clinicId={clinicId} />} />
          <Route path="/patients/add" element={<AddPatient clinicId={clinicId} />} />
          <Route path="/patients/:patientId" element={<OPSheet clinicId={clinicId} user={user} />} />
          <Route path="/reminders" element={<Reminders clinicId={clinicId} />} />
          <Route path="/recovery" element={<Recovery clinicId={clinicId} />} />
          <Route path="/admin" element={user?.role === "admin" ? <AdminPanel /> : <Navigate to="/patients" />} />
          <Route path="/admin/staff" element={user?.role === "admin" ? <AdminPanel /> : <Navigate to="/patients" />} />
          <Route path="/settings" element={<Settings user={user} />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function DoctorLayout({ user, clinicId }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f7f4", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar user={user} basePath="/doctor" />
      <main style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        <Routes>
          <Route path="dashboard" element={<Dashboard clinicId={clinicId} />} />
          <Route path="queue" element={<QueuePage clinicId={clinicId} />} />
          <Route path="appointments" element={<Appointments clinicId={clinicId} />} />
          <Route path="patients" element={<Patients clinicId={clinicId} />} />
          <Route path="patients/add" element={<AddPatient clinicId={clinicId} />} />
          <Route path="patients/:patientId" element={<OPSheet clinicId={clinicId} user={user} />} />
          <Route path="reminders" element={<Reminders clinicId={clinicId} />} />
          <Route path="recovery" element={<Recovery clinicId={clinicId} />} />
          <Route path="admin" element={<Navigate to="/doctor/patients" />} />
          <Route path="admin/staff" element={<Navigate to="/doctor/patients" />} />
          <Route path="settings" element={<Navigate to="/doctor/patients" />} />
          <Route path="" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function OwnerLayout({ user }) {
  return (
    <div style={ownerStyles.shell}>
      <aside style={ownerStyles.sidebar}>
        <div style={ownerStyles.brand}>
          <img src="/logo.png" alt="DocNudge" style={ownerStyles.logoImg} />
          <span style={ownerStyles.brandSub}>Owner Console</span>
        </div>
        <nav style={ownerStyles.nav}>
          <a style={ownerStyles.navItem} href="/">Clinics, staff and billing</a>
          <a style={ownerStyles.navItem} href="/settings">Admin settings</a>
        </nav>
        <div style={ownerStyles.footer}>
          <div style={ownerStyles.avatar}>{user?.email?.[0]?.toUpperCase() || "A"}</div>
          <div style={{ minWidth: 0 }}>
            <div style={ownerStyles.userName}>{user?.email || "Admin"}</div>
            <div style={ownerStyles.userRole}>System owner</div>
          </div>
        </div>
      </aside>
      <main style={ownerStyles.main}>
        <Routes>
          <Route path="/" element={<AdminPanel />} />
          <Route path="/settings" element={<Settings user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AdminDenied() {
  return (
    <div style={ownerStyles.denied}>
      <div style={ownerStyles.deniedCard}>
        <h1 style={ownerStyles.deniedTitle}>Admin access required</h1>
        <p style={ownerStyles.deniedCopy}>This workspace is only for the DocNudge owner account.</p>
        <button style={ownerStyles.deniedBtn} onClick={() => { sessionStorage.clear(); window.location.href = "/login"; }}>
          Use another login
        </button>
      </div>
    </div>
  );
}

const ownerStyles = {
  shell: { display: "flex", minHeight: "100vh", background: "#f7f8fc", fontFamily: "'DM Sans', sans-serif" },
  sidebar: { width: 260, minHeight: "100vh", background: "#0a0d14", color: "#fff", padding: 18, display: "flex", flexDirection: "column", gap: 18, flexShrink: 0 },
  brand: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.1)" },
  logoImg: { width: 150, background: "#fff", borderRadius: 8, padding: 6 },
  mark: { width: 40, height: 40, borderRadius: 10, background: "#c9a227", color: "#0a0d14", display: "grid", placeItems: "center", fontWeight: 900 },
  brandName: { display: "block", fontSize: 16 },
  brandSub: { display: "block", color: "#c9a227", fontSize: 12, marginTop: 2 },
  nav: { display: "flex", flexDirection: "column", gap: 8 },
  navItem: { color: "rgba(255,255,255,0.78)", textDecoration: "none", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "10px 12px", fontSize: 13 },
  footer: { marginTop: "auto", display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14 },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "#c9a227", color: "#0a0d14", display: "grid", placeItems: "center", fontWeight: 800, flexShrink: 0 },
  userName: { fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  userRole: { fontSize: 11, color: "#c9a227", marginTop: 2 },
  main: { flex: 1, minWidth: 0, overflow: "auto" },
  denied: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f8fc", padding: 20, fontFamily: "'DM Sans', sans-serif" },
  deniedCard: { maxWidth: 420, background: "#fff", border: "1px solid #e2e6f0", borderRadius: 12, padding: 24, textAlign: "center" },
  deniedTitle: { margin: 0, fontSize: 22, color: "#0a0d14" },
  deniedCopy: { color: "#64748b", fontSize: 13, lineHeight: 1.6 },
  deniedBtn: { border: "none", borderRadius: 8, background: "#0a0d14", color: "#fff", padding: "9px 14px", fontWeight: 700, cursor: "pointer" },
};
