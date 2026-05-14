import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { sendRecoveryWhatsApp } from "../api";

function appPath(path) {
  return window.location.pathname.startsWith("/doctor") ? `/doctor${path}` : path;
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

function todayString() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
}

const FILTERS = [
  ["overdue", "Overdue patients"],
  ["missed", "Missed visits"],
  ["failed", "Failed WhatsApp"],
  ["optout", "Opted out"],
];

export default function Recovery({ clinicId }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("overdue");
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

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
      const [patientResponse, appointmentResponse, logResponse] = await Promise.all([
        API.get(`/patients/clinic/${clinicId}`),
        API.get(`/appointments/${clinicId}`),
        API.get(`/reminder-logs/${clinicId}`),
      ]);
      setPatients(patientResponse.data || []);
      setAppointments(appointmentResponse.data || []);
      setLogs(normalizeLogs(logResponse.data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const today = todayString();
  const overdue = appointments.filter((appointment) => appointment.next_visit?.slice(0, 10) < today && appointment.status !== "completed");
  const missed = appointments.filter((appointment) => appointment.status === "missed");
  const failedWA = logs.filter((log) => !log.success);
  const optedOut = patients.filter((patient) => patient.opted_out);
  const counts = { overdue: overdue.length, missed: missed.length, failed: failedWA.length, optout: optedOut.length };
  const visible = filter === "overdue" ? overdue : filter === "missed" ? missed : filter === "failed" ? failedWA : optedOut;

  const weeklyStats = useMemo(() => ({
    pipeline: appointments.length,
    newPatients: patients.filter((patient) => patient.created_at?.slice(0, 10) >= today).length,
    returned: appointments.filter((appointment) => appointment.status === "completed").length,
    missed: missed.length,
  }), [appointments, missed.length, patients, today]);

  function generateReport() {
    const summary = overdue.length
      ? `${overdue.length} patients are overdue and need recovery outreach. Failed WhatsApp sends: ${failedWA.length}.`
      : `Follow-up health looks stable this week with ${weeklyStats.returned} completed returns.`;
    const highlights = [
      `${weeklyStats.newPatients} new patients added today`,
      `${weeklyStats.returned} follow-ups completed`,
      `${weeklyStats.missed} missed visits need attention`,
    ];
    const action = overdue.length
      ? "Focus on overdue patients first and retry failed WhatsApp sends."
      : "Keep monitoring reminder delivery and book the next visit before discharge.";
    setReport({ summary, highlights, action });
  }

  async function sendRecovery(patientId, patientName) {
    try {
      await sendRecoveryWhatsApp(patientId);
      alert(`Recovery message sent to ${patientName}`);
    } catch {
      alert("Failed to send recovery message");
    }
  }

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div>
          <div style={styles.eyebrow}>Recovery desk</div>
          <h1 style={styles.heroTitle}>Recovery and follow-up risks</h1>
          <p style={styles.heroCopy}>Overdue follow-ups, missed visits, and delivery problems are now presented in the same visual system as the main doctor dashboard.</p>
        </div>
        <div style={styles.heroActions}>
          <button style={styles.secondaryBtn} onClick={generateReport}><i className="ti ti-sparkles" /> Generate report</button>
          <button style={styles.primaryBtn} onClick={loadAll}><i className="ti ti-refresh" /> Refresh</button>
        </div>
      </section>

      <section style={styles.statGrid}>
        <StatCard label="Pipeline" value={weeklyStats.pipeline} icon="ti-calendar-event" tone="blue" />
        <StatCard label="New patients" value={weeklyStats.newPatients} icon="ti-user-plus" tone="green" />
        <StatCard label="Returns completed" value={weeklyStats.returned} icon="ti-circle-check" tone="teal" />
        <StatCard label="Missed visits" value={weeklyStats.missed} icon="ti-alert-triangle" tone="amber" />
      </section>

      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Clinic recovery summary</h2>
            <p style={styles.cardCopy}>Use this block to spot who needs manual attention before the day closes.</p>
          </div>
        </div>

        {report ? (
          <div style={styles.reportBox}>
            <p style={styles.reportSummary}>{report.summary}</p>
            <div style={styles.reportHighlights}>
              {report.highlights.map((item) => <span key={item} style={styles.highlight}>{item}</span>)}
            </div>
            <div style={styles.recommendation}><strong>Recommended:</strong> {report.action}</div>
          </div>
        ) : (
          <div style={styles.emptyCompact}>Generate the recovery report to see the latest follow-up summary.</div>
        )}
      </section>

      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Recovery views</h2>
            <p style={styles.cardCopy}>Open a patient record or send a recovery message directly from the overdue view.</p>
          </div>
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
                <Th>Context</Th>
                <Th>Date</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td style={styles.emptyCell} colSpan="4">Loading recovery data...</td></tr>
              ) : visible.length === 0 ? (
                <tr><td style={styles.emptyCell} colSpan="4">No entries in this recovery view.</td></tr>
              ) : filter === "overdue" ? (
                visible.map((appointment) => (
                  <tr key={`${appointment.patient_id}-${appointment.next_visit}`}>
                    <td style={styles.td}><strong>{appointment.patient_name || "Patient"}</strong></td>
                    <td style={styles.td}>{appointment.condition || appointment.followup_type || "Follow-up due"}</td>
                    <td style={styles.td}>{appointment.next_visit?.slice(0, 10) || "-"}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div style={styles.actions}>
                        <button style={styles.openBtn} onClick={() => navigate(appPath(`/patients/${appointment.patient_id}`))}>Open patient</button>
                        <button style={styles.recoverBtn} onClick={() => sendRecovery(appointment.patient_id, appointment.patient_name)}>Send message</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filter === "missed" ? (
                visible.map((appointment) => (
                  <tr key={`${appointment.patient_id}-${appointment.next_visit}-missed`}>
                    <td style={styles.td}><strong>{appointment.patient_name || "Patient"}</strong></td>
                    <td style={styles.td}>{appointment.condition || appointment.followup_type || "Missed visit"}</td>
                    <td style={styles.td}>{appointment.next_visit?.slice(0, 10) || "-"}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <button style={styles.openBtn} onClick={() => navigate(appPath(`/patients/${appointment.patient_id}`))}>Open patient</button>
                    </td>
                  </tr>
                ))
              ) : filter === "failed" ? (
                visible.map((log) => (
                  <tr key={log.id}>
                    <td style={styles.td}><strong>{log.patient_name || `Patient #${log.patient_id}`}</strong></td>
                    <td style={styles.td}>{log.error || "Delivery failed"}</td>
                    <td style={styles.td}>{log.sent_at?.slice(0, 10) || "-"}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}><span style={styles.metaPill}>Retry needed</span></td>
                  </tr>
                ))
              ) : (
                visible.map((patient) => (
                  <tr key={patient.id}>
                    <td style={styles.td}><strong>{patient.name}</strong></td>
                    <td style={styles.td}>{patient.condition || "Opted out from reminders"}</td>
                    <td style={styles.td}>{patient.last_visit_at?.slice(0, 10) || patient.created_at?.slice(0, 10) || "-"}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}><span style={styles.metaPill}>Opted out</span></td>
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

function StatCard({ label, value, icon, tone }) {
  const palette = {
    blue: ["#eaf3ff", "#0c447c"],
    teal: ["#e5fbf7", "#0d9488"],
    green: ["#eef9eb", "#2f7a32"],
    amber: ["#fff4e8", "#b45309"],
  }[tone];
  return (
    <article style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: palette[0], color: palette[1] }}>
        <i className={`ti ${icon}`} />
      </div>
      <strong style={styles.statValue}>{value}</strong>
      <span style={styles.statLabel}>{label}</span>
    </article>
  );
}

function Th({ children, align = "left" }) {
  return <th style={{ ...styles.th, textAlign: align }}>{children}</th>;
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
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14, marginBottom: 18 },
  statCard: { borderRadius: 22, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(12,68,124,0.08)", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", padding: 18, display: "grid", gap: 8 },
  statIcon: { width: 42, height: 42, borderRadius: 15, display: "grid", placeItems: "center", fontSize: 18 },
  statValue: { fontSize: 28, lineHeight: 1, color: "#11243a" },
  statLabel: { fontSize: 13, color: "#516577", fontWeight: 700 },
  card: { background: "rgba(255,255,255,0.9)", border: "1px solid rgba(12,68,124,0.08)", borderRadius: 24, padding: 20, boxShadow: "0 18px 40px rgba(15,23,42,0.06)", marginBottom: 18 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 },
  cardTitle: { margin: 0, fontSize: 18, fontWeight: 800 },
  cardCopy: { margin: "5px 0 0", color: "#708092", fontSize: 13, lineHeight: 1.6 },
  reportBox: { borderRadius: 18, background: "#fbfdff", border: "1px solid rgba(12,68,124,0.08)", padding: 16 },
  reportSummary: { margin: 0, fontSize: 14, color: "#31475a", lineHeight: 1.7 },
  reportHighlights: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 },
  highlight: { padding: "7px 11px", borderRadius: 999, background: "#eef5fb", color: "#0c447c", fontSize: 12, fontWeight: 700 },
  recommendation: { marginTop: 14, padding: "12px 14px", borderRadius: 16, background: "#e5fbf7", color: "#0d9488", fontSize: 13 },
  emptyCompact: { padding: "18px 0 8px", color: "#708092", fontSize: 13 },
  tabs: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  tab: { display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 999, border: "1px solid rgba(12,68,124,0.08)", background: "#f8fbff", color: "#55697b", fontWeight: 700, cursor: "pointer" },
  tabActive: { background: "linear-gradient(135deg,#0c447c,#0d9488)", color: "#fff", boxShadow: "0 12px 24px rgba(12,68,124,0.18)" },
  tableWrap: { overflow: "auto", borderRadius: 18, border: "1px solid rgba(12,68,124,0.08)" },
  table: { width: "100%", minWidth: 760, borderCollapse: "collapse", background: "#fff" },
  th: { padding: "14px 16px", background: "#f7fbff", color: "#708092", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid rgba(12,68,124,0.08)" },
  td: { padding: "14px 16px", borderBottom: "1px solid rgba(12,68,124,0.06)", fontSize: 13, color: "#31475a", verticalAlign: "middle" },
  emptyCell: { padding: 46, color: "#708092", textAlign: "center" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 8 },
  openBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 12, border: "1px solid rgba(12,68,124,0.12)", background: "#fff", color: "#0c447c", fontWeight: 800, cursor: "pointer" },
  recoverBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0d9488,#16a34a)", color: "#fff", fontWeight: 800, cursor: "pointer" },
  metaPill: { padding: "6px 11px", borderRadius: 999, background: "#fff4e8", color: "#b45309", fontSize: 12, fontWeight: 800 },
};
