import { useEffect, useState } from "react";
import { getClinics, createUser } from "../api";

export default function AdminUsers() {
  const [clinics, setClinics] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "doctor", clinic_id: "" });
  const [status, setStatus] = useState(null);

  useEffect(() => { getClinics().then((r) => setClinics(r.data)); }, []);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  async function submit() {
    try {
      await createUser({ ...form, clinic_id: form.clinic_id ? parseInt(form.clinic_id) : null });
      setStatus({ ok: true, msg: `Account created for "${form.email}". They can now log in with this email and password.` });
      setForm({ name: "", email: "", password: "", role: "doctor", clinic_id: "" });
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16, maxWidth: 740 }}>
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 13.5, fontWeight: 600 }}>
            <i className="ti ti-user-plus" style={{ marginRight: 8, color: "#0d9488" }} />
            Create User Account
          </div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <F label="Full Name">
                <input style={inp} placeholder="Dr. Ravi Kumar" value={form.name} onChange={set("name")} />
              </F>
              <F label="Email (used to log in)">
                <input style={inp} type="email" placeholder="doctor@clinic.com" value={form.email} onChange={set("email")} />
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
            <F label="Password">
              <input style={inp} type="password" placeholder="Strong password" value={form.password} onChange={set("password")} />
            </F>
            {status && (
              <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 500, background: status.ok ? "#ecfdf5" : "#fef2f2", color: status.ok ? "#065f46" : "#991b1b", border: `1px solid ${status.ok ? "#6ee7b7" : "#fca5a5"}` }}>
                {status.ok ? "✓ " : "✗ "}{status.msg}
              </div>
            )}
          </div>
          <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
            <button style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#1a56db,#0d9488)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "Inter,sans-serif" }} onClick={submit}>
              <i className="ti ti-user-plus" /> Create Account
            </button>
          </div>
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 12 }}>Role Permissions</div>
          <div style={{ fontSize: 12.5, color: "#111827", lineHeight: 1.6, marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
            <i className="ti ti-stethoscope" style={{ marginRight: 6, color: "#0d9488" }} />
            <strong>Doctor</strong> — assigned clinic patients &amp; records
          </div>
          <div style={{ fontSize: 12.5, color: "#111827", lineHeight: 1.6, marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
            <i className="ti ti-shield-check" style={{ marginRight: 6, color: "#1a56db" }} />
            <strong>Admin</strong> — all clinics, create users
          </div>
          <div style={{ fontSize: 12.5, color: "#111827", lineHeight: 1.6, marginBottom: 12 }}>
            <i className="ti ti-id" style={{ marginRight: 6, color: "#6b7280" }} />
            <strong>Receptionist</strong> — assigned clinic only
          </div>
          <div style={{ background: "#f0fdfa", border: "1px solid rgba(13,148,136,0.2)", borderRadius: 8, padding: 12, fontSize: 12.5, color: "#0d9488" }}>
            <i className="ti ti-login" style={{ marginRight: 6 }} />
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
