import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { FOLLOWUP_TYPES, getCommonOpdCases } from "../lib/clinicalOptions";

function appPath(path) {
  return window.location.pathname.startsWith("/doctor") ? `/doctor${path}` : path;
}

const GENDERS = ["Male", "Female", "Other"];

function localDateString() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export default function AddPatient({ clinicId, user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const commonCases = getCommonOpdCases(user?.designation);
  const [patient, setPatient] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "Male",
    condition: commonCases[0] || "",
    followup_type: FOLLOWUP_TYPES[0] || "General checkup",
    reminder_enabled: true,
    followup_enabled: true,
  });
  const [appointment, setAppointment] = useState({
    appointment_date: localDateString(),
    appointment_time: "10:00",
    notes: "",
  });

  function validateStep1() {
    const nextErrors = {};
    const digits = String(patient.phone || "").replace(/\D/g, "");
    if (!patient.name.trim()) nextErrors.name = "Patient name is required";
    if (!digits) nextErrors.phone = "Phone number is required";
    else if (!(digits.length === 10 || (digits.length === 12 && digits.startsWith("91")))) {
      nextErrors.phone = "Enter a valid mobile number";
    }
    if (!patient.age || Number.isNaN(Number(patient.age)) || Number(patient.age) < 1 || Number(patient.age) > 120) {
      nextErrors.age = "Enter a valid age";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function setPatientField(field, value) {
    setPatient((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: null }));
    }
  }

  function setAppointmentField(field, value) {
    setAppointment((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    if (!clinicId) return;

    setSaving(true);
    try {
      await API.post("/appointments", {
        clinic_id: clinicId,
        patient_name: patient.name,
        patient_phone: normalizePhone(patient.phone),
        service_type: patient.condition || patient.followup_type || "Consultation",
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time || "10:00",
        status: "booked",
        booked_via: "manual",
        notes: appointment.notes,
      });
      navigate(appPath("/appointments"), {
        state: {
          flash: `${patient.name} added to appointments. Open the patient from appointments when the consultation starts.`,
        },
      });
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => (step === 1 ? navigate(-1) : setStep(1))}>
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
          {step === 1 ? "Back" : "Previous"}
        </button>
        <div>
          <h1 style={styles.title}>Add new patient</h1>
          <p style={styles.sub}>Step {step} of 2 - {step === 1 ? "Patient details" : "Appointment details"} · {user?.designation || "Doctor workflow"}</p>
        </div>
      </div>

      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: step === 1 ? "50%" : "100%" }} />
      </div>

      <div style={styles.steps}>
        <StepBadge n={1} label="Patient details" active={step === 1} done={step > 1} />
        <div style={styles.stepLine} />
        <StepBadge n={2} label="Appointment details" active={step === 2} done={false} />
      </div>

      <div style={styles.card}>
        {step === 1 ? (
          <>
            <div style={styles.sectionTitle}>Patient information</div>

            <div style={styles.row2}>
              <Field label="Full name *" error={errors.name}>
                <Input value={patient.name} onChange={(value) => setPatientField("name", value)} placeholder="e.g. Ravi Kumar" autoFocus />
              </Field>
              <Field label="Mobile number *" error={errors.phone}>
                <Input value={patient.phone} onChange={(value) => setPatientField("phone", value)} placeholder="9876543210 or 919876543210" type="tel" />
              </Field>
            </div>

            <div style={styles.row2}>
              <Field label="Age *" error={errors.age}>
                <Input value={patient.age} onChange={(value) => setPatientField("age", value)} placeholder="42" type="number" min={1} max={120} />
              </Field>
              <Field label="Gender">
                <select style={styles.input} value={patient.gender} onChange={(event) => setPatientField("gender", event.target.value)}>
                  {GENDERS.map((gender) => <option key={gender}>{gender}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Condition / chief complaint">
              <select style={styles.input} value={patient.condition} onChange={(event) => setPatientField("condition", event.target.value)}>
                {commonCases.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>

            <Field label="Follow-up type">
              <select style={styles.input} value={patient.followup_type} onChange={(event) => setPatientField("followup_type", event.target.value)}>
                {FOLLOWUP_TYPES.map((type) => <option key={type}>{type}</option>)}
              </select>
            </Field>

            <div style={styles.preferenceRow}>
              <PreferenceToggle
                title="Needs follow-up"
                copy="Track this patient in future follow-up care."
                enabled={patient.followup_enabled}
                onToggle={(enabled) => setPatient((current) => ({
                  ...current,
                  followup_enabled: enabled,
                  reminder_enabled: enabled ? current.reminder_enabled : false,
                }))}
              />
              <PreferenceToggle
                title="Send reminders"
                copy="Allow DocNudge to send reminder messages for this patient."
                enabled={patient.reminder_enabled}
                disabled={!patient.followup_enabled}
                onToggle={(enabled) => setPatientField("reminder_enabled", enabled)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <button style={styles.btnPrimary} onClick={() => validateStep1() && setStep(2)}>
                Next - Appointment details <i className="ti ti-arrow-right" style={{ fontSize: 14 }} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={styles.sectionTitle}>Appointment details</div>

            <div style={styles.row2}>
              <Field label="Appointment date">
                <Input type="date" value={appointment.appointment_date} onChange={(value) => setAppointmentField("appointment_date", value)} />
              </Field>
              <Field label="Appointment time">
                <Input type="time" value={appointment.appointment_time} onChange={(value) => setAppointmentField("appointment_time", value)} />
              </Field>
            </div>

            <Field label="Notes / reason for appointment">
              <textarea
                style={{ ...styles.input, resize: "vertical", minHeight: 80 }}
                value={appointment.notes}
                onChange={(event) => setAppointmentField("notes", event.target.value)}
                placeholder="e.g. BP review, sugar levels high, routine follow-up"
              />
            </Field>

            {!clinicId && (
              <div style={styles.errorBanner}>
                Clinic is still loading for this account. Please wait a moment and try again.
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button style={styles.btnSecondary} onClick={() => setStep(1)}>
                <i className="ti ti-arrow-left" style={{ fontSize: 14 }} /> Back
              </button>
              <button style={styles.btnPrimary} onClick={save} disabled={saving || !clinicId}>
                {saving ? "Saving..." : "Add to appointments"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StepBadge({ n, label, active, done }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 600,
          background: done || active ? "#1D9E75" : "#eee",
          color: done || active ? "#fff" : "#aaa",
          flexShrink: 0,
        }}
      >
        {done ? <i className="ti ti-check" style={{ fontSize: 13 }} /> : n}
      </div>
      <span style={{ fontSize: 13, color: active ? "#1a1a18" : "#aaa", fontWeight: active ? 500 : 400 }}>
        {label}
      </span>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <div style={styles.errorMsg}>{error}</div>}
    </div>
  );
}

function Input({ value, onChange, ...props }) {
  return <input style={styles.input} value={value} onChange={(event) => onChange?.(event.target.value)} {...props} />;
}

function PreferenceToggle({ title, copy, enabled, disabled = false, onToggle }) {
  return (
    <button
      type="button"
      style={{
        ...styles.preferenceCard,
        opacity: disabled ? 0.55 : 1,
        borderColor: enabled ? "#0d9488" : "rgba(12,68,124,0.12)",
        background: enabled ? "#edfdfa" : "#fff",
      }}
      onClick={() => !disabled && onToggle?.(!enabled)}
    >
      <div>
        <strong style={styles.preferenceTitle}>{title}</strong>
        <div style={styles.preferenceCopy}>{copy}</div>
      </div>
      <div style={{ ...styles.toggle, background: enabled ? "#0d9488" : "#d7dee7" }}>
        <div style={{ ...styles.toggleKnob, transform: enabled ? "translateX(18px)" : "translateX(0)" }} />
      </div>
    </button>
  );
}

const styles = {
  page: { padding: "28px 32px", maxWidth: 680, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" },
  header: { display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 },
  backBtn: { display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 7, background: "transparent", cursor: "pointer", fontSize: 12, color: "#555", marginTop: 2, flexShrink: 0 },
  title: { fontSize: 22, fontWeight: 600, color: "#1a1a18", margin: 0 },
  sub: { fontSize: 13, color: "#888", marginTop: 3 },
  progressTrack: { height: 3, background: "#eee", borderRadius: 3, marginBottom: 20 },
  progressFill: { height: 3, background: "#1D9E75", borderRadius: 3, transition: "width 0.35s ease" },
  steps: { display: "flex", alignItems: "center", gap: 0, marginBottom: 24 },
  stepLine: { flex: 1, height: "0.5px", background: "rgba(0,0,0,0.1)", margin: "0 12px" },
  card: { background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: "24px 28px" },
  preferenceRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 6 },
  preferenceCard: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 15px", borderRadius: 12, border: "1px solid", background: "#fff", cursor: "pointer", textAlign: "left" },
  preferenceTitle: { display: "block", fontSize: 13, color: "#1a1a18", marginBottom: 4 },
  preferenceCopy: { fontSize: 12, color: "#6b7280", lineHeight: 1.5 },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: "#1a1a18", marginBottom: 20 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  label: { fontSize: 12, color: "#888", marginBottom: 6, display: "block" },
  input: { width: "100%", padding: "9px 11px", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 7, fontSize: 13, background: "#fff", color: "#1a1a18", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  errorMsg: { fontSize: 11, color: "#C0392B", marginTop: 4 },
  errorBanner: { background: "#fef2f2", border: "0.5px solid #fecaca", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#991b1b", marginTop: 10 },
  toggle: { width: 42, height: 24, borderRadius: 12, position: "relative", transition: "background 0.2s", flexShrink: 0 },
  toggleKnob: { position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "transform 0.2s" },
  btnPrimary: { display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", border: "none", borderRadius: 8, background: "#1D9E75", cursor: "pointer", fontSize: 13, color: "#fff", fontWeight: 500 },
  btnSecondary: { display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 13, color: "#555" },
};
