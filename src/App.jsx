import { Component, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [user, setUser] = useState(null);
  const [resolvedClinicId, setResolvedClinicId] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
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
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={loadingStyles.page}>
        <div style={loadingStyles.card}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppErrorBoundary>
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />} />
          <Route
            path="/*"
            element={!user ? <Navigate to="/login" replace /> : <DoctorWorkspace user={user} clinicId={resolvedClinicId} />}
          />
        </Routes>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}

function DoctorWorkspace({ user, clinicId }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f7f4", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar user={user} showAdminNav={false} />
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
          <Route path="/settings" element={<Settings user={user} />} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/admin/staff" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
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
      <div style={loadingStyles.page}>
        <div style={loadingStyles.card}>
          <div style={loadingStyles.title}>Dashboard could not load</div>
          <div style={loadingStyles.copy}>Please refresh the page or sign in again.</div>
          <div style={loadingStyles.actions}>
            <button style={loadingStyles.primary} onClick={() => window.location.reload()}>
              Refresh
            </button>
            <button
              style={loadingStyles.secondary}
              onClick={() => {
                sessionStorage.clear();
                window.location.href = "/login";
              }}
            >
              Sign in again
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function handleLogin() {
  window.location.reload();
}

const loadingStyles = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8f7f4", padding: 20, fontFamily: "'DM Sans', sans-serif" },
  card: { width: "100%", maxWidth: 420, background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: 24, boxShadow: "0 20px 60px rgba(15,23,42,0.08)", textAlign: "center" },
  title: { margin: 0, fontSize: 22, color: "#1a1a18", fontWeight: 700 },
  copy: { margin: "8px 0 18px", fontSize: 13, lineHeight: 1.6, color: "#64748b" },
  actions: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" },
  primary: { border: "none", borderRadius: 8, padding: "9px 14px", background: "#1D9E75", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  secondary: { border: "0.5px solid rgba(0,0,0,0.14)", borderRadius: 8, padding: "9px 14px", background: "transparent", color: "#475569", fontSize: 13, fontWeight: 700, cursor: "pointer" },
};
