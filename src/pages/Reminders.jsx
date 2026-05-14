import { useEffect, useMemo, useState } from "react";
import API from "../api";

function localDateString(offsetDays = 0) {
  const date = new Date(Date.now() + offsetDays * 86400000);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function normalizeLogs(logRows) {
  return (logRows || []).map((row) => {
    if (Array.isArray(row)) {
      const [log, patient] = row;
      return { ...log, patient_name: patient?.name, phone: patient?.phone };
    }
    return row;
  });
}

function displayPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return value || "-";
}

const FILTERS = [
  ["upcoming", "Upcoming"],
  ["sent", "Sent"],
  ["failed", "Failed"],
];

export default function Reminders({ clinicId }) {
  const [filter, setFilter] = useState("upcoming");
  const [logs, setLogs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [clinicId]);

  async function loadAll() {
    if (!clinicId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [logResponse, appointmentResponse] = await Promise.all([
        API.get(`/reminder-logs/${clinicId}`),
        API.get(`/appointments/${clinicId}`),
      ]);
      setLogs(normalizeLogs(logResponse.data));
      setAppointments(appointmentResponse.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function triggerReminder(type) {
    try {
      await API.post(`/test/${type}`);
      await loadAll();
      alert(`${type} reminder triggered.`);
    } catch {
      alert("Error triggering reminder");
    }
  }

  const today = localDateString(0);
  const dayAfter = localDateString(2);
  const upcoming = appointments.filter((appointment) => appointment.next_visit && appointment.next_visit.slice(0, 10) >= today && appointment.next_visit.slice(0, 10) <= dayAfter);
  const sent = logs.filter((log) => log.success);
  const failed = logs.filter((log) => !log.success);
  const counts = { upcoming: upcoming.length, sent: sent.length, failed: failed.length };
  const visible = filter === "upcoming" ? upcoming : filter === "failed" ? failed : sent;

  const stats = useMemo(() => ([
    { label: "Due next 2 days", value: upcoming.length, icon: "ti-calendar-time", tone: "blue" },
    { label: "Sent today view", value: sent.length, icon: "ti-checks", tone: "green" },
    { label: "Failed sends", value: failed.length, icon: "ti-alert-circle", tone: "amber" },
  ]), [failed.length, sent.length, upcoming.length]);

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div>
          <div style={styles.eyebrow}>Reminder desk</div>
          <h1 style={styles.heroTitle}>Follow-up reminders</h1>
          <p style={styles.heroCopy}>The reminder page now matches the main dashboard style while keeping WhatsApp timing and delivery status visible.</p>
        </div>
        <div style={styles.heroActions}>
          <button style={styles.secondaryBtn} onClick={() => triggerReminder("two-days-before")}>2-day run</button>
          <button style={styles.secondaryBtn} onClick={() => triggerReminder("day-before")}>Day-before run</button>
          <button style={styles.primaryBtn} onClick={() => triggerReminder("morning")}>Morning run</button>
        </div>
      </section>

      <section style={styles.statGrid}>
        {stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}
      </section>

      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Reminder views</h2>
            <p style={styles.cardCopy}>Upcoming shows patients who need a reminder. Sent shows who already received one. Failed shows delivery errors.</p>
          </div>
          <button style={styles.refreshBtn} onClick={loadAll}><i className="ti ti-refresh" /> Refresh</button>
        </div>

        <div style={styles.tabs}>
          {FILTERS.map(([key, label]) => (
            <button key={key} style={{ ...styles.tab, ...(filter === key ? styles.tabActive : {}) }} onClick={() => setFilter(key)}>
              {label}
              <span>{counts[key] || 0}</span>
            </button>
          ))}
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <Th>Patient</Th>
                <Th>Reason</Th>
                <Th>Date</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td style={styles.emptyCell} colSpan="4">Loading reminders...</td></tr>
              ) : visible.length === 0 ? (
                <tr><td style={styles.emptyCell} colSpan="4">No entries in this reminder view.</td></tr>
              ) : filter === "upcoming" ? (
                visible.map((appointment) => (
                  <tr key={`${appointment.patient_id}-${appointment.next_visit}`}>
                    <td style={styles.td}><strong>{appointment.patient_name || "Patient"}</strong></td>
                    <td style={styles.td}>{appointment.condition || appointment.followup_type || displayPhone(appointment.phone)}</td>
                    <td style={styles.td}>{appointment.next_visit?.slice(0, 10) || "-"}</td>
                    <td style={styles.td}><StatusPill status="scheduled" /></td>
                  </tr>
                ))
              ) : (
                visible.map((log) => (
                  <tr key={log.id}>
                    <td style={styles.td}><strong>{log.patient_name || `Patient #${log.patient_id}`}</strong></td>
                    <td style={styles.td}>{filter === "failed" ? (log.error || "Delivery failed") : (log.reminder_type || "Reminder sent")}</td>
                    <td style={styles.td}>{log.sent_at?.slice(0, 16).replace("T", " ") || "-"}</td>
                    <td style={styles.td}><StatusPill status={filter === "failed" ? "failed" : "sent"} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ScheduleCard({ time, label }) {
  return (
    <article style={styles.scheduleCard}>
      <div style={styles.scheduleIcon}><i className="ti ti-clock" /></div>
      <strong style={styles.scheduleTime}>{time}</strong>
      <span style={styles.scheduleLabel}>{label}</span>
    </article>
  );
}

function StatCard({ stat }) {
  const palette = {
    blue: ["#eaf3ff", "#0c447c"],
    green: ["#eef9eb", "#2f7a32"],
    amber: ["#fff4e8", "#b45309"],
  }[stat.tone];
  return (
    <article style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: palette[0], color: palette[1] }}>
        <i className={`ti ${stat.icon}`} />
      </div>
      <strong style={styles.statValue}>{stat.value}</strong>
      <span style={styles.statLabel}>{stat.label}</span>
    </article>
  );
}

function StatusPill({ status }) {
  const normalized = String(status).toLowerCase();
  const palette = normalized === "failed"
    ? ["#fff0ef", "#b83b2e"]
    : normalized === "sent"
      ? ["#eef9eb", "#2f7a32"]
      : ["#eaf3ff", "#0c447c"];
  return <span style={{ ...styles.statusPill, background: palette[0], color: palette[1] }}>{normalized}</span>;
}

function Th({ children }) {
  return <th style={styles.th}>{children}</th>;
}

const styles = {
  page: { padding: "28px 30px 38px", minHeight: "100vh", background: "radial-gradient(circle at top left,#eff8ff 0%,#f7fbff 35%,#f8f6f0 100%)", fontFamily: "'DM Sans', sans-serif", color: "#11243a" },
  hero: { display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center", padding: "22px 24px", borderRadius: 28, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(12,68,124,0.08)", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", marginBottom: 18 },
  eyebrow: { fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#0d9488", fontWeight: 700, marginBottom: 8 },
  heroTitle: { margin: 0, fontSize: 28, lineHeight: 1.08, fontWeight: 800 },
  heroCopy: { margin: "8px 0 0", fontSize: 14, color: "#708092", maxWidth: 720, lineHeight: 1.6 },
  heroActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  primaryBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#0c447c,#0d9488)", color: "#fff", fontWeight: 800, cursor: "pointer" },
  secondaryBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 14, border: "1px solid rgba(12,68,124,0.12)", background: "#fff", color: "#0c447c", fontWeight: 700, cursor: "pointer" },
  scheduleGrid: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 14, marginBottom: 18 },
  scheduleCard: { borderRadius: 22, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(12,68,124,0.08)", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", padding: 18, display: "grid", gap: 8 },
  scheduleIcon: { width: 42, height: 42, borderRadius: 15, background: "#eef5fb", color: "#0c447c", display: "grid", placeItems: "center", fontSize: 18 },
  scheduleTime: { fontSize: 22, color: "#11243a" },
  scheduleLabel: { fontSize: 13, color: "#516577", fontWeight: 700 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 14, marginBottom: 18 },
  statCard: { borderRadius: 22, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(12,68,124,0.08)", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", padding: 18, display: "grid", gap: 8 },
  statIcon: { width: 42, height: 42, borderRadius: 15, display: "grid", placeItems: "center", fontSize: 18 },
  statValue: { fontSize: 28, lineHeight: 1, color: "#11243a" },
  statLabel: { fontSize: 13, color: "#516577", fontWeight: 700 },
  card: { background: "rgba(255,255,255,0.9)", border: "1px solid rgba(12,68,124,0.08)", borderRadius: 24, padding: 20, boxShadow: "0 18px 40px rgba(15,23,42,0.06)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 },
  cardTitle: { margin: 0, fontSize: 18, fontWeight: 800 },
  cardCopy: { margin: "5px 0 0", color: "#708092", fontSize: 13, lineHeight: 1.6 },
  refreshBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(12,68,124,0.12)", background: "#fff", color: "#0c447c", fontWeight: 700, cursor: "pointer" },
  tabs: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  tab: { display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 999, border: "1px solid rgba(12,68,124,0.08)", background: "#f8fbff", color: "#55697b", fontWeight: 700, cursor: "pointer" },
  tabActive: { background: "linear-gradient(135deg,#0c447c,#0d9488)", color: "#fff", boxShadow: "0 12px 24px rgba(12,68,124,0.18)" },
  tableWrap: { overflow: "auto", borderRadius: 18, border: "1px solid rgba(12,68,124,0.08)" },
  table: { width: "100%", minWidth: 720, borderCollapse: "collapse", background: "#fff" },
  th: { padding: "14px 16px", background: "#f7fbff", color: "#708092", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid rgba(12,68,124,0.08)", textAlign: "left" },
  td: { padding: "14px 16px", borderBottom: "1px solid rgba(12,68,124,0.06)", fontSize: 13, color: "#31475a", verticalAlign: "middle" },
  emptyCell: { padding: 46, color: "#708092", textAlign: "center" },
  statusPill: { padding: "6px 11px", borderRadius: 999, textTransform: "capitalize", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" },
};
