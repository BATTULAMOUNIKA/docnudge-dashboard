import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addPrescription,
  addVisit,
  getPatient,
  getPrescriptions,
  getVisits,
} from "../api";
import ProductionOPSheet from "../components/ProductionOPSheet";

function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

function formatDateLabel(value) {
  if (!value) return "Recent visit";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildVisitPayload(patientId, data) {
  const complaints = Array.isArray(data.complaints) ? data.complaints : [];
  const diagnoses = Array.isArray(data.diagnoses) ? data.diagnoses : [];
  const investigations = Array.isArray(data.investigations) ? data.investigations : [];
  const procedures = Array.isArray(data.procedures) ? data.procedures : [];
  const complaintNote = data.complaintNote || data.compNote || "";
  const historyNote = data.historyNote || "";

  const notes = [
    complaints.length ? `Chief complaints: ${complaints.join(", ")}` : "",
    complaintNote ? `Complaint notes: ${complaintNote}` : "",
    historyNote ? `History: ${historyNote}` : "",
    diagnoses.length ? `Assessment: ${diagnoses.join(", ")}` : "",
    data.diagNote ? `Diagnosis notes: ${data.diagNote}` : "",
  ].filter(Boolean).join("\n");

  const doctorNotes = [
    data.examNote ? `Examination: ${data.examNote}` : "",
    investigations.length ? `Investigations: ${investigations.join(", ")}` : "",
    procedures.length ? `Procedures: ${procedures.join(", ")}` : "",
    data.followUpNote ? `Follow-up note: ${data.followUpNote}` : "",
    data.followUpReminder ? `Reminder preference: ${data.followUpReminder}` : "",
  ].filter(Boolean).join("\n");

  return {
    patient_id: Number(patientId),
    visit_date: todayIsoDate(),
    next_visit: data.followUpDate || null,
    condition: diagnoses[0] || complaints[0] || "General consultation",
    notes,
    doctor_notes: doctorNotes || null,
    status: "completed",
  };
}

function buildPrescriptionPayload(patientId, data) {
  const medicines = (Array.isArray(data.rx) ? data.rx : [])
    .map((row) => ({
      name: String(row?.[0] || "").trim(),
      dosage: String(row?.[1] || "").trim(),
      frequency: String(row?.[2] || "").trim(),
      duration: String(row?.[4] || row?.[3] || "").trim(),
      notes: [String(row?.[3] || "").trim(), String(row?.[5] || "").trim()].filter(Boolean).join(" | "),
    }))
    .filter((row) => row.name);

  if (!medicines.length) {
    throw new Error("Add at least one medicine before saving.");
  }

  const advice = Array.isArray(data.advice) ? data.advice : [];
  const adviceNote = data.adviceNote || data.advNote || "";
  const diagnoses = Array.isArray(data.diagnoses) ? data.diagnoses : [];

  const notes = [
    diagnoses.length ? `Diagnosis: ${diagnoses.join(", ")}` : "",
    data.diagNote ? data.diagNote : "",
    advice.length ? `Advice: ${advice.join(", ")}` : "",
    adviceNote ? adviceNote : "",
    data.followUpDate ? `Follow-up: ${data.followUpDate}` : "",
    data.followUpNote ? `Follow-up note: ${data.followUpNote}` : "",
  ].filter(Boolean).join("\n");

  return {
    patient_id: Number(patientId),
    medicines,
    notes,
  };
}

function buildPatientSheetModel(patient, visits, prescriptions) {
  return {
    ...patient,
    conditions: patient?.conditions?.length
      ? patient.conditions
      : [patient?.condition].filter(Boolean),
    visits: prescriptions.map((prescription) => ({
      date: formatDateLabel(prescription.created_at || prescription.date),
      diagnosis: patient?.condition || prescription?.notes || "Prescription",
      rx_summary: (prescription.medicines || [])
        .map((medicine) => medicine?.name)
        .filter(Boolean)
        .slice(0, 3)
        .join(", ") || "Tap to load last Rx",
      rx: (prescription.medicines || []).map((medicine) => [
        medicine?.name || "",
        medicine?.dosage || "",
        medicine?.frequency || "",
        medicine?.duration || "",
      ]),
    })),
    last_visit_at: visits?.[0]?.visit_date || patient?.last_visit_at || null,
  };
}

export default function OPSheet({ user }) {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [patientData, visitData, prescriptionData] = await Promise.all([
        getPatient(patientId),
        getVisits(patientId),
        getPrescriptions(patientId),
      ]);
      setPatient(patientData);
      setVisits(Array.isArray(visitData) ? visitData : []);
      setPrescriptions(Array.isArray(prescriptionData) ? prescriptionData : []);
    } catch (nextError) {
      console.error(nextError);
      setError(nextError?.response?.data?.detail || "Could not load the OP sheet.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleSaveVisit(data) {
    await addVisit(buildVisitPayload(patientId, data));
  }

  async function handleSaveAndSendPrescription(data) {
    await addPrescription(buildPrescriptionPayload(patientId, data));
    await loadAll();
  }

  if (loading) {
    return <div style={styles.state}>Loading OP sheet...</div>;
  }

  if (error) {
    return <div style={styles.state}>{error}</div>;
  }

  if (!patient) {
    return <div style={styles.state}>Patient not found.</div>;
  }

  return (
    <ProductionOPSheet
      patient={buildPatientSheetModel(patient, visits, prescriptions)}
      doctor={{
        name: user?.doctor_name || user?.name || "Doctor",
        specialty: user?.speciality || user?.designation || "",
      }}
      visitNo={visits.length + 1}
      onSave={handleSaveVisit}
      onSendWhatsApp={handleSaveAndSendPrescription}
    />
  );
}

const styles = {
  state: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "#f8f7f4",
    color: "#475569",
    fontSize: 14,
    fontWeight: 600,
  },
};
