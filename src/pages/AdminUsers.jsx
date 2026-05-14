import { useEffect, useState } from "react";
import { getClinics, createUser } from "../api";

export default function AdminUsers() {
  const [clinics, setClinics] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", login_id: "", password: "", role: "receptionist", clinic_id: "" });
  const [status, setStatus] = useState(null);

  useEffect(() => { getClinics().then((r) => setClinics(r.data)); }, []);

  const set = (f) => (e) => {
    const val = e.target.value;
    setForm((p) => {
      const next = { ...p, [f]: val };
      // auto-fill login_id from email if user hasn't customised it yet
      if (f === "email" && (p.login_id === "" || p.login_id === p.email)) {
        next.login_id = val;
      }
      return next;
    });
  };

  async function submit() {
    try {
      const payload = { ...form, clinic_id: form.clinic_id ? parseInt(form.clinic_id) : null };
      const result = await createUser(payload);
      const loginIdNote = result?.data?.login_id ? ` Login ID: ${result.data.login_id}` : "";
      setStatus({ ok: true, msg: `User "${form.email}" created.${loginIdNote} Share the Login ID with the doctor.` });
      setForm({ name: "", email: "", login_id: "", password: "", role: "receptionist", clinic_id: "" });
    } catch (e) {
      setStatus({ ok: false, msg: e.response?.data?.detail || "Failed." });
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: "#111827" }}>User Management</div>
        <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 3 }}>Create login accounts for clinic staff and doctors.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 16, maxWidth: 800 }}>
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 13.5, fontWeight: 600 }}>Create User Account</div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <F label="Full Name">
                <input style={inp} placeholder="Dr. Ravi Kumar" value={form.name} onChange={set("name")} />
              </F>
              <F label="Email">
                <input style={inp} type="email" placeholder="doctor@clinic.com" value={form.email} onChange={set("email")} />
              </F>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <F label={<>Login ID <span style={{ color: "#6b7280", fontWeight: 400 }}>(unique, used to sign in)</span></>}>
                <input style={inp} placeholder="dr.ravi.clinic1" value={form.login_id} onChange={set("login_id")} />
              </F>
              <F label="Password">
                <input style={inp} type="password" placeholder="Strong password" value={form.password} onChange={set("password")} />
              </F>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <F label="Role">
                <select style={sel} value={form.role} onChange={set("role")}>
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Admin</option>
                </select>
              </F>
              <F label="Clinic">
                <select style={sel} value={form.clinic_id} onChange={set("clinic_id")}>
                  <option value="">— Admin (no clinic) —</option>
                  {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </F>
            </div>
            {status && (
              <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 500, background: status.ok ? "#ecfdf5" : "#fef2f2", color: status.ok ? "#065f46" : "#991b1b", border: `1px solid ${status.ok ? "#6ee7b7" : "#fca5a5"}` }}>
                {status.ok ? "✓ " : "✗ "}{status.msg}
              </div>
            )}
          </div>
          <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
            <button style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#1a56db,#0d9488)", color: "white", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Inter,sans-serif" }} onClick={submit}>
              Create Account →
            </button>
          </div>
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 12 }}>Role Permissions</div>
          <div style={{ fontSize: 12.5, color: "#111827", lineHeight: 1.6, marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
            <strong>Doctor</strong> — assigned clinic, patients &amp; prescriptions
          </div>
          <div style={{ fontSize: 12.5, color: "#111827", lineHeight: 1.6, marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
            <strong>Admin</strong> — all clinics, all patients, create users
          </div>
          <div style={{ fontSize: 12.5, color: "#111827", lineHeight: 1.6, marginBottom: 12 }}>
            <strong>Receptionist</strong> — only their assigned clinic
          </div>
          <div style={{ background: "#fffbeb", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: 10, fontSize: 12, color: "#92400e", marginBottom: 8 }}>
            <strong>Multiple doctors, same email?</strong><br />Give each a unique Login ID (e.g. dr.ravi.clinic1, dr.ravi.clinic2) — they sign in with the Login ID, not the email.
          </div>
          <div style={{ background: "#f0fdfa", border: "1px solid rgba(13,148,136,0.2)", borderRadius: 8, padding: 12, fontSize: 12.5, color: "#0d9488" }}>
            Login URL:<br /><strong>dashboard.docnudge.in</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function F({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

const inp = { padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13.5, fontFamily: "Inter,sans-serif", color: "#111827", outline: "none", width: "100%", boxSizing: "border-box" };
const sel = { ...inp, background: "#fff" };
