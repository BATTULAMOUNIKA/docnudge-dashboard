import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  completeAppointment,
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
} from "../api";

const FILTERS = [
  ["today", "Today"],
  ["active", "All open"],
  ["past", "Past due"],
  ["completed", "Completed"],
];

function routePrefix() {
  return window.location.pathname.startsWith("/doctor") ? "/doctor" : "";
}

function localDateString(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function dateLabel(value) {
  if (!value) return "No date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function timeLabel(value) {
  return value || "Queue";
}

export default function Appointments({ clinicId, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("today");
  const [message, setMessage] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [rescheduling, setRescheduling] = useState(null);
  const flashTimer = useRef(null);

  useEffect(() => {
    load();
  }, [clinicId]);

  useEffect(() => {
    if (!location.state?.flash) return;
    flash(location.state.flash);
    window.history.replaceState({}, document.title);
  }, [location.state]);

  async function load() {
    if (!clinicId) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getAppointments(clinicId);
      setAppointments(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function flash(text) {
    setMessage(text);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setMessage(""), 2600);
  }

  async function handleBook(payload) {
    const response = await createAppointment(payload);
    setAppointments((current) => [...current, response.data].sort((a, b) => `${a.appointment_date || ""}${a.appointment_time || ""}`.localeCompare(`${b.appointment_date || ""}${b.appointment_time || ""}`)));
    setBookingOpen(false);
    flash("Appointment booked.");
  }

  async function markDone(appointment) {
    const response = await completeAppointment(appointment.id, {
      condition: appointment.service_type || "Consultation",
      notes: appointment.notes || "",
    });
    setAppointments((current) => current.map((item) => (item.id === appointment.id ? response.data.appointment : item)));
    flash(`${response.data?.patient?.name || appointment.patient_name} moved into records.`);
  }

  async function openPatient(appointment) {
    const response = await completeAppointment(appointment.id, {
      condition: appointment.service_type || "Consultation",
      notes: appointment.notes || "",
    });
    setAppointments((current) => current.map((item) => (item.id === appointment.id ? response.data.appointment : item)));
    const patientId = response.data?.patient?.id;
    if (patientId) {
      navigate(`${routePrefix()}/patients/${patientId}`);
      return;
    }
    flash(`${appointment.patient_name} moved into records.`);
  }

  async function removeAppointment(appointment) {
    if (!window.confirm(`Delete appointment for ${appointment.patient_name}?`)) return;
    await deleteAppointment(appointment.id);
    setAppointments((current) => current.filter((item) => item.id !== appointment.id));
    flash("Appointment deleted.");
  }

  async function saveReschedule(payload) {
    await updateAppointment(payload.id, {
      appointment_date: payload.appointment_date,
      appointment_time: payload.appointment_time,
      status: "booked",
      service_type: payload.service_type,
      notes: payload.notes,
    });
    setRescheduling(null);
    await load();
    flash("Appointment updated.");
  }

  const today = localDateString();
  const doctorName = user?.doctor_name || "Doctor";

  const counts = useMemo(() => ({
    today: appointments.filter((item) => item.appointment_date?.slice(0, 10) === today && item.status !== "completed").length,
    active: appointments.filter((item) => !["completed", "cancelled"].includes(item.status)).length,
    past: appointments.filter((item) => item.appointment_date?.slice(0, 10) < today && item.status !== "completed").length,
    completed: appointments.filter((item) => item.status === "completed").length,
  }), [appointments, today]);

  const visible = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const status = appointment.status || "booked";
        const appointmentDate = appointment.appointment_date?.slice(0, 10);
        if (filter === "today") return appointmentDate === today && status !== "completed";
        if (filter === "past") return appointmentDate < today && status !== "completed";
        if (filter === "completed") return status === "completed";
        return !["completed", "cancelled"].includes(status);
      })
      .sort((a, b) => `${a.appointment_date || ""} ${a.appointment_time || ""}`.localeCompare(`${b.appointment_date || ""} ${b.appointment_time || ""}`));
  }, [appointments, filter, today]);

  return (
    <div style={styles.page}>
      {bookingOpen && (
        <BookingModal
          clinicId={clinicId}
          onClose={() => setBookingOpen(false)}
          onSave={handleBook}
        />
      )}
      {rescheduling && (
        <RescheduleModal
          appointment={rescheduling}
          onClose={() => setRescheduling(null)}
          onSave={saveReschedule}
        />
      )}

      <section style={styles.hero}>
        <div>
          <div style={styles.eyebrow}>Appointment desk</div>
          <h1 style={styles.heroTitle}>Today's doctor flow for Dr. {doctorName}</h1>
          <p style={styles.heroCopy}>Add walk-ins here, keep today’s queue visible, and close appointments straight into patient records.</p>
        </div>
        <div style={styles.heroActions}>
          <button style={styles.primaryBtn} onClick={() => navigate(`${routePrefix()}/patients/add`)}>
            <i className="ti ti-user-plus" /> Add patient
          </button>
          <button style={styles.secondaryBtn} onClick={() => setBookingOpen(true)}>
            <i className="ti ti-calendar-plus" /> Book appointment
          </button>
        </div>
      </section>

      <section style={styles.statGrid}>
        <MetricCard label="Today's appointments" value={counts.today} icon="ti-calendar-event" tone="blue" />
        <MetricCard label="Open queue" value={counts.active} icon="ti-users" tone="teal" />
        <MetricCard label="Past due" value={counts.past} icon="ti-alert-circle" tone="amber" />
        <MetricCard label="Completed" value={counts.completed} icon="ti-circle-check" tone="green" />
      </section>

      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Appointment views</h2>
          <p style={styles.cardCopy}>The page opens in Today view by default so the doctor sees only what matters first.</p>
          </div>
          <div style={styles.toolbar}>
            {message && <span style={styles.toast}>{message}</span>}
            <button style={styles.refreshBtn} onClick={load}><i className="ti ti-refresh" /> Refresh</button>
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
                <Th>Token</Th>
                <Th>Patient</Th>
                <Th>Visit type</Th>
                <Th>Date</Th>
                <Th>Time</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td style={styles.emptyCell} colSpan="7">Loading appointments...</td></tr>
              ) : visible.length === 0 ? (
                <tr><td style={styles.emptyCell} colSpan="7">No appointments in this view.</td></tr>
              ) : (
                visible.map((appointment, index) => (
                  <AppointmentRow
                    key={appointment.id}
                    appointment={appointment}
                    index={index}
                    onOpen={() => openPatient(appointment)}
                    onDone={() => markDone(appointment)}
                    onReschedule={() => setRescheduling(appointment)}
                    onDelete={() => removeAppointment(appointment)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AppointmentRow({ appointment, index, onOpen, onDone, onReschedule, onDelete }) {
  const isCompleted = appointment.status === "completed";
  return (
    <tr>
      <td style={styles.td}><span style={styles.token}>Q-{String(index + 1).padStart(2, "0")}</span></td>
      <td style={styles.td}>
        <div style={styles.patientCell}>
          <strong>{appointment.patient_name || "Patient"}</strong>
          <span>{appointment.notes || "No notes added"}</span>
        </div>
      </td>
      <td style={styles.td}>{appointment.service_type || "Consultation"}</td>
      <td style={styles.td}>{dateLabel(appointment.appointment_date?.slice(0, 10))}</td>
      <td style={styles.td}>{timeLabel(appointment.appointment_time)}</td>
      <td style={styles.td}><StatusPill status={appointment.status || "booked"} /></td>
      <td style={{ ...styles.td, textAlign: "right" }}>
        <div style={styles.actions}>
          {!isCompleted && <button style={styles.openBtn} onClick={onOpen}><i className="ti ti-folder-open" /> Open patient</button>}
          {!isCompleted && <button style={styles.doneBtn} onClick={onDone}><i className="ti ti-check" /> Done</button>}
          <button style={styles.iconBtn} onClick={onReschedule}><i className="ti ti-calendar-plus" /></button>
          <button style={{ ...styles.iconBtn, ...styles.dangerBtn }} onClick={onDelete}><i className="ti ti-trash" /></button>
        </div>
      </td>
    </tr>
  );
}

function BookingModal({ clinicId, onClose, onSave }) {
  const [form, setForm] = useState({
    clinic_id: clinicId,
    patient_name: "",
    patient_phone: "",
    service_type: "Consultation",
    appointment_date: localDateString(),
    appointment_time: "10:00",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!form.patient_name.trim() || !form.patient_phone.trim()) {
      setError("Patient name and phone are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not book appointment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <h3 style={styles.modalTitle}>Book appointment</h3>
            <p style={styles.modalCopy}>Add a new appointment without leaving the doctor schedule.</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div style={styles.formGrid}>
          <Field label="Patient name">
            <input style={styles.input} value={form.patient_name} onChange={(event) => setForm((current) => ({ ...current, patient_name: event.target.value }))} />
          </Field>
          <Field label="Phone number">
            <input style={styles.input} value={form.patient_phone} onChange={(event) => setForm((current) => ({ ...current, patient_phone: event.target.value }))} />
          </Field>
          <Field label="Visit type">
            <input style={styles.input} value={form.service_type} onChange={(event) => setForm((current) => ({ ...current, service_type: event.target.value }))} />
          </Field>
          <Field label="Time">
            <input style={styles.input} value={form.appointment_time} onChange={(event) => setForm((current) => ({ ...current, appointment_time: event.target.value }))} />
          </Field>
          <Field label="Date">
            <input style={styles.input} type="date" value={form.appointment_date} onChange={(event) => setForm((current) => ({ ...current, appointment_date: event.target.value }))} />
          </Field>
          <Field label="Notes">
            <input style={styles.input} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </Field>
        </div>
        {error && <div style={styles.errorBox}>{error}</div>}
        <div style={styles.modalFooter}>
          <button style={styles.modalGhost} onClick={onClose}>Cancel</button>
          <button style={styles.modalPrimary} disabled={saving} onClick={submit}>{saving ? "Saving..." : "Book appointment"}</button>
        </div>
      </div>
    </div>
  );
}

function RescheduleModal({ appointment, onClose, onSave }) {
  const [form, setForm] = useState({
    id: appointment.id,
    appointment_date: appointment.appointment_date?.slice(0, 10) || localDateString(),
    appointment_time: appointment.appointment_time || "10:00",
    service_type: appointment.service_type || "Consultation",
    notes: appointment.notes || "",
  });
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <h3 style={styles.modalTitle}>Update appointment</h3>
            <p style={styles.modalCopy}>{appointment.patient_name}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div style={styles.formGrid}>
          <Field label="Date">
            <input style={styles.input} type="date" value={form.appointment_date} onChange={(event) => setForm((current) => ({ ...current, appointment_date: event.target.value }))} />
          </Field>
          <Field label="Time">
            <input style={styles.input} value={form.appointment_time} onChange={(event) => setForm((current) => ({ ...current, appointment_time: event.target.value }))} />
          </Field>
          <Field label="Visit type">
            <input style={styles.input} value={form.service_type} onChange={(event) => setForm((current) => ({ ...current, service_type: event.target.value }))} />
          </Field>
          <Field label="Notes">
            <input style={styles.input} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </Field>
        </div>
        <div style={styles.modalFooter}>
          <button style={styles.modalGhost} onClick={onClose}>Cancel</button>
          <button style={styles.modalPrimary} disabled={saving} onClick={submit}>{saving ? "Saving..." : "Save changes"}</button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, tone }) {
  const palette = {
    blue: ["#eaf3ff", "#0c447c"],
    teal: ["#e5fbf7", "#0d9488"],
    amber: ["#fff4e8", "#b45309"],
    green: ["#eef9eb", "#2f7a32"],
  }[tone];
  return (
    <article style={styles.metricCard}>
      <div style={{ ...styles.metricIcon, background: palette[0], color: palette[1] }}>
        <i className={`ti ${icon}`} />
      </div>
      <strong style={styles.metricValue}>{value}</strong>
      <span style={styles.metricLabel}>{label}</span>
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

function Th({ children, align = "left" }) {
  return <th style={{ ...styles.th, textAlign: align }}>{children}</th>;
}

function Field({ label, children }) {
  return <label style={styles.field}><span>{label}</span>{children}</label>;
}

const styles = {
  page: { padding: "28px 30px 38px", minHeight: "100vh", background: "radial-gradient(circle at top left,#eff8ff 0%,#f7fbff 35%,#f8f6f0 100%)", fontFamily: "'DM Sans', sans-serif", color: "#11243a" },
  hero: { display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center", padding: "22px 24px", borderRadius: 28, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(12,68,124,0.08)", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", marginBottom: 18 },
  eyebrow: { fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#0d9488", fontWeight: 700, marginBottom: 8 },
  heroTitle: { margin: 0, fontSize: 28, lineHeight: 1.08, fontWeight: 800 },
  heroCopy: { margin: "8px 0 0", fontSize: 14, color: "#708092", maxWidth: 720, lineHeight: 1.6 },
  heroActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  primaryBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#0c447c,#0d9488)", color: "#fff", fontWeight: 800, cursor: "pointer", boxShadow: "0 18px 30px rgba(12,68,124,0.22)" },
  secondaryBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 14, border: "1px solid rgba(12,68,124,0.12)", background: "#fff", color: "#0c447c", fontWeight: 700, cursor: "pointer" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14, marginBottom: 18 },
  metricCard: { borderRadius: 22, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(12,68,124,0.08)", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", padding: 18, display: "grid", gap: 8 },
  metricIcon: { width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", fontSize: 19 },
  metricValue: { fontSize: 28, lineHeight: 1, color: "#11243a" },
  metricLabel: { fontSize: 13, color: "#516577", fontWeight: 700 },
  card: { background: "rgba(255,255,255,0.9)", border: "1px solid rgba(12,68,124,0.08)", borderRadius: 24, padding: 20, boxShadow: "0 18px 40px rgba(15,23,42,0.06)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 },
  cardTitle: { margin: 0, fontSize: 18, fontWeight: 800 },
  cardCopy: { margin: "5px 0 0", color: "#708092", fontSize: 13, lineHeight: 1.6 },
  toolbar: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  toast: { padding: "8px 12px", borderRadius: 999, background: "#0c447c", color: "#fff", fontSize: 12, fontWeight: 700 },
  refreshBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(12,68,124,0.12)", background: "#fff", color: "#0c447c", fontWeight: 700, cursor: "pointer" },
  tabs: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  tab: { display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 999, border: "1px solid rgba(12,68,124,0.08)", background: "#f8fbff", color: "#55697b", fontWeight: 700, cursor: "pointer" },
  tabActive: { background: "linear-gradient(135deg,#0c447c,#0d9488)", color: "#fff", boxShadow: "0 12px 24px rgba(12,68,124,0.18)" },
  tableWrap: { overflow: "auto", borderRadius: 18, border: "1px solid rgba(12,68,124,0.08)" },
  table: { width: "100%", minWidth: 820, borderCollapse: "collapse", background: "#fff" },
  th: { padding: "14px 16px", background: "#f7fbff", color: "#708092", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid rgba(12,68,124,0.08)" },
  td: { padding: "14px 16px", borderBottom: "1px solid rgba(12,68,124,0.06)", fontSize: 13, color: "#31475a", verticalAlign: "middle" },
  emptyCell: { padding: 46, color: "#708092", textAlign: "center" },
  token: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 56, padding: "6px 10px", borderRadius: 12, background: "#eef5fb", color: "#0c447c", fontWeight: 800 },
  patientCell: { display: "flex", flexDirection: "column", gap: 4 },
  statusPill: { padding: "6px 11px", borderRadius: 999, textTransform: "capitalize", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 8 },
  openBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 12, border: "1px solid rgba(12,68,124,0.12)", background: "#fff", color: "#0c447c", fontWeight: 800, cursor: "pointer" },
  doneBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0d9488,#16a34a)", color: "#fff", fontWeight: 800, cursor: "pointer" },
  iconBtn: { width: 34, height: 34, borderRadius: 12, border: "1px solid rgba(12,68,124,0.1)", background: "#fff", color: "#55697b", display: "grid", placeItems: "center", cursor: "pointer" },
  dangerBtn: { background: "#fff3f2", color: "#b83b2e", borderColor: "rgba(184,59,46,0.16)" },
  overlay: { position: "fixed", inset: 0, background: "rgba(10,25,47,0.34)", display: "grid", placeItems: "center", padding: 20, zIndex: 1000 },
  modal: { width: "min(640px,100%)", borderRadius: 24, background: "#fff", border: "1px solid rgba(12,68,124,0.08)", boxShadow: "0 28px 60px rgba(15,23,42,0.16)", padding: 22 },
  modalHeader: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 18 },
  modalTitle: { margin: 0, fontSize: 20, fontWeight: 800, color: "#11243a" },
  modalCopy: { margin: "5px 0 0", fontSize: 13, color: "#708092" },
  closeBtn: { border: "none", background: "#f6f8fb", color: "#708092", width: 34, height: 34, borderRadius: 12, cursor: "pointer" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 },
  field: { display: "grid", gap: 7, color: "#526677", fontSize: 12, fontWeight: 800, textTransform: "uppercase" },
  input: { width: "100%", padding: "11px 12px", borderRadius: 14, border: "1px solid rgba(12,68,124,0.12)", background: "#fbfdff", color: "#11243a", outline: "none", fontFamily: "inherit" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 },
  modalGhost: { padding: "10px 15px", borderRadius: 12, border: "1px solid rgba(12,68,124,0.12)", background: "#fff", color: "#526677", fontWeight: 700, cursor: "pointer" },
  modalPrimary: { padding: "10px 15px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0c447c,#0d9488)", color: "#fff", fontWeight: 800, cursor: "pointer" },
  errorBox: { marginTop: 14, padding: "10px 12px", borderRadius: 12, background: "#fff3f2", color: "#b83b2e", fontSize: 13, border: "1px solid rgba(184,59,46,0.12)" },
};
