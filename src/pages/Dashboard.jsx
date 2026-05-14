import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppointments, getClinics, getPatients, getReminderLogs } from "../api";

function routePrefix() {
  return window.location.pathname.startsWith("/doctor") ? "/doctor" : "";
}

function todayIso() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function todayLabel() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

export default function Dashboard({ clinicId: initialClinicId, user }) {
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [initialClinicId]);

  async function load() {
    setLoading(true);
    try {
      const clinicsResponse = await getClinics();
      const activeClinic = clinicsResponse.data.find((item) => String(item.id) === String(initialClinicId)) || clinicsResponse.data[0];
      if (!activeClinic) {
        setClinic(null);
        setPatients([]);
        setAppointments([]);
        setLogs([]);
        return;
      }
      setClinic(activeClinic);
      const today = todayIso();
      const [patientsResponse, appointmentResponse, logResponse] = await Promise.all([
        getPatients(activeClinic.id),
        getAppointments(activeClinic.id, today, today).catch(() => ({ data: [] })),
        getReminderLogs(activeClinic.id).catch(() => ({ data: [] })),
      ]);
      setPatients(patientsResponse.data || []);
      setAppointments(appointmentResponse.data || []);
      setLogs(logResponse.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const doctorName = user?.doctor_name || clinic?.doctor_name || "Doctor";
  const designation = user?.designation || clinic?.designation || "General Physician";

  const reminderDisabled = patients.filter((patient) => patient.reminder_enabled === false).length;
  const followupEnabled = patients.filter((patient) => patient.followup_enabled !== false).length;
  const failedReminders = logs
    .map((row) => (Array.isArray(row) ? row : [row, null]))
    .filter(([log]) => !log?.success);
  const failedPatients = failedReminders.slice(0, 4);
  const upcomingPatients = patients
    .filter((patient) => patient.followup_enabled !== false)
    .slice(0, 4);

  const stats = useMemo(
    () => [
      { label: "Total patients", value: patients.length, hint: "Registered records", icon: "ti-users", tone: "blue" },
      { label: "Today's appointments", value: appointments.length, hint: "Live doctor day", icon: "ti-calendar-event", tone: "teal" },
      { label: "Follow-up enabled", value: followupEnabled, hint: "Care plans running", icon: "ti-heart-rate-monitor", tone: "green" },
      { label: "Needs recovery", value: failedReminders.length, hint: "Failed reminders", icon: "ti-alert-triangle", tone: "amber" },
    ],
    [appointments.length, failedReminders.length, followupEnabled, patients.length]
  );

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div>
          <div style={styles.eyebrow}>Doctor workspace</div>
          <h1 style={styles.heroTitle}>Good day, Dr. {doctorName}</h1>
          <p style={styles.heroCopy}>
            {clinic?.name || "DocNudge Clinic"} · {designation} · {todayLabel()}
          </p>
        </div>
        <div style={styles.heroActions}>
          <button style={styles.primaryBtn} onClick={() => navigate(`${routePrefix()}/appointments`)}>
            <i className="ti ti-calendar-event" /> Open appointments
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate(`${routePrefix()}/settings?tab=profile`)}>
            <i className="ti ti-user-circle" /> My profile
          </button>
        </div>
      </section>

      <section style={styles.statGrid}>
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} loading={loading} />
        ))}
      </section>

      <section style={styles.grid}>
        <article style={{ ...styles.card, gridColumn: "span 2" }}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Today's appointments</h2>
              <p style={styles.cardCopy}>Only today’s doctor schedule is shown here for a cleaner start-of-day view.</p>
            </div>
            <button style={styles.linkBtn} onClick={() => navigate(`${routePrefix()}/appointments`)}>
              Full appointment desk
            </button>
          </div>
          {loading ? (
            <div style={styles.emptyState}>Loading today’s appointments...</div>
          ) : appointments.length === 0 ? (
            <EmptyCard
              icon="ti-calendar-off"
              title="No appointments booked for today"
              copy="Use the appointments desk to add a walk-in patient or create a booking."
              actionLabel="Open appointments"
              onAction={() => navigate(`${routePrefix()}/appointments`)}
            />
          ) : (
            <div style={styles.appointmentList}>
              {appointments.map((appointment, index) => (
                <button key={appointment.id} style={styles.appointmentRow} onClick={() => navigate(`${routePrefix()}/appointments`)}>
                  <div style={styles.appointmentToken}>#{String(index + 1).padStart(2, "0")}</div>
                  <div style={styles.appointmentBody}>
                    <strong>{appointment.patient_name}</strong>
                    <span>{appointment.service_type || "Consultation"} · {appointment.appointment_time || "Queue"}</span>
                  </div>
                  <StatusPill status={appointment.status || "booked"} />
                </button>
              ))}
            </div>
          )}
        </article>

        <article style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Recovery watchlist</h2>
              <p style={styles.cardCopy}>Patients whose reminders failed and may need manual attention.</p>
            </div>
            <button style={styles.linkBtn} onClick={() => navigate(`${routePrefix()}/recovery`)}>
              Open recovery
            </button>
          </div>
          {failedPatients.length === 0 ? (
            <div style={styles.emptyCompact}>No failed reminders right now.</div>
          ) : (
            <div style={styles.stack}>
              {failedPatients.map(([log, patient]) => (
                <div key={log?.id} style={styles.personRow}>
                  <div style={styles.avatar}>{initials(patient?.name)}</div>
                  <div style={styles.personBody}>
                    <strong>{patient?.name || "Patient"}</strong>
                    <span>{log?.reminder_type?.replaceAll("_", " ") || "Reminder"} failed</span>
                  </div>
                  <span style={styles.alertBadge}>Needs call</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Care preferences</h2>
              <p style={styles.cardCopy}>Reminder controls and follow-up readiness for your clinic.</p>
            </div>
          </div>
          <div style={styles.preferenceGrid}>
            <PreferenceTile label="Reminders active" value={patients.length - reminderDisabled} tone="teal" />
            <PreferenceTile label="Reminders paused" value={reminderDisabled} tone="amber" />
          </div>
          <div style={styles.preferenceNote}>
            Patients with reminders paused or follow-up disabled stay out of the automated reminder flow.
          </div>
        </article>

        <article style={{ ...styles.card, gridColumn: "span 2" }}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Care timeline</h2>
              <p style={styles.cardCopy}>A quick doctor-side view of patients still in active follow-up.</p>
            </div>
          </div>
          {upcomingPatients.length === 0 ? (
            <div style={styles.emptyCompact}>No active follow-up patients yet.</div>
          ) : (
            <div style={styles.timeline}>
              {upcomingPatients.map((patient) => (
                <div key={patient.id} style={styles.timelineRow}>
                  <div style={styles.timelineDot} />
                  <div style={styles.timelineCard}>
                    <strong>{patient.name}</strong>
                    <span>{patient.followup_type || patient.condition || "Follow-up care"} · {patient.mrn || `DN${patient.id}`}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Doctor profile</h2>
              <p style={styles.cardCopy}>Keep your name, clinic identity, and specialty accurate everywhere.</p>
            </div>
          </div>
          <div style={styles.profileBlock}>
            <div style={styles.profileTop}>
              <div style={styles.profileAvatar}>{initials(doctorName)}</div>
              <div>
                <strong style={styles.profileName}>Dr. {doctorName}</strong>
                <div style={styles.profileSub}>{clinic?.name || "Clinic"} · {designation}</div>
              </div>
            </div>
            <button style={styles.secondaryBtn} onClick={() => navigate(`${routePrefix()}/settings?tab=profile`)}>
              <i className="ti ti-settings" /> Edit profile and password
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}

function StatCard({ stat, loading }) {
  const palette = {
    blue: ["#eaf3ff", "#0c447c"],
    teal: ["#e5fbf7", "#0d9488"],
    green: ["#eef9eb", "#2f7a32"],
    amber: ["#fff4e8", "#b45309"],
  }[stat.tone];

  return (
    <article style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: palette[0], color: palette[1] }}>
        <i className={`ti ${stat.icon}`} />
      </div>
      <div>
        <strong style={styles.statValue}>{loading ? "..." : stat.value}</strong>
        <div style={styles.statLabel}>{stat.label}</div>
        <div style={styles.statHint}>{stat.hint}</div>
      </div>
    </article>
  );
}

function StatusPill({ status }) {
  const normalized = String(status || "booked").toLowerCase();
  const palette = normalized === "completed"
    ? ["#eef4ff", "#3659a2"]
    : normalized === "cancelled"
      ? ["#fff0ef", "#b83b2e"]
      : ["#e5fbf7", "#0d9488"];
  return <span style={{ ...styles.statusPill, background: palette[0], color: palette[1] }}>{normalized}</span>;
}

function PreferenceTile({ label, value, tone }) {
  const palette = {
    teal: ["#e5fbf7", "#0d9488"],
    amber: ["#fff4e8", "#b45309"],
  }[tone];
  return (
    <div style={{ ...styles.preferenceTile, background: palette[0] }}>
      <strong style={{ color: palette[1] }}>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function EmptyCard({ icon, title, copy, actionLabel, onAction }) {
  return (
    <div style={styles.emptyRich}>
      <div style={styles.emptyIcon}><i className={`ti ${icon}`} /></div>
      <strong>{title}</strong>
      <span>{copy}</span>
      {actionLabel && <button style={styles.primaryBtn} onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}

const styles = {
  page: { padding: "28px 30px 38px", minHeight: "100vh", background: "radial-gradient(circle at top left,#eff8ff 0%,#f7fbff 35%,#f8f6f0 100%)", fontFamily: "'DM Sans', sans-serif", color: "#11243a" },
  hero: { display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center", padding: "24px 26px", borderRadius: 28, background: "linear-gradient(135deg,rgba(12,68,124,0.97),rgba(13,148,136,0.92))", color: "#fff", boxShadow: "0 26px 60px rgba(12,68,124,0.24)", marginBottom: 18 },
  eyebrow: { fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.72, fontWeight: 700, marginBottom: 8 },
  heroTitle: { margin: 0, fontSize: 30, lineHeight: 1.08, fontWeight: 800 },
  heroCopy: { margin: "8px 0 0", fontSize: 14, opacity: 0.86 },
  heroActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  primaryBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 14, border: "none", background: "#fff", color: "#0c447c", fontWeight: 800, cursor: "pointer", boxShadow: "0 12px 24px rgba(15,23,42,0.12)" },
  secondaryBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.12)", color: "#fff", fontWeight: 700, cursor: "pointer" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14, marginBottom: 18 },
  statCard: { display: "flex", alignItems: "center", gap: 14, padding: 18, borderRadius: 22, background: "rgba(255,255,255,0.86)", border: "1px solid rgba(12,68,124,0.08)", backdropFilter: "blur(10px)", boxShadow: "0 18px 40px rgba(15,23,42,0.06)" },
  statIcon: { width: 48, height: 48, borderRadius: 16, display: "grid", placeItems: "center", fontSize: 20, flexShrink: 0 },
  statValue: { display: "block", fontSize: 28, lineHeight: 1, fontWeight: 800, color: "#11243a", marginBottom: 6 },
  statLabel: { fontSize: 13, fontWeight: 700, color: "#3a5068" },
  statHint: { fontSize: 12, color: "#708092", marginTop: 3 },
  grid: { display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,0.8fr) minmax(280px,0.7fr)", gap: 16 },
  card: { background: "rgba(255,255,255,0.9)", border: "1px solid rgba(12,68,124,0.08)", borderRadius: 24, padding: 20, boxShadow: "0 18px 40px rgba(15,23,42,0.06)", backdropFilter: "blur(10px)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  cardTitle: { margin: 0, fontSize: 18, fontWeight: 800, color: "#11243a" },
  cardCopy: { margin: "5px 0 0", fontSize: 13, color: "#708092", lineHeight: 1.6 },
  linkBtn: { border: "none", background: "transparent", color: "#0d9488", fontWeight: 700, cursor: "pointer" },
  appointmentList: { display: "flex", flexDirection: "column", gap: 10 },
  appointmentRow: { width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 18, border: "1px solid rgba(12,68,124,0.08)", background: "#fbfdff", cursor: "pointer", textAlign: "left" },
  appointmentToken: { minWidth: 48, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#0c447c,#0d9488)", color: "#fff", fontWeight: 800, fontSize: 13 },
  appointmentBody: { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 },
  statusPill: { padding: "6px 11px", borderRadius: 999, textTransform: "capitalize", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" },
  emptyState: { padding: "42px 0", textAlign: "center", color: "#708092" },
  emptyCompact: { padding: "18px 0 8px", color: "#708092", fontSize: 13 },
  emptyRich: { minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 10, color: "#708092" },
  emptyIcon: { width: 56, height: 56, borderRadius: 18, display: "grid", placeItems: "center", background: "#eef5fb", color: "#0c447c", fontSize: 24 },
  stack: { display: "flex", flexDirection: "column", gap: 10 },
  personRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: "1px solid rgba(12,68,124,0.06)" },
  avatar: { width: 40, height: 40, borderRadius: 14, background: "linear-gradient(135deg,#0c447c,#0d9488)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, flexShrink: 0 },
  personBody: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 },
  alertBadge: { padding: "6px 10px", borderRadius: 999, background: "#fff4e8", color: "#b45309", fontWeight: 800, fontSize: 11, whiteSpace: "nowrap" },
  preferenceGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 },
  preferenceTile: { borderRadius: 18, padding: 16, display: "grid", gap: 6 },
  preferenceNote: { fontSize: 12, color: "#708092", lineHeight: 1.7 },
  timeline: { display: "flex", flexDirection: "column", gap: 12 },
  timelineRow: { display: "grid", gridTemplateColumns: "18px minmax(0,1fr)", alignItems: "center", gap: 12 },
  timelineDot: { width: 12, height: 12, borderRadius: "50%", background: "#0d9488", boxShadow: "0 0 0 6px rgba(13,148,136,0.12)" },
  timelineCard: { display: "flex", flexDirection: "column", gap: 4, padding: "14px 16px", borderRadius: 18, background: "#fbfdff", border: "1px solid rgba(12,68,124,0.08)" },
  profileBlock: { display: "grid", gap: 14 },
  profileTop: { display: "flex", alignItems: "center", gap: 12 },
  profileAvatar: { width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg,#0c447c,#0d9488)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 17 },
  profileName: { display: "block", fontSize: 16, color: "#11243a" },
  profileSub: { marginTop: 4, fontSize: 13, color: "#708092" },
};
