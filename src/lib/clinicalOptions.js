export const SPECIALITY_OPTIONS = [
  "General Physician",
  "Pediatrics",
  "Gynecology",
  "Dermatology",
  "Orthopedics",
  "ENT",
  "Cardiology",
  "Diabetology",
  "Pulmonology",
  "Neurology",
  "Gastroenterology",
];

export const DEFAULT_OPD_CASES = [
  "General checkup",
  "Fever",
  "Cold and cough",
  "Headache",
  "Gastritis / acidity",
  "Body pain",
  "Blood pressure review",
  "Diabetes follow-up",
];

export const OPD_CASES_BY_SPECIALITY = {
  "general physician": [
    "General checkup",
    "Fever",
    "Cold and cough",
    "Viral illness",
    "Body pain",
    "Headache",
    "Gastritis / acidity",
    "Blood pressure review",
  ],
  pediatrics: [
    "Fever",
    "Cold and cough",
    "Vaccination review",
    "Growth and nutrition review",
    "Wheezing / breathing issue",
    "Stomach pain",
    "Skin rash",
    "Routine pediatric follow-up",
  ],
  gynecology: [
    "Irregular periods",
    "Pregnancy checkup",
    "PCOS review",
    "Pelvic pain",
    "White discharge",
    "Infertility consultation",
    "Menopause review",
    "Routine gynecology follow-up",
  ],
  dermatology: [
    "Acne",
    "Skin rash",
    "Hair fall",
    "Fungal infection",
    "Pigmentation",
    "Itching / allergy",
    "Psoriasis review",
    "Routine dermatology follow-up",
  ],
  orthopedics: [
    "Knee pain",
    "Back pain",
    "Neck pain",
    "Joint swelling",
    "Fracture follow-up",
    "Shoulder pain",
    "Arthritis review",
    "Routine orthopedic follow-up",
  ],
  ent: [
    "Cold and cough",
    "Ear pain",
    "Throat pain",
    "Sinusitis",
    "Hearing issue",
    "Vertigo",
    "Tonsillitis review",
    "Routine ENT follow-up",
  ],
  cardiology: [
    "Hypertension follow-up",
    "Chest pain review",
    "Palpitations",
    "Shortness of breath",
    "ECG review",
    "Post-cardiac follow-up",
    "Heart failure review",
    "Routine cardiology follow-up",
  ],
  diabetology: [
    "Diabetes follow-up",
    "Sugar fluctuation review",
    "Neuropathy symptoms",
    "Foot care review",
    "HbA1c review",
    "Insulin adjustment review",
    "Diet counseling follow-up",
    "Routine diabetic OPD",
  ],
  pulmonology: [
    "Asthma follow-up",
    "Chronic cough",
    "Breathlessness",
    "COPD review",
    "Allergy / wheeze",
    "Sleep apnea review",
    "Nebulization follow-up",
    "Routine pulmonology follow-up",
  ],
  neurology: [
    "Headache / migraine",
    "Vertigo",
    "Seizure follow-up",
    "Stroke review",
    "Neuropathy",
    "Memory concerns",
    "Tremor / movement issue",
    "Routine neurology follow-up",
  ],
  gastroenterology: [
    "Acidity / reflux",
    "Abdominal pain",
    "Loose stools",
    "Constipation",
    "Fatty liver review",
    "IBS follow-up",
    "Hepatitis review",
    "Routine gastro follow-up",
  ],
};

export const FOLLOWUP_TYPES = [
  "General checkup",
  "Diabetes follow-up",
  "Hypertension follow-up",
  "Thyroid follow-up",
  "Cardiac follow-up",
  "Orthopedic follow-up",
  "Skin / Dermatology",
  "ENT",
  "Eye / Ophthalmology",
  "Gynecology",
  "Pediatrics",
  "Other",
];

export const FREQUENCY_OPTIONS = [
  "OD",
  "BD",
  "TDS",
  "QID",
  "SOS",
  "HS",
  "AC",
  "PC",
  "OD after food",
  "BD after food",
  "TDS after food",
  "At bedtime",
];

export function normalizeSpeciality(value = "") {
  return String(value || "").trim().toLowerCase();
}

export function getCommonOpdCases(speciality = "") {
  return OPD_CASES_BY_SPECIALITY[normalizeSpeciality(speciality)] || DEFAULT_OPD_CASES;
}

export function getFrequencyOptions(currentValue = "") {
  const current = String(currentValue || "").trim();
  return current && !FREQUENCY_OPTIONS.includes(current)
    ? [current, ...FREQUENCY_OPTIONS]
    : FREQUENCY_OPTIONS;
}
