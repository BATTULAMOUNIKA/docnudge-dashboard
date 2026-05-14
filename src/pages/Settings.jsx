import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api";
import { SPECIALITY_OPTIONS } from "../lib/clinicalOptions";

const DOCTOR_TABS = [
  ["profile", "Profile", "ti-user-circle"],
  ["security", "Security", "ti-lock"],
];

const ADMIN_TABS = [
  ["profile", "Clinic profile", "ti-building-hospital"],
  ["reminders", "Reminders", "ti-bell"],
  ["security", "Security", "ti-lock"],
];

export default function Settings({ user, onUserUpdate }) {
  const isAdmin = user?.role === "admin";
  const tabs = isAdmin ? ADMIN_TABS : DOCTOR_TABS;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo(() => {
    const fromQuery = searchParams.get("tab");
    return tabs.some(([id]) => id === fromQuery) ? fromQuery : tabs[0][0];
  }, [searchParams, tabs]);

  function setTab(nextTab) {
    setSearchParams({ tab: nextTab });
  }

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div>
          <div style={styles.eyebrow}>Settings</div>
          <h1 style={styles.heroTitle}>{isAdmin ? "Clinic administration" : "Doctor profile and security"}</h1>
          <p style={styles.heroCopy}>
            {isAdmin
              ? "Keep clinic identity, reminder settings, and access details aligned."
              : "Update your name, clinic identity, specialty, and password from one calm workspace."}
          </p>
        </div>
      </section>

      <div style={styles.layout}>
        <aside style={styles.navCard}>
          {tabs.map(([id, label, icon]) => (
            <button key={id} style={{ ...styles.navItem, ...(activeTab === id ? styles.navItemActive : {}) }} onClick={() => setTab(id)}>
              <i className={`ti ${icon}`} />
              <span>{label}</span>
            </button>
          ))}
        </aside>

        <section style={styles.content}>
          {activeTab === "profile" && <ProfilePanel user={user} onUserUpdate={onUserUpdate} />}
          {activeTab === "security" && <SecurityPanel user={user} />}
          {isAdmin && activeTab === "reminders" && <ReminderPanel />}
        </section>
      </div>
    </div>
  );
}

function ProfilePanel({ user, onUserUpdate }) {
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    doctor_name: "",
    designation: "General Physician",
    city: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("/clinics");
      const current = response.data?.[0] || null;
      setClinic(current);
      setForm({
        name: current?.name || "",
        doctor_name: user?.doctor_name || current?.doctor_name || user?.name || "",
        designation: current?.designation || user?.designation || "General Physician",
        city: current?.city || "",
        phone: current?.phone || "",
        email: current?.email || user?.email || "",
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const response = await API.put("/clinic/settings", {
        name: form.name,
        doctor_name: form.doctor_name,
        designation: form.designation,
        city: form.city,
        phone: form.phone,
        email: form.email,
      });
      const payload = response.data || {};
      setClinic(payload);
      onUserUpdate?.({
        name: payload.user_name || form.doctor_name,
        clinic_name: payload.name,
        doctor_name: payload.doctor_name,
        designation: payload.designation,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article style={styles.panel}>
      <div style={styles.panelHeader}>
        <div>
          <h2 style={styles.panelTitle}>My profile</h2>
          <p style={styles.panelCopy}>This is the doctor identity shown in patient records, OP sheets, and the sidebar profile.</p>
        </div>
        {saved && <span style={styles.savedPill}>Saved</span>}
      </div>

      {loading ? (
        <div style={styles.emptyState}>Loading profile...</div>
      ) : (
        <>
          <div style={styles.profileHero}>
            <div style={styles.avatar}>{initials(form.doctor_name || form.name || "Doctor")}</div>
            <div>
              <strong style={styles.profileName}>Dr. {form.doctor_name || "Doctor"}</strong>
              <div style={styles.profileSub}>{form.name || "Clinic"} · {form.designation || "General Physician"}</div>
            </div>
          </div>

          <div style={styles.formGrid}>
            <Field label="Doctor name">
              <input style={styles.input} value={form.doctor_name} onChange={(event) => setForm((current) => ({ ...current, doctor_name: event.target.value }))} />
            </Field>
            <Field label="Clinic name">
              <input style={styles.input} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </Field>
            <Field label="Specialty">
              <select style={styles.input} value={form.designation} onChange={(event) => setForm((current) => ({ ...current, designation: event.target.value }))}>
                {SPECIALITY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Clinic city">
              <input style={styles.input} value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
            </Field>
            <Field label="Clinic phone">
              <input style={styles.input} value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            </Field>
            <Field label="Clinic email">
              <input style={styles.input} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            </Field>
          </div>

          <div style={styles.infoStrip}>
            <i className="ti ti-info-circle" />
            <span>Consulting doctor names now come from this profile, not from the clinic fallback label.</span>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
          <div style={styles.footer}>
            <button style={styles.primaryBtn} disabled={saving} onClick={saveProfile}>
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </>
      )}
    </article>
  );
}

function SecurityPanel({ user }) {
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function changePassword() {
    if (!pw.current || !pw.next || !pw.confirm) {
      setError("Fill all password fields.");
      return;
    }
    if (pw.next !== pw.confirm) {
      setError("New password and confirm password do not match.");
      return;
    }
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await API.put("/auth/change-password", { current_password: pw.current, new_password: pw.next });
      setPw({ current: "", next: "", confirm: "" });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article style={styles.panel}>
      <div style={styles.panelHeader}>
        <div>
          <h2 style={styles.panelTitle}>Password and access</h2>
          <p style={styles.panelCopy}>{user?.login_id || user?.email || "Current account"} · Keep your doctor login secure.</p>
        </div>
        {saved && <span style={styles.savedPill}>Updated</span>}
      </div>

      <div style={styles.formGrid}>
        <Field label="Current password">
          <input style={styles.input} type="password" value={pw.current} onChange={(event) => setPw((current) => ({ ...current, current: event.target.value }))} />
        </Field>
        <Field label="New password">
          <input style={styles.input} type="password" value={pw.next} onChange={(event) => setPw((current) => ({ ...current, next: event.target.value }))} />
        </Field>
        <Field label="Confirm password">
          <input style={styles.input} type="password" value={pw.confirm} onChange={(event) => setPw((current) => ({ ...current, confirm: event.target.value }))} />
        </Field>
      </div>
      {error && <div style={styles.errorBox}>{error}</div>}
      <div style={styles.footer}>
        <button style={styles.primaryBtn} disabled={saving} onClick={changePassword}>
          {saving ? "Updating..." : "Update password"}
        </button>
      </div>
    </article>
  );
}

function ReminderPanel() {
  const [form, setForm] = useState({ two_days_time: "10:00", day_before_time: "18:00", morning_time: "08:00", missed_days: 3 });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaved(false);
    setError("");
    try {
      await API.put("/settings/reminders", form);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save reminder settings.");
    }
  }

  return (
    <article style={styles.panel}>
      <div style={styles.panelHeader}>
        <div>
          <h2 style={styles.panelTitle}>Reminder schedule</h2>
          <p style={styles.panelCopy}>Control when the clinic reminder engine sends follow-up nudges.</p>
        </div>
        {saved && <span style={styles.savedPill}>Saved</span>}
      </div>
      <div style={styles.formGrid}>
        <Field label="Two days before"><input style={styles.input} type="time" value={form.two_days_time} onChange={(event) => setForm((current) => ({ ...current, two_days_time: event.target.value }))} /></Field>
        <Field label="Day before"><input style={styles.input} type="time" value={form.day_before_time} onChange={(event) => setForm((current) => ({ ...current, day_before_time: event.target.value }))} /></Field>
        <Field label="Morning of visit"><input style={styles.input} type="time" value={form.morning_time} onChange={(event) => setForm((current) => ({ ...current, morning_time: event.target.value }))} /></Field>
        <Field label="Missed patient days"><input style={styles.input} type="number" min={1} max={14} value={form.missed_days} onChange={(event) => setForm((current) => ({ ...current, missed_days: Number(event.target.value) }))} /></Field>
      </div>
      {error && <div style={styles.errorBox}>{error}</div>}
      <div style={styles.footer}>
        <button style={styles.primaryBtn} onClick={save}>Save reminder settings</button>
      </div>
    </article>
  );
}

function Field({ label, children }) {
  return <label style={styles.field}><span>{label}</span>{children}</label>;
}

function initials(value = "") {
  return String(value)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "DN";
}

const styles = {
  page: { padding: "28px 30px 38px", minHeight: "100vh", background: "radial-gradient(circle at top left,#eff8ff 0%,#f7fbff 35%,#f8f6f0 100%)", fontFamily: "'DM Sans', sans-serif", color: "#11243a" },
  hero: { padding: "22px 24px", borderRadius: 28, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(12,68,124,0.08)", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", marginBottom: 18 },
  eyebrow: { fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#0d9488", fontWeight: 700, marginBottom: 8 },
  heroTitle: { margin: 0, fontSize: 28, lineHeight: 1.08, fontWeight: 800 },
  heroCopy: { margin: "8px 0 0", fontSize: 14, color: "#708092", maxWidth: 760, lineHeight: 1.6 },
  layout: { display: "grid", gridTemplateColumns: "240px minmax(0,1fr)", gap: 18 },
  navCard: { padding: 10, borderRadius: 24, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(12,68,124,0.08)", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", height: "fit-content" },
  navItem: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 16, border: "none", background: "transparent", color: "#56697b", fontSize: 14, fontWeight: 700, cursor: "pointer", textAlign: "left" },
  navItemActive: { background: "linear-gradient(135deg,#0c447c,#0d9488)", color: "#fff", boxShadow: "0 14px 28px rgba(12,68,124,0.18)" },
  content: { display: "grid", gap: 18 },
  panel: { borderRadius: 24, background: "rgba(255,255,255,0.92)", border: "1px solid rgba(12,68,124,0.08)", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", padding: 22 },
  panelHeader: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18 },
  panelTitle: { margin: 0, fontSize: 20, fontWeight: 800 },
  panelCopy: { margin: "5px 0 0", fontSize: 13, color: "#708092", lineHeight: 1.6 },
  savedPill: { padding: "7px 12px", borderRadius: 999, background: "#e5fbf7", color: "#0d9488", fontSize: 12, fontWeight: 800 },
  profileHero: { display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 20, background: "#fbfdff", border: "1px solid rgba(12,68,124,0.08)", marginBottom: 18 },
  avatar: { width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,#0c447c,#0d9488)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18 },
  profileName: { display: "block", fontSize: 18, color: "#11243a" },
  profileSub: { marginTop: 4, fontSize: 13, color: "#708092" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 },
  field: { display: "grid", gap: 7, color: "#526677", fontSize: 12, fontWeight: 800, textTransform: "uppercase" },
  input: { width: "100%", padding: "11px 12px", borderRadius: 14, border: "1px solid rgba(12,68,124,0.12)", background: "#fbfdff", color: "#11243a", outline: "none", fontFamily: "inherit" },
  infoStrip: { marginTop: 16, display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 16, background: "#eef5fb", color: "#38536c", fontSize: 13 },
  errorBox: { marginTop: 16, padding: "11px 13px", borderRadius: 14, background: "#fff3f2", border: "1px solid rgba(184,59,46,0.12)", color: "#b83b2e", fontSize: 13 },
  footer: { display: "flex", justifyContent: "flex-end", marginTop: 18 },
  primaryBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#0c447c,#0d9488)", color: "#fff", fontWeight: 800, cursor: "pointer", boxShadow: "0 18px 30px rgba(12,68,124,0.22)" },
  emptyState: { padding: "28px 0", color: "#708092" },
};
