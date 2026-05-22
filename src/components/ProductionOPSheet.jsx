import { useState, useRef, useCallback, useEffect } from "react";

// ── COMPREHENSIVE LAB TESTS DATABASE ──────────────────────────────────────────
const LAB_TESTS = [
  // Haematology
  { name:"CBC (Complete Blood Count)", cat:"Haematology", params:[
    { p:"Haemoglobin", unit:"g/dL", range:"M: 13.5-17.5 / F: 12-15.5" },
    { p:"WBC", unit:"×10³/µL", range:"4.5-11.0" },
    { p:"Platelets", unit:"×10³/µL", range:"150-400" },
    { p:"RBC", unit:"×10⁶/µL", range:"M: 4.5-5.9 / F: 4.0-5.2" },
    { p:"Haematocrit", unit:"%", range:"M: 41-53 / F: 36-46" },
    { p:"MCV", unit:"fL", range:"80-100" },
    { p:"MCH", unit:"pg", range:"27-33" },
    { p:"MCHC", unit:"g/dL", range:"32-36" },
    { p:"Neutrophils", unit:"%", range:"50-70" },
    { p:"Lymphocytes", unit:"%", range:"20-40" },
    { p:"Monocytes", unit:"%", range:"2-8" },
    { p:"Eosinophils", unit:"%", range:"1-4" },
    { p:"Basophils", unit:"%", range:"0-1" },
  ]},
  { name:"ESR", cat:"Haematology", params:[
    { p:"ESR", unit:"mm/hr", range:"M: 0-15 / F: 0-20" },
  ]},
  { name:"PT/INR", cat:"Haematology", params:[
    { p:"PT", unit:"seconds", range:"11-13.5" },
    { p:"INR", unit:"", range:"0.8-1.2" },
    { p:"aPTT", unit:"seconds", range:"25-35" },
  ]},
  { name:"Peripheral Smear", cat:"Haematology", params:[
    { p:"RBC morphology", unit:"", range:"Normal" },
    { p:"WBC differential", unit:"", range:"Normal" },
  ]},
  { name:"Reticulocyte Count", cat:"Haematology", params:[
    { p:"Reticulocyte %", unit:"%", range:"0.5-2.5" },
  ]},
  { name:"G6PD", cat:"Haematology", params:[
    { p:"G6PD activity", unit:"U/gHb", range:"6.97-20.5" },
  ]},

  // Biochemistry — Blood Sugar
  { name:"RBS (Random Blood Sugar)", cat:"Blood Sugar", params:[
    { p:"Random glucose", unit:"mg/dL", range:"<200" },
  ]},
  { name:"FBS (Fasting Blood Sugar)", cat:"Blood Sugar", params:[
    { p:"Fasting glucose", unit:"mg/dL", range:"70-99" },
  ]},
  { name:"PPBS (Post-prandial Blood Sugar)", cat:"Blood Sugar", params:[
    { p:"Post-meal glucose", unit:"mg/dL", range:"<140" },
  ]},
  { name:"HbA1c", cat:"Blood Sugar", params:[
    { p:"HbA1c", unit:"%", range:"<5.7 (Normal) / 5.7-6.4 (Pre-DM) / ≥6.5 (DM)" },
    { p:"eAG", unit:"mg/dL", range:"<117" },
  ]},
  { name:"Insulin (Fasting)", cat:"Blood Sugar", params:[
    { p:"Insulin", unit:"µIU/mL", range:"2-25" },
    { p:"HOMA-IR", unit:"", range:"<2.0" },
  ]},
  { name:"C-peptide", cat:"Blood Sugar", params:[
    { p:"C-peptide", unit:"ng/mL", range:"0.8-3.1" },
  ]},

  // Lipid Profile
  { name:"Lipid Profile", cat:"Lipids", params:[
    { p:"Total Cholesterol", unit:"mg/dL", range:"<200" },
    { p:"LDL Cholesterol", unit:"mg/dL", range:"<100" },
    { p:"HDL Cholesterol", unit:"mg/dL", range:"M: >40 / F: >50" },
    { p:"Triglycerides", unit:"mg/dL", range:"<150" },
    { p:"VLDL", unit:"mg/dL", range:"2-30" },
    { p:"Non-HDL Cholesterol", unit:"mg/dL", range:"<130" },
  ]},

  // Liver Function
  { name:"LFT (Liver Function Tests)", cat:"Liver", params:[
    { p:"Total Bilirubin", unit:"mg/dL", range:"0.2-1.2" },
    { p:"Direct Bilirubin", unit:"mg/dL", range:"0.0-0.3" },
    { p:"Indirect Bilirubin", unit:"mg/dL", range:"0.1-1.0" },
    { p:"ALT (SGPT)", unit:"U/L", range:"7-56" },
    { p:"AST (SGOT)", unit:"U/L", range:"10-40" },
    { p:"ALP", unit:"U/L", range:"44-147" },
    { p:"GGT", unit:"U/L", range:"M: 9-48 / F: 7-25" },
    { p:"Total Protein", unit:"g/dL", range:"6.3-8.2" },
    { p:"Albumin", unit:"g/dL", range:"3.5-5.0" },
    { p:"Globulin", unit:"g/dL", range:"2.0-3.5" },
    { p:"A/G Ratio", unit:"", range:"1.2-2.2" },
  ]},

  // Kidney Function
  { name:"KFT / RFT (Kidney Function Tests)", cat:"Kidney", params:[
    { p:"Serum Creatinine", unit:"mg/dL", range:"M: 0.7-1.2 / F: 0.5-1.0" },
    { p:"Blood Urea", unit:"mg/dL", range:"7-25" },
    { p:"BUN", unit:"mg/dL", range:"6-20" },
    { p:"Uric Acid", unit:"mg/dL", range:"M: 3.5-7.2 / F: 2.6-6.0" },
    { p:"eGFR", unit:"mL/min/1.73m²", range:">60 (Normal)" },
  ]},
  { name:"Serum Electrolytes", cat:"Kidney", params:[
    { p:"Sodium (Na⁺)", unit:"mEq/L", range:"136-145" },
    { p:"Potassium (K⁺)", unit:"mEq/L", range:"3.5-5.1" },
    { p:"Chloride (Cl⁻)", unit:"mEq/L", range:"98-107" },
    { p:"Bicarbonate (HCO₃⁻)", unit:"mEq/L", range:"22-29" },
    { p:"Calcium (Ca²⁺)", unit:"mg/dL", range:"8.5-10.5" },
    { p:"Phosphorus", unit:"mg/dL", range:"2.5-4.5" },
    { p:"Magnesium", unit:"mg/dL", range:"1.5-2.5" },
  ]},
  { name:"24hr Urine Protein", cat:"Kidney", params:[
    { p:"24hr Urine Protein", unit:"mg/day", range:"<150" },
  ]},
  { name:"Microalbuminuria", cat:"Kidney", params:[
    { p:"Microalbumin (spot)", unit:"mg/g creatinine", range:"<30" },
  ]},

  // Thyroid
  { name:"TSH", cat:"Thyroid", params:[
    { p:"TSH", unit:"µIU/mL", range:"0.4-4.0" },
  ]},
  { name:"T3/T4/TSH (Full thyroid panel)", cat:"Thyroid", params:[
    { p:"TSH", unit:"µIU/mL", range:"0.4-4.0" },
    { p:"Free T4 (fT4)", unit:"ng/dL", range:"0.8-1.8" },
    { p:"Free T3 (fT3)", unit:"pg/mL", range:"2.3-4.2" },
    { p:"Total T3", unit:"ng/dL", range:"80-200" },
    { p:"Total T4", unit:"µg/dL", range:"5.0-12.0" },
  ]},
  { name:"Anti-TPO / Anti-thyroglobulin", cat:"Thyroid", params:[
    { p:"Anti-TPO antibody", unit:"IU/mL", range:"<35" },
    { p:"Anti-thyroglobulin", unit:"IU/mL", range:"<115" },
  ]},

  // Hormones
  { name:"FSH / LH", cat:"Hormones", params:[
    { p:"FSH", unit:"mIU/mL", range:"Follicular: 2.5-10.2 / Mid-cycle: 3.4-33.4 / Luteal: 1.5-9.1 / Post-meno: 23-116" },
    { p:"LH", unit:"mIU/mL", range:"Follicular: 1.9-12.5 / Mid-cycle: 8.7-76.3 / Luteal: 0.5-16.9 / Post-meno: 10.0-54.7" },
  ]},
  { name:"Prolactin", cat:"Hormones", params:[
    { p:"Prolactin", unit:"ng/mL", range:"M: 2-18 / F (non-pregnant): 2-29" },
  ]},
  { name:"Testosterone", cat:"Hormones", params:[
    { p:"Total Testosterone", unit:"ng/dL", range:"M: 280-1100 / F: 15-70" },
    { p:"Free Testosterone", unit:"pg/mL", range:"M: 9.0-30.0 / F: 0.6-3.8" },
  ]},
  { name:"AMH (Anti-Müllerian Hormone)", cat:"Hormones", params:[
    { p:"AMH", unit:"ng/mL", range:"F reproductive age: 1.0-3.5" },
  ]},
  { name:"Estradiol (E2)", cat:"Hormones", params:[
    { p:"Estradiol", unit:"pg/mL", range:"Follicular: 12.5-166 / Ovulatory: 85.8-498 / Luteal: 43.8-211 / Post-meno: <6-54" },
  ]},
  { name:"Progesterone", cat:"Hormones", params:[
    { p:"Progesterone", unit:"ng/mL", range:"Follicular: 0.1-0.9 / Luteal: 1.8-23.9" },
  ]},
  { name:"Cortisol", cat:"Hormones", params:[
    { p:"Morning Cortisol (8am)", unit:"µg/dL", range:"6-23" },
    { p:"Evening Cortisol (4pm)", unit:"µg/dL", range:"3-12" },
  ]},
  { name:"Insulin-like Growth Factor (IGF-1)", cat:"Hormones", params:[
    { p:"IGF-1", unit:"ng/mL", range:"Age-dependent: Adult ~115-307" },
  ]},
  { name:"DHEA-S", cat:"Hormones", params:[
    { p:"DHEA-S", unit:"µg/dL", range:"M: 130-500 / F: 35-430" },
  ]},
  { name:"Parathyroid Hormone (PTH)", cat:"Hormones", params:[
    { p:"PTH (intact)", unit:"pg/mL", range:"15-65" },
  ]},

  // Vitamins & Minerals
  { name:"Vitamin D (25-OH)", cat:"Vitamins", params:[
    { p:"25-OH Vitamin D", unit:"ng/mL", range:"Deficient: <20 / Insufficient: 20-29 / Normal: 30-100" },
  ]},
  { name:"Vitamin B12", cat:"Vitamins", params:[
    { p:"Vitamin B12", unit:"pg/mL", range:"200-900" },
  ]},
  { name:"Folate (Folic Acid)", cat:"Vitamins", params:[
    { p:"Serum Folate", unit:"ng/mL", range:"3.1-17.5" },
    { p:"RBC Folate", unit:"ng/mL", range:"140-628" },
  ]},
  { name:"Iron Studies", cat:"Vitamins", params:[
    { p:"Serum Iron", unit:"µg/dL", range:"M: 60-170 / F: 50-170" },
    { p:"TIBC", unit:"µg/dL", range:"240-450" },
    { p:"Transferrin Saturation", unit:"%", range:"15-50" },
    { p:"Serum Ferritin", unit:"ng/mL", range:"M: 12-300 / F: 12-150" },
  ]},
  { name:"Zinc", cat:"Vitamins", params:[
    { p:"Serum Zinc", unit:"µg/dL", range:"70-120" },
  ]},
  { name:"Copper", cat:"Vitamins", params:[
    { p:"Serum Copper", unit:"µg/dL", range:"70-140" },
  ]},

  // Inflammatory Markers
  { name:"CRP (C-Reactive Protein)", cat:"Inflammatory", params:[
    { p:"CRP", unit:"mg/L", range:"<10 (Normal) / High sensitivity CRP: <1.0" },
  ]},
  { name:"hs-CRP", cat:"Inflammatory", params:[
    { p:"hs-CRP", unit:"mg/L", range:"Low risk: <1.0 / Average: 1.0-3.0 / High risk: >3.0" },
  ]},
  { name:"Procalcitonin (PCT)", cat:"Inflammatory", params:[
    { p:"Procalcitonin", unit:"ng/mL", range:"<0.1 (No infection)" },
  ]},
  { name:"Ferritin", cat:"Inflammatory", params:[
    { p:"Serum Ferritin", unit:"ng/mL", range:"M: 12-300 / F: 12-150" },
  ]},
  { name:"IL-6 (Interleukin-6)", cat:"Inflammatory", params:[
    { p:"IL-6", unit:"pg/mL", range:"<7" },
  ]},
  { name:"LDH (Lactate Dehydrogenase)", cat:"Inflammatory", params:[
    { p:"LDH", unit:"U/L", range:"140-280" },
  ]},

  // Cardiac
  { name:"Troponin I", cat:"Cardiac", params:[
    { p:"Troponin I", unit:"ng/mL", range:"<0.04 (Normal) / >0.04 (Abnormal)" },
  ]},
  { name:"Troponin T", cat:"Cardiac", params:[
    { p:"Troponin T (hs)", unit:"ng/L", range:"<14" },
  ]},
  { name:"CK-MB", cat:"Cardiac", params:[
    { p:"CK-MB", unit:"ng/mL", range:"<5" },
    { p:"CK-MB %", unit:"%", range:"<5% of total CK" },
  ]},
  { name:"BNP / NT-proBNP", cat:"Cardiac", params:[
    { p:"BNP", unit:"pg/mL", range:"<100" },
    { p:"NT-proBNP", unit:"pg/mL", range:"Age <75: <125 / Age ≥75: <450" },
  ]},
  { name:"D-Dimer", cat:"Cardiac", params:[
    { p:"D-Dimer", unit:"µg/mL FEU", range:"<0.50" },
  ]},
  { name:"Homocysteine", cat:"Cardiac", params:[
    { p:"Homocysteine", unit:"µmol/L", range:"5-15" },
  ]},

  // Infection / Serology
  { name:"Blood Culture & Sensitivity", cat:"Microbiology", params:[
    { p:"Organism", unit:"", range:"No growth" },
    { p:"Sensitivity", unit:"", range:"—" },
  ]},
  { name:"Urine Culture & Sensitivity", cat:"Microbiology", params:[
    { p:"Colony count", unit:"CFU/mL", range:"<10,000 (Normal)" },
    { p:"Organism", unit:"", range:"No growth" },
  ]},
  { name:"Stool Culture", cat:"Microbiology", params:[
    { p:"Organism", unit:"", range:"No pathogen" },
  ]},
  { name:"Widal Test", cat:"Microbiology", params:[
    { p:"Salmonella typhi O", unit:"Titre", range:"<1:80" },
    { p:"Salmonella typhi H", unit:"Titre", range:"<1:80" },
  ]},
  { name:"Dengue NS1 Antigen", cat:"Microbiology", params:[
    { p:"Dengue NS1", unit:"", range:"Negative" },
    { p:"Dengue IgM", unit:"", range:"Negative" },
    { p:"Dengue IgG", unit:"", range:"Negative" },
  ]},
  { name:"Malaria Antigen (RDT)", cat:"Microbiology", params:[
    { p:"Malaria antigen", unit:"", range:"Negative" },
    { p:"P. falciparum", unit:"", range:"Negative" },
    { p:"P. vivax", unit:"", range:"Negative" },
  ]},
  { name:"HBsAg", cat:"Serology", params:[
    { p:"HBsAg", unit:"", range:"Negative" },
  ]},
  { name:"Anti-HCV", cat:"Serology", params:[
    { p:"Anti-HCV", unit:"", range:"Negative" },
  ]},
  { name:"HIV (1+2)", cat:"Serology", params:[
    { p:"HIV 1 & 2", unit:"", range:"Non-reactive" },
  ]},
  { name:"VDRL / RPR", cat:"Serology", params:[
    { p:"VDRL", unit:"", range:"Non-reactive" },
  ]},
  { name:"HBsAg + Anti-HCV + VDRL (Panel)", cat:"Serology", params:[
    { p:"HBsAg", unit:"", range:"Negative" },
    { p:"Anti-HCV", unit:"", range:"Negative" },
    { p:"VDRL", unit:"", range:"Non-reactive" },
  ]},
  { name:"Hepatitis B Core Antibody (Anti-HBc)", cat:"Serology", params:[
    { p:"Anti-HBc Total", unit:"", range:"Non-reactive" },
  ]},
  { name:"Hepatitis B Surface Antibody (Anti-HBs)", cat:"Serology", params:[
    { p:"Anti-HBs", unit:"IU/L", range:">10 (Protected)" },
  ]},
  { name:"ANA (Antinuclear Antibody)", cat:"Autoimmune", params:[
    { p:"ANA titre", unit:"", range:"<1:80" },
    { p:"ANA pattern", unit:"", range:"Negative" },
  ]},
  { name:"Anti-dsDNA", cat:"Autoimmune", params:[
    { p:"Anti-dsDNA", unit:"IU/mL", range:"<30" },
  ]},
  { name:"RF (Rheumatoid Factor)", cat:"Autoimmune", params:[
    { p:"RF IgM", unit:"IU/mL", range:"<14" },
  ]},
  { name:"Anti-CCP", cat:"Autoimmune", params:[
    { p:"Anti-CCP", unit:"U/mL", range:"<17" },
  ]},
  { name:"ANCA", cat:"Autoimmune", params:[
    { p:"c-ANCA", unit:"", range:"Negative" },
    { p:"p-ANCA", unit:"", range:"Negative" },
  ]},
  { name:"Complement C3/C4", cat:"Autoimmune", params:[
    { p:"C3", unit:"mg/dL", range:"90-180" },
    { p:"C4", unit:"mg/dL", range:"16-47" },
  ]},

  // Urine
  { name:"Urine R/M (Routine & Microscopy)", cat:"Urine", params:[
    { p:"pH", unit:"", range:"4.5-8.0" },
    { p:"Specific Gravity", unit:"", range:"1.005-1.030" },
    { p:"Protein", unit:"", range:"Nil" },
    { p:"Glucose", unit:"", range:"Nil" },
    { p:"Ketones", unit:"", range:"Nil" },
    { p:"Blood", unit:"", range:"Nil" },
    { p:"Bilirubin", unit:"", range:"Nil" },
    { p:"Urobilinogen", unit:"EU/dL", range:"0.2-1.0" },
    { p:"Nitrites", unit:"", range:"Negative" },
    { p:"Leukocyte esterase", unit:"", range:"Negative" },
    { p:"Pus cells (HPF)", unit:"/HPF", range:"0-5" },
    { p:"RBC (HPF)", unit:"/HPF", range:"0-2" },
    { p:"Casts", unit:"", range:"None" },
    { p:"Crystals", unit:"", range:"None" },
  ]},
  { name:"UPT (Urine Pregnancy Test)", cat:"Urine", params:[
    { p:"hCG (urine)", unit:"", range:"Negative (non-pregnant)" },
  ]},
  { name:"24hr Urine Creatinine", cat:"Urine", params:[
    { p:"Urine Creatinine", unit:"mg/day", range:"M: 1000-2000 / F: 800-1800" },
  ]},

  // Tumour Markers
  { name:"PSA (Prostate-Specific Antigen)", cat:"Tumour Markers", params:[
    { p:"Total PSA", unit:"ng/mL", range:"<4.0" },
    { p:"Free PSA", unit:"ng/mL", range:">25% (lower risk)" },
  ]},
  { name:"CEA", cat:"Tumour Markers", params:[
    { p:"CEA", unit:"ng/mL", range:"Non-smoker: <3.0 / Smoker: <5.0" },
  ]},
  { name:"CA 125", cat:"Tumour Markers", params:[
    { p:"CA 125", unit:"U/mL", range:"<35" },
  ]},
  { name:"CA 19-9", cat:"Tumour Markers", params:[
    { p:"CA 19-9", unit:"U/mL", range:"<37" },
  ]},
  { name:"AFP (Alpha-Fetoprotein)", cat:"Tumour Markers", params:[
    { p:"AFP", unit:"ng/mL", range:"<10" },
  ]},
  { name:"CA 15-3", cat:"Tumour Markers", params:[
    { p:"CA 15-3", unit:"U/mL", range:"<25" },
  ]},
  { name:"Beta-HCG (Quantitative)", cat:"Tumour Markers", params:[
    { p:"Serum β-HCG", unit:"mIU/mL", range:"Non-pregnant: <5" },
  ]},
  { name:"LDH", cat:"Tumour Markers", params:[
    { p:"LDH", unit:"U/L", range:"140-280" },
  ]},

  // Bone
  { name:"Bone Density (DEXA)", cat:"Bone", params:[
    { p:"Lumbar T-score", unit:"SD", range:"Normal: >-1.0 / Osteopenia: -1.0 to -2.5 / Osteoporosis: <-2.5" },
    { p:"Femoral neck T-score", unit:"SD", range:"Normal: >-1.0" },
  ]},
  { name:"Bone Markers", cat:"Bone", params:[
    { p:"ALP (bone specific)", unit:"U/L", range:"11-73" },
    { p:"Osteocalcin", unit:"ng/mL", range:"11-46" },
    { p:"Beta-CrossLaps", unit:"pg/mL", range:"<573" },
  ]},

  // Pancreas
  { name:"Serum Amylase", cat:"Pancreas", params:[
    { p:"Amylase", unit:"U/L", range:"28-100" },
  ]},
  { name:"Serum Lipase", cat:"Pancreas", params:[
    { p:"Lipase", unit:"U/L", range:"13-60" },
  ]},

  // Respiratory
  { name:"Sputum AFB (for TB)", cat:"Respiratory", params:[
    { p:"AFB smear", unit:"", range:"Negative" },
    { p:"AFB culture", unit:"", range:"No growth (Mycobacterium)" },
  ]},
  { name:"Sputum Culture & Sensitivity", cat:"Respiratory", params:[
    { p:"Organism", unit:"", range:"Normal flora only" },
  ]},
  { name:"SpO2 (Pulse Oximetry)", cat:"Respiratory", params:[
    { p:"SpO2", unit:"%", range:"95-100" },
  ]},
  { name:"Spirometry (PFT)", cat:"Respiratory", params:[
    { p:"FVC", unit:"% predicted", range:">80%" },
    { p:"FEV1", unit:"% predicted", range:">80%" },
    { p:"FEV1/FVC ratio", unit:"%", range:">0.70" },
    { p:"Peak flow (PEFR)", unit:"L/min", range:"Varies by age/height" },
  ]},

  // CSF
  { name:"CSF Analysis", cat:"CSF", params:[
    { p:"Opening pressure", unit:"cmH2O", range:"7-18" },
    { p:"Appearance", unit:"", range:"Clear, colourless" },
    { p:"Protein", unit:"mg/dL", range:"15-45" },
    { p:"Glucose", unit:"mg/dL", range:"50-80 (60-70% of serum glucose)" },
    { p:"WBC", unit:"cells/µL", range:"0-5" },
    { p:"RBC", unit:"cells/µL", range:"0" },
    { p:"Chloride", unit:"mEq/L", range:"120-130" },
  ]},

  // Genetic / Screening
  { name:"Karyotype", cat:"Genetics", params:[
    { p:"Chromosome analysis", unit:"", range:"46,XX or 46,XY (normal diploid)" },
  ]},
  { name:"BRCA 1/2", cat:"Genetics", params:[
    { p:"BRCA1 mutation", unit:"", range:"No pathogenic variant" },
    { p:"BRCA2 mutation", unit:"", range:"No pathogenic variant" },
  ]},
  { name:"Thalassaemia screening", cat:"Genetics", params:[
    { p:"Hb electrophoresis", unit:"", range:"HbA >95%" },
    { p:"HbA2", unit:"%", range:"1.5-3.5" },
    { p:"HbF", unit:"%", range:"<2" },
  ]},
  { name:"Newborn screening panel", cat:"Genetics", params:[
    { p:"PKU (Phenylalanine)", unit:"mg/dL", range:"<2" },
    { p:"TSH (neonatal)", unit:"mIU/L", range:"<10" },
    { p:"Biotinidase", unit:"", range:"Normal activity" },
  ]},

  // Drug Levels
  { name:"Lithium level", cat:"Drug Levels", params:[
    { p:"Serum Lithium", unit:"mEq/L", range:"Therapeutic: 0.6-1.2" },
  ]},
  { name:"Phenytoin level", cat:"Drug Levels", params:[
    { p:"Serum Phenytoin", unit:"µg/mL", range:"Therapeutic: 10-20" },
  ]},
  { name:"Digoxin level", cat:"Drug Levels", params:[
    { p:"Serum Digoxin", unit:"ng/mL", range:"Therapeutic: 0.5-2.0" },
  ]},
  { name:"Vancomycin level", cat:"Drug Levels", params:[
    { p:"Vancomycin trough", unit:"µg/mL", range:"Therapeutic: 10-20" },
  ]},
];

// ── DEPT DATA ─────────────────────────────────────────────────────────────────
const DEPT = {
  gen: {
    label:"General Medicine",
    complaints:["Fever","Headache","Cough","Chest pain","Fatigue","Breathlessness","Vomiting","Diarrhoea","Abdominal pain","Weakness","Dizziness","Palpitations","Body aches","Loss of appetite","Sweating","Chills","Jaundice","Swelling"],
    diag:["Hypertension","Type 2 Diabetes","Viral fever","URI","GERD","Anaemia","Asthma","UTI","Migraine","Hypothyroidism","Dengue","Malaria","Typhoid","Hepatitis","IBS","CKD","Heart failure"],
    examSystems:["General condition","Cardiovascular (CVS)","Respiratory (RS)","Abdomen","CNS / Neurological","Musculoskeletal","Lymph nodes","Skin"],
    investigations:["CBC","RBS","HbA1c","Lipid profile","LFT","KFT","CRP","ESR","Blood culture","PT/INR","Blood group","Dengue NS1","Widal","Malarial antigen","Serum electrolytes","Urine R/M","Urine culture","Chest X-ray","USG abdomen","CT scan","ECG","Echo","TSH","Vitamin D","Vitamin B12"],
    advice:["Low salt diet","Low sugar diet","Regular exercise","Stay hydrated","Take rest","Avoid alcohol","Quit smoking","Weight loss","Balanced diet","Monitor BP at home","Monitor sugar daily","Follow up if worsens"],
    proc:["Injection given","IV cannula inserted","Nebulisation done","Wound dressing","Suturing","ECG done","IV fluids given"],
    rx:[["Paracetamol","500mg","1-0-1","After food","5 days",""],["Pantoprazole","40mg","1-0-0","Before food","14 days",""]],
  },
  pedia:{
    label:"Paediatrics",
    complaints:["Fever","Cough","Cold","Vomiting","Loose stools","Ear pain","Throat pain","Rash","Poor feeding","Crying excessively","Breathlessness","Seizure","Constipation","Abdominal pain","Runny nose"],
    diag:["Viral URTI","Otitis media","Tonsillitis","Bronchiolitis","Gastroenteritis","Febrile seizure","Pneumonia","Anaemia","Malnutrition","Asthma","Dengue","Measles","Chickenpox"],
    examSystems:["General condition","Temperature","Weight/Height","Throat","Chest","Abdomen","Ear","Skin","Hydration status"],
    investigations:["CBC","CRP","Blood culture","Blood glucose","Serum electrolytes","Widal","Dengue NS1","Blood group","Urine R/M","Urine culture","Chest X-ray","USG abdomen","Thyroid neonatal","Vitamin D","Iron studies"],
    advice:["ORS for diarrhoea","Paracetamol for fever","Sponge bath if high fever","Continue breastfeeding","Adequate fluids","Isolate if contagious","Soft diet","No school for 3 days","Hand hygiene","Return if not improving in 48hrs"],
    proc:["Injection given","IV cannula","Nebulisation","Ear syringing","Wound dressing","IV fluids","Blood sample","Urine bag sample"],
    rx:[["Paracetamol syrup","5ml","1-0-1","After food","5 days",""],["Amoxicillin syrup","5ml","1-1-1","After food","7 days",""]],
  },
  gynec:{
    label:"Gynaecology & Obstetrics",
    complaints:["Irregular periods","Pelvic pain","Vaginal discharge","Missed period","Heavy bleeding","Nausea & vomiting","Lower back pain","Breast pain","Burning urination","Hot flashes","Infertility","Spotting","Bloating","Mood swings"],
    diag:["PCOS","Dysmenorrhoea","PID","Pregnancy","UTI","Uterine fibroids","Ovarian cyst","Anaemia","Menopause","Ectopic pregnancy","Endometriosis","Preeclampsia","Gestational diabetes","Threatened abortion"],
    examSystems:["General condition","P/A examination","P/V examination","Uterus size","Adnexa","Cervix","Fundal height (if pregnant)","Blood pressure","Weight"],
    investigations:["CBC","HCG quantitative","FSH/LH","AMH","Blood group","HbA1c","VDRL","HIV","HBsAg","USG pelvis","Urine R/M","UPT","TSH","Prolactin","Testosterone","Estradiol","Progesterone","Pap smear"],
    advice:["Folic acid daily","Iron-rich foods","Avoid heavy lifting","Pelvic floor exercises","Regular ANC visits","Rest adequately","Avoid raw food","Calcium & Vitamin D","Monitor BP","Reduce stress"],
    proc:["IUD insertion","Pap smear done","Cauterisation","Endometrial biopsy","Colposcopy","Vaginal swab","Foetal Doppler done","IUD removal","D&C"],
    rx:[["Folic acid","5mg","0-1-0","After food","30 days",""],["Ferrous sulphate","200mg","1-0-1","After food","30 days",""]],
  },
  ortho:{
    label:"Orthopaedics",
    complaints:["Knee pain","Back pain","Joint swelling","Shoulder pain","Neck pain","Hip pain","Foot pain","Wrist pain","Weakness in limbs","After fall","Morning stiffness","Numbness","Tingling","Locking of joint","Limping"],
    diag:["Osteoarthritis","Lumbar spondylosis","Fracture","Sciatica","Cervical spondylosis","Gout","Frozen shoulder","Plantar fasciitis","Tendinitis","Ligament tear","Meniscus tear","Prolapsed disc","Rheumatoid arthritis"],
    examSystems:["Gait","Range of motion","Tenderness","Swelling","Deformity","Neurovascular status","Power & reflexes","Special tests"],
    investigations:["X-ray (affected joint)","MRI","CT scan","Bone density scan","CBC","CRP","ESR","Uric acid","Calcium","Vitamin D","ALP","RF factor","Anti-CCP","ANA"],
    advice:["Apply ice pack 20 min TDS","Elevate the limb","Physiotherapy referral","Avoid weight bearing","Use walking aid","Calcium & Vitamin D diet","Avoid squatting","Lumbar belt","Posture correction","Weight reduction"],
    proc:["Casting done","Splinting done","Joint aspiration","Intra-articular injection","Wound dressing","Traction applied","POP cast","Plaster removal","Suture removal"],
    rx:[["Diclofenac","50mg","1-0-1","After food","5 days",""],["Calcium + D3","1 tab","1-0-0","After food","30 days",""]],
  },
  dental:{
    label:"Dental",
    complaints:["Toothache","Swollen gum","Bleeding gums","Sensitivity","Bad breath","Broken tooth","Jaw pain","Food lodgement","Oral ulcer","Numbness","Clicking jaw","Loose tooth","Pus discharge","Difficulty chewing"],
    diag:["Dental caries","Gingivitis","Periodontitis","Pulpitis","Pericoronitis","Periapical abscess","TMJ disorder","Oral ulcer","Dry socket","Impacted wisdom tooth","Bruxism","Root canal needed"],
    examSystems:["Extraoral examination","Intraoral examination","Tooth (affected)","Gum condition","Occlusion","TMJ","Lymph nodes"],
    investigations:["OPG X-ray","IOPA X-ray","Bitewing X-ray","CBCT","CBC (if abscess)","Blood glucose","INR"],
    advice:["Soft diet 24 hrs","No hot/cold drinks","Brush gently twice daily","Salt water gargle TDS","No smoking","No straws after extraction","Take medicines on time","Follow up if swelling increases"],
    proc:["Tooth extraction","Root canal treatment","Scaling & polishing","Filling done","Crown fitting","Incision & drainage","Socket irrigation","Fluoride application"],
    rx:[["Amoxicillin","500mg","1-1-1","After food","5 days",""],["Ibuprofen","400mg","1-0-1","After food","3 days",""],["Metronidazole","400mg","1-1-1","After food","5 days",""]],
  },
  skin:{
    label:"Dermatology",
    complaints:["Rash","Itching","Acne","Hair loss","Nail changes","Pigmentation","Dry skin","Oozing wound","Scaling","Blistering","Burning","Skin darkening","Warts","Fungal patches","Dandruff","Hives"],
    diag:["Atopic dermatitis","Psoriasis","Acne vulgaris","Fungal infection","Urticaria","Alopecia areata","Vitiligo","Seborrhoeic dermatitis","Contact dermatitis","Scabies","Cellulitis","Melasma","Lichen planus","Pityriasis versicolor"],
    examSystems:["Site & distribution","Type of lesion","Morphology","Color","Surface changes","Margins","Associated features","Scalp","Nails","Mucous membranes"],
    investigations:["KOH mount","Skin biopsy","CBC","IgE levels","ANA","Thyroid","Serum ferritin","Vitamin D","DHEA","Testosterone","Dermoscopy","Patch test"],
    advice:["Avoid scratching","Moisturiser twice daily","Sun protection SPF 30+","Avoid trigger foods","Gentle cleansers","Loose cotton clothes","Keep nails short","Avoid sharing towels","No hot water bath"],
    proc:["Intralesional steroid injection","Cryotherapy","Chemical peel","Comedone extraction","Patch test","Skin biopsy","Wound dressing","Electrocautery"],
    rx:[["Cetirizine","10mg","0-0-1","After food","7 days",""],["Betamethasone cream","Apply thinly","1-0-1","External use","14 days","On affected area"]],
  },
  ent:{
    label:"ENT",
    complaints:["Ear pain","Hearing loss","Blocked nose","Sore throat","Hoarseness","Nasal discharge","Tinnitus","Vertigo","Snoring","Swallowing difficulty","Post nasal drip","Facial pain","Epistaxis","Foreign body","Ear discharge"],
    diag:["Otitis media","CSOM","Allergic rhinitis","Tonsillitis","Sinusitis","Laryngitis","BPPV","DNS","Pharyngitis","Adenoid hypertrophy","Nasal polyps","Wax impaction","Meniere's disease"],
    examSystems:["Ear (otoscopy)","Nose (anterior rhinoscopy)","Throat (tonsils, pharynx)","Neck (lymph nodes)","Face (sinus tenderness)","Voice","Nasal septum"],
    investigations:["X-ray PNS","CT PNS","CT temporal bone","CBC","CRP","Culture swab","Allergy panel","ASO titre","Pure tone audiometry","Tympanometry"],
    advice:["Steam inhalation BD","Avoid cold drinks","Nasal saline wash daily","Avoid dust","Voice rest if hoarse","Elevate head while sleeping","Avoid nose picking","Avoid allergens","Swimming avoided 2 weeks"],
    proc:["Ear syringing / suction","Nasal cauterisation","Foreign body removal","Aural toilet","Nasal packing","Incision & drainage"],
    rx:[["Amoxicillin","500mg","1-1-1","After food","7 days",""],["Xylometazoline drops","2 drops each nostril","1-0-1","—","5 days",""]],
  },
  eye:{
    label:"Ophthalmology",
    complaints:["Blurred vision","Red eye","Eye pain","Watering","Itching","Foreign body sensation","Double vision","Night blindness","Floaters","Flashes","Discharge","Eyelid swelling","Sudden vision loss","Glare"],
    diag:["Refractive error","Conjunctivitis","Cataract","Glaucoma","Dry eye syndrome","Stye","Corneal ulcer","Diabetic retinopathy","Uveitis","Macular degeneration","Retinal detachment","Pterygium","Chalazion"],
    examSystems:["Visual acuity","IOP (Tonometry)","Anterior segment (Slit lamp)","Posterior segment (Fundus)","Pupils","Ocular motility","Colour vision","Visual field"],
    investigations:["Refraction test","IOP measurement","Slit lamp exam","Fundus exam","OCT","B-scan","Fluorescein angiography","Visual field test","Blood glucose","HbA1c"],
    advice:["Avoid rubbing eyes","Cold compress for swelling","Wash hands before touching eyes","No contact lens until cleared","20-20-20 rule","Wear sunglasses outdoors","Lubricate as advised","Control diabetes","Return if sudden vision loss"],
    proc:["Visual acuity tested","IOP measured","Slit lamp exam done","Fundus exam done","Foreign body removal","Eye wash done","Subconjunctival injection","Lid scrub done"],
    rx:[["Moxifloxacin eye drops","1 drop","1-1-1-1","—","7 days",""],["Lubricating eye drops","1 drop","1-1-1-1","—","Ongoing",""]],
  },
  cardio:{
    label:"Cardiology",
    complaints:["Chest pain","Palpitations","Breathlessness","Ankle swelling","Syncope","Exertional dyspnoea","Orthopnoea","Chest tightness","Irregular heartbeat","Fatigue on exertion","Cough on lying down"],
    diag:["Hypertension","Ischaemic heart disease","Heart failure","Arrhythmia","Angina","Cardiomyopathy","Valvular heart disease","STEMI","NSTEMI","Atrial fibrillation","DVT","Pericarditis"],
    examSystems:["General condition","Blood pressure (both arms)","Heart rate","JVP","Heart sounds","Lungs","Peripheral oedema","Pulse character","Apex beat"],
    investigations:["ECG","Echo (2D)","Troponin I","BNP","CK-MB","Lipid profile","CBC","CRP","D-dimer","Chest X-ray","Coronary angiography","Holter (24hr)","TMT","Urine microalbuminuria"],
    advice:["Low salt diet (<2g/day)","Quit smoking","Cardiac rehab","Daily 30 min walk","Weigh daily","Avoid strenuous exertion","Monitor BP twice daily","Avoid NSAIDs","Keep GTN spray handy","Emergency: call 108 if chest pain"],
    proc:["ECG done","IV line inserted","Cardiac monitoring","Oxygen given","Nebulisation done","Pericardiocentesis","Cardioversion done"],
    rx:[["Aspirin","75mg","1-0-0","After food","Lifelong",""],["Atorvastatin","40mg","0-0-1","After food","Lifelong",""]],
  },
  pulmo:{
    label:"Pulmonology",
    complaints:["Cough","Breathlessness","Wheezing","Chest tightness","Haemoptysis","Sputum production","Noisy breathing","Stridor","Night sweats","Weight loss","Cyanosis"],
    diag:["Asthma","COPD","Pneumonia","Tuberculosis","Bronchiectasis","Interstitial lung disease","Pleural effusion","Pulmonary embolism","Sleep apnoea","Pulmonary fibrosis","Sarcoidosis"],
    examSystems:["General condition","Respiratory rate","Chest expansion","Trachea","Percussion","Auscultation","Cyanosis","Clubbing","SpO2"],
    investigations:["Chest X-ray","HRCT chest","Spirometry","CBC","CRP","ESR","Sputum AFB","Sputum culture","D-dimer","CT pulmonary angiography","Bronchoscopy","Peak flow"],
    advice:["Quit smoking","Avoid cold air","Avoid dust & allergens","Use inhaler correctly","Breathing exercises","Increase fluids","Sleep with head elevated","Annual flu vaccine","Pulmonary rehab"],
    proc:["Spirometry done","Nebulisation done","Bronchoscopy","Pleural tap","Oxygen therapy","Sputum sample taken","Peak flow measured"],
    rx:[["Salbutamol inhaler","2 puffs","SOS","—","Ongoing",""],["Budesonide + Formoterol","1 puff","1-0-1","—","Ongoing",""]],
  },
  gastro:{
    label:"Gastroenterology",
    complaints:["Abdominal pain","Nausea","Vomiting","Diarrhoea","Constipation","Bloating","Heartburn","Jaundice","Blood in stool","Loss of appetite","Difficulty swallowing","Belching","Abdominal distension","Dark stools","Rectal bleeding"],
    diag:["GERD","Peptic ulcer","IBS","IBD","Hepatitis","Cirrhosis","Pancreatitis","Gallstones","Appendicitis","Fatty liver","Coeliac disease","Gastroenteritis","Haemorrhoids","Anal fissure"],
    examSystems:["General condition","Abdomen (inspection)","Palpation (tenderness, mass)","Percussion (ascites)","Bowel sounds","Per rectal examination","Jaundice","Liver size","Spleen size"],
    investigations:["LFT","Serum amylase","Serum lipase","HBsAg","Anti-HCV","H. pylori antibody","CBC","USG abdomen","CT abdomen","Endoscopy (OGD)","Colonoscopy","MRCP","Stool R/E","Urine bilirubin"],
    advice:["Small frequent meals","Avoid spicy food","Avoid alcohol","Avoid fatty food","High fibre diet","2-3L water daily","Avoid NSAIDs","No lying down after meals","Head elevation while sleeping","Avoid carbonated drinks"],
    proc:["Endoscopy done","Colonoscopy done","Liver biopsy","Paracentesis","Banding of varices","Polypectomy","Stool sample taken","Rectal examination","Ascitic tap"],
    rx:[["Pantoprazole","40mg","1-0-0","Before food","14 days",""],["Ondansetron","4mg","1-1-1","Before food","3 days",""]],
  },
  neuro:{
    label:"Neurology",
    complaints:["Headache","Dizziness","Seizure","Weakness","Numbness","Tingling","Memory loss","Difficulty walking","Slurred speech","Vision change","Loss of consciousness","Tremors","Facial deviation","Incontinence"],
    diag:["Migraine","Tension headache","Epilepsy","Stroke","TIA","Parkinson's disease","Multiple sclerosis","Peripheral neuropathy","Bell's palsy","Meningitis","Alzheimer's disease","Guillain-Barré","Myasthenia gravis"],
    examSystems:["GCS / consciousness","Cranial nerves","Motor system (power, tone)","Sensory system","Reflexes","Cerebellar signs","Gait","Speech","Meningeal signs","Fundus"],
    investigations:["MRI brain","CT brain","EEG","EMG/NCS","CBC","ESR","Blood glucose","Lipid profile","Serum B12","Thyroid","Carotid Doppler","CSF analysis","ANA","ANCA"],
    advice:["Take medicines at same time daily","Do not skip anti-epileptics","Avoid driving if seizure disorder","Adequate sleep","Physiotherapy referral","Avoid alcohol","Reduce stress","Speech therapy if needed","Emergency: call 108 if stroke"],
    proc:["LP (lumbar puncture)","EEG done","EMG done","IV Mannitol given","Thrombolysis","CT done","MRI arranged","Nerve block","Botox injection"],
    rx:[["Levetiracetam","500mg","1-0-1","After food","Ongoing",""],["Amitriptyline","10mg","0-0-1","After food","30 days",""]],
  },
  psych:{
    label:"Psychiatry",
    complaints:["Depressed mood","Anxiety","Sleep problems","Irritability","Hallucinations","Suicidal ideation","Memory issues","Aggression","Panic attacks","Obsessive thoughts","Compulsive behaviour","Social withdrawal","Mood swings","Low self-esteem"],
    diag:["Depression","Generalised anxiety","Bipolar disorder","Schizophrenia","OCD","PTSD","Insomnia","Dementia","Panic disorder","ADHD","Substance use disorder","Eating disorder"],
    examSystems:["Appearance & behaviour","Speech","Mood & affect","Thought content","Thought process","Perceptions (hallucinations)","Cognition (MMSE)","Insight & judgement","Suicidal ideation assessment"],
    investigations:["CBC","LFT","KFT","Thyroid","Vitamin B12","Vitamin D","Blood glucose","Urine toxicology","ECG (before antipsychotics)","Prolactin","Cortisol","Lithium level"],
    advice:["Regular sleep schedule","Mindfulness daily","Avoid alcohol & drugs","Family support important","Attend all counselling","Do not stop medicines suddenly","Exercise 30 min daily","Limit screen time","Seek help if feeling unsafe"],
    proc:["Psychotherapy session","Rating scales administered","MMSE done","Hamilton Depression Scale","PANSS assessment","CBT session","Psychiatric evaluation"],
    rx:[["Sertraline","50mg","1-0-0","After food","30 days",""],["Clonazepam","0.5mg","0-0-1","After food","14 days",""]],
  },
  physio:{
    label:"Physiotherapy",
    complaints:["Back pain","Neck pain","Knee pain","Shoulder pain","Post-surgery rehab","Weakness","Balance problems","Post-stroke","Sports injury","Frozen shoulder","Foot drop","Gait disturbance","Scoliosis","Work-related pain"],
    diag:["Lumbar spondylosis","Cervical spondylosis","Knee OA","Rotator cuff injury","Post-stroke rehab","Nerve palsy","Frozen shoulder","Sports injury","Postural kyphosis","Hemiplegia","Plantar fasciitis"],
    examSystems:["Posture","Range of motion","Muscle strength (MRC grade)","Gait","Balance","Neurological screen","Pain assessment (VAS)","Functional assessment"],
    investigations:["X-ray","MRI","Ultrasound muscle","CT scan","CBC","Vitamin D","Calcium"],
    advice:["Home exercise programme daily","Ice for acute, heat for chronic","Posture correction","Ergonomic workspace","Walk 30 min daily","Avoid prolonged sitting","Firm mattress","Stretching twice daily","Footwear with arch support"],
    proc:["TENS therapy","Therapeutic ultrasound","Hot pack","Cold pack","Manual therapy","Dry needling","Traction","Exercise prescription","Gait training","Kinesio taping"],
    rx:[["Diclofenac gel","Apply locally","1-0-1","External use","14 days","On affected area"],["Muscle relaxant","1 tab","0-0-1","After food","5 days",""]],
  },
};

const SPECIALTY_MAP = {
  "general medicine":"gen","general physician":"gen","internal medicine":"gen",
  "paediatrics":"pedia","pediatrics":"pedia","child specialist":"pedia",
  "gynaecology":"gynec","gynecology":"gynec","obstetrics":"gynec","obs & gynae":"gynec",
  "orthopaedics":"ortho","orthopedics":"ortho","ortho":"ortho",
  "dental":"dental","dentist":"dental","oral surgery":"dental",
  "dermatology":"skin","skin":"skin",
  "ent":"ent","ear nose throat":"ent","otolaryngology":"ent",
  "ophthalmology":"eye","eye":"eye",
  "cardiology":"cardio","cardiologist":"cardio",
  "pulmonology":"pulmo","respiratory":"pulmo","chest physician":"pulmo",
  "gastroenterology":"gastro","gastro":"gastro",
  "neurology":"neuro","neurologist":"neuro",
  "psychiatry":"psych","mental health":"psych",
  "physiotherapy":"physio","physiotherapist":"physio",
};

const MEDS = [
  "Amlodipine","Amoxicillin","Amoxicillin + Clavulanate","Atorvastatin","Azithromycin",
  "Betamethasone cream","Cetirizine","Ciprofloxacin","Clonazepam","Clopidogrel",
  "Diclofenac","Diclofenac gel","Dolo 650","Domperidone","Folic acid","Furosemide",
  "Ibuprofen","Insulin (glargine)","Insulin (regular)","Ketoconazole","Levocetirizine",
  "Lisinopril","Losartan","Metformin","Metformin XR","Metoprolol","Metronidazole",
  "Montelukast","Moxifloxacin eye drops","Omeprazole","Ondansetron","Pantoprazole",
  "Paracetamol","Prednisolone","Pregabalin","Rabeprazole","Ramipril","Rosuvastatin",
  "Salbutamol inhaler","Sertraline","Spironolactone","Telmisartan","Vitamin D3",
  "Calcium + D3","Warfarin","Aspirin","Levothyroxine","Betahistine","Levetiracetam",
  "Amitriptyline","Gabapentin","Fluconazole","Albendazole","Ivermectin",
];
const DOSES = ["1 tab","2 tabs","1/2 tab","5ml","10ml","2.5ml","1 cap","2 caps","1 puff","2 puffs",
  "1 drop","2 drops","Apply locally","Apply thinly","1 sachet","50mg","75mg","100mg","150mg",
  "200mg","250mg","400mg","500mg","750mg","1000mg","1g","5mg","10mg","20mg","25mg","40mg",
  "80mg","2mg","4mg","8mg","10mcg","25mcg","50mcg","100mcg","0.5mg","1mg","2.5mg","5ml syrup",
];
const FREQ = [
  {v:"1-0-0",l:"1-0-0  (Morning only)"},{v:"0-1-0",l:"0-1-0  (Afternoon only)"},
  {v:"0-0-1",l:"0-0-1  (Night only)"},{v:"1-0-1",l:"1-0-1  (Morning & Night)"},
  {v:"1-1-0",l:"1-1-0  (Morning & Afternoon)"},{v:"1-1-1",l:"1-1-1  (Three times daily)"},
  {v:"1-1-1-1",l:"1-1-1-1  (Four times daily)"},{v:"SOS",l:"SOS  (As needed)"},
  {v:"Once weekly",l:"Once weekly"},{v:"Twice weekly",l:"Twice weekly"},
  {v:"Once monthly",l:"Once monthly"},{v:"1-0-0 (alternate day)",l:"Alternate days"},
];
const FOOD = ["After food","Before food","With food","Empty stomach","—","External use"];
const DURATION = ["1 day","2 days","3 days","5 days","7 days","10 days","14 days","21 days",
  "1 month","3 months","6 months","Lifelong","Ongoing","As directed","2 weeks","4 weeks","2 months",
];
const VITALS_INIT = [
  {k:"BP",v:"",u:"mmHg"},{k:"Temp",v:"",u:"°F"},
  {k:"Pulse",v:"",u:"bpm"},{k:"SpO2",v:"",u:"%"},
  {k:"Weight",v:"",u:"kg"},{k:"RBS",v:"",u:"mg/dL"},
];

// ── STYLES ────────────────────────────────────────────────────────────────────
const c = {
  t:"#0f766e",tl:"#f0fdfa",tm:"#ccfbf1",
  s:"#0f172a",m:"#64748b",b:"#e2e8f0",sf:"#f8fafc",w:"#fff",
  red:"#dc2626",amber:"#d97706",green:"#16a34a",
};
const inp = {border:`0.5px solid ${c.b}`,borderRadius:"5px",padding:"5px 8px",fontSize:"11px",color:c.s,background:c.w,outline:"none",width:"100%",fontFamily:"inherit"};
const sel = {...inp};
const ta  = {...inp,resize:"none",height:"44px",fontFamily:"inherit"};
const chip = (on) => ({padding:"3px 8px",borderRadius:"4px",fontSize:"11px",border:`0.5px solid ${on?c.t:c.b}`,background:on?c.t:c.w,color:on?"#fff":c.m,cursor:"pointer",userSelect:"none"});
const card = {background:c.w,border:`0.5px solid ${c.b}`,borderRadius:"7px",marginBottom:"6px"};
const ch   = {padding:"6px 11px",background:c.sf,borderBottom:`0.5px solid ${c.b}`,borderRadius:"7px 7px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between"};
const ct   = {fontSize:"10px",fontWeight:700,color:c.m,textTransform:"uppercase",letterSpacing:".05em"};
const cb   = {padding:"8px 11px"};
const slbl = {fontSize:"9px",fontWeight:800,color:c.t,textTransform:"uppercase",letterSpacing:".08em",padding:"5px 0 3px",display:"flex",alignItems:"center",gap:"5px"};
const lbl  = {fontSize:"10px",fontWeight:600,color:c.m,marginBottom:"2px"};

// ── LOCAL LAB ANALYSIS (rule-based, works offline, no API key needed) ────────
function analyseLabLocal(tests) {
  return tests.map(t => {
    const result = parseFloat(t.result);
    if (isNaN(result)) return { param: t.param, status: "NORMAL", note: "Non-numeric — verify manually" };
    const range = t.range || "";
    // Strip gender prefix "M: " or "F: " and take first range segment
    const seg = range.replace(/^[MFmf]\s*:\s*/,'').split(/\s*\/\s*/)[0].trim();
    let low = null, high = null;
    const ltM = seg.match(/^[<≤]\s*([\d.]+)/);
    const gtM = seg.match(/^[>≥]\s*([\d.]+)/);
    const rngM = seg.match(/^([\d.]+)\s*[-–]\s*([\d.]+)/);
    if (ltM) high = parseFloat(ltM[1]);
    else if (gtM) low = parseFloat(gtM[1]);
    else if (rngM) { low = parseFloat(rngM[1]); high = parseFloat(rngM[2]); }
    if (high !== null && result > high) return { param: t.param, status: "HIGH", note: "Above normal range" };
    if (low !== null && result < low)   return { param: t.param, status: "LOW",  note: "Below normal range" };
    if (high !== null || low !== null)  return { param: t.param, status: "NORMAL", note: "Within normal range" };
    return { param: t.param, status: "NORMAL", note: "Check reference range manually" };
  });
}

// ── PRINT STYLES (injected once) ─────────────────────────────────────────────
const printStyles = `
@media screen { #op-print-area { display: none !important; } }
@media print {
  body > *:not(#op-print-area) { display: none !important; }
  #op-print-area {
    display: block !important;
    position: static !important;
    width: 100% !important;
    background: white !important;
    padding: 12mm 14mm !important;
    font-family: 'Segoe UI', Arial, sans-serif !important;
    font-size: 11pt !important;
    color: #000 !important;
  }
  .no-print { display: none !important; }
}
`;

export default function OPSheet({ patient, doctor, visitNo, onSave, onSendWhatsApp, onClose }) {
  // inject print styles once
  useEffect(()=>{
    const s = document.createElement("style");
    s.textContent = printStyles;
    document.head.appendChild(s);
    return ()=>document.head.removeChild(s);
  },[]);

  const deptKey = (()=>{
    const sp = (doctor?.specialty||doctor?.designation||"").toLowerCase().trim();
    for (const [k,v] of Object.entries(SPECIALTY_MAP)) if (sp.includes(k)) return v;
    return "gen";
  })();
  const dept = DEPT[deptKey];

  // State
  const [selC,    setSelC]    = useState([]);
  const [selD,    setSelD]    = useState([]);
  const [selAdv,  setSelAdv]  = useState([]);
  const [selProc, setSelProc] = useState([]);
  const [selInv,  setSelInv]  = useState([]);
  const [rxList,  setRxList]  = useState(dept.rx.map(r=>[...r]));
  const [vitals,  setVitals]  = useState(VITALS_INIT);
  const [vEdit,   setVEdit]   = useState(false);
  const [toast,   setToast]   = useState(null);
  const [rxMode,  setRxMode]  = useState("type");
  const [fuDate,  setFuDate]  = useState("");
  const [fuRemind,setFuRemind]= useState("Day before");
  const [fuNote,  setFuNote]  = useState("");
  const [compNote,setCompNote]= useState("");
  const [diagNote,setDiagNote]= useState("");
  const [advNote, setAdvNote] = useState("");
  const [procNote,setProcNote]= useState("");
  const [invNote, setInvNote] = useState("");
  const [short,   setShort]   = useState("");
  const [listening,setListening]=useState(false);
  const [sugg,    setSugg]    = useState({});

  // Lab results state
  const [labPanel, setLabPanel] = useState(false);
  const [labSearch, setLabSearch] = useState("");
  const [addedTests, setAddedTests] = useState([]);   // [{testName, param, unit, range, result, status, aiNote}]
  const recRef = useRef(null);
  const tRef   = useRef(null);

  const showToast = useCallback((msg)=>{
    setToast(msg); clearTimeout(tRef.current);
    tRef.current = setTimeout(()=>setToast(null),2500);
  },[]);

  const tog=(arr,set,v)=>set(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);

  const removeFromNote = (note, kw) => {
    const e = kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return note
      .replace(new RegExp(`^${e},\\s*`),'')
      .replace(new RegExp(`,\\s*${e}$`),'')
      .replace(new RegExp(`,\\s*${e}(?=,)`),'')
      .replace(new RegExp(`^${e}$`),'')
      .replace(new RegExp(`,\\s*${e}`),'')
      .trim();
  };
  const removeLineNote = (note, kw) => note.split('\n').filter(l=>l.trim()!==kw.trim()).join('\n').trim();

  const toggleComplaint = (x) => {
    if (selC.includes(x)) { setSelC(p=>p.filter(q=>q!==x)); setCompNote(p=>removeFromNote(p,x)); }
    else { setSelC(p=>[...p,x]); setCompNote(p=>p ? p+", "+x : x); }
  };
  const toggleInv = (x) => {
    if (selInv.includes(x)) { setSelInv(p=>p.filter(q=>q!==x)); setInvNote(p=>removeLineNote(p,x)); }
    else { setSelInv(p=>[...p,x]); setInvNote(p=>p ? p+"\n"+x : x); }
  };
  const toggleAdv = (x) => {
    if (selAdv.includes(x)) { setSelAdv(p=>p.filter(q=>q!==x)); setAdvNote(p=>removeLineNote(p,x)); }
    else { setSelAdv(p=>[...p,x]); setAdvNote(p=>p ? p+"\n"+x : x); }
  };
  const toggleProc = (x) => {
    if (selProc.includes(x)) { setSelProc(p=>p.filter(q=>q!==x)); setProcNote(p=>removeLineNote(p,x)); }
    else { setSelProc(p=>[...p,x]); setProcNote(p=>p ? p+"\n"+x : x); }
  };
  const addDiag = (val) => {
    if (!val || selD.includes(val)) return;
    setSelD(p=>[...p,val]);
    setDiagNote(p=>p ? p+"\n"+val : val);
  };

  // Rx
  const addRx  = ()=>setRxList(p=>[...p,["","","1-0-1","After food","5 days",""]]);
  const delRx  = (i)=>setRxList(p=>p.filter((_,j)=>j!==i));
  const updRx  = (i,col,val)=>setRxList(p=>p.map((r,j)=>j===i?r.map((c2,k)=>k===col?val:c2):r));
  const repRx  = ()=>{ setRxList(dept.rx.map(r=>[...r])); showToast("Last Rx loaded ✓"); };
  const medSug = (i,val)=>{
    updRx(i,0,val);
    if (val.length<2){setSugg(s=>({...s,[i]:null}));return;}
    const m=MEDS.filter(x=>x.toLowerCase().includes(val.toLowerCase())).slice(0,6);
    setSugg(s=>({...s,[i]:m.length?m:null}));
  };
  const pickMed=(i,med)=>{ updRx(i,0,med); setSugg(s=>({...s,[i]:null})); };
  const setFuQ=(d)=>{ if(!d)return; const dt=new Date(); dt.setDate(dt.getDate()+parseInt(d)); setFuDate(dt.toISOString().split("T")[0]); };

  // Lab panel
  const filteredTests = LAB_TESTS.filter(t=>
    !labSearch || t.name.toLowerCase().includes(labSearch.toLowerCase()) || t.cat.toLowerCase().includes(labSearch.toLowerCase())
  );
  const addTestParam=(testName,param,unit,range)=>{
    if (addedTests.find(x=>x.testName===testName&&x.param===param)) return;
    setAddedTests(p=>[...p,{testName,param,unit,range,result:"",status:null,aiNote:""}]);
  };
  const removeTestParam=(idx)=>setAddedTests(p=>p.filter((_,i)=>i!==idx));
  const updateResult=(idx,val)=>setAddedTests(p=>p.map((t,i)=>i===idx?{...t,result:val,status:null,aiNote:""}:t));

  const runAI = ()=>{
    const toAnalyse = addedTests.filter(t=>t.result.trim());
    if (!toAnalyse.length){ showToast("Enter at least one result first"); return; }
    const results = analyseLabLocal(toAnalyse);
    setAddedTests(p=>p.map(t=>{
      const found = results.find(r=>r.param===t.param);
      if (found) return {...t,status:found.status,aiNote:found.note};
      return t;
    }));
    showToast("✓ Analysis complete");
  };

  // Shorthand
  const SH = {
    "/htn":"Hypertension — well controlled. Continue current medications. Low salt diet. Monitor BP twice daily.",
    "/dm":"T2 Diabetes mellitus — follow-up. Continue medications. Low sugar diet. HbA1c after 3 months.",
    "/fever":"Viral fever — symptomatic. Hydration. Paracetamol. Return if not improving in 48 hours.",
    "/uri":"Upper respiratory tract infection. Steam inhalation. Hydration. Avoid cold drinks.",
    "/bp":"BP review — measured today. Medications adjusted. Low salt diet. Monitor twice daily.",
    "/review":"Review visit — improving. Continue current medications. Follow up as scheduled.",
  };
  const expandSH=(val)=>{
    setShort(val);
    if(SH[val.trim()]){ setCompNote(p=>p+(p?"\n":"")+SH[val.trim()]); setShort(""); showToast("Expanded ✓"); }
  };

  // Voice
  const toggleVoice=()=>{
    if (!("webkitSpeechRecognition" in window||"SpeechRecognition" in window)){showToast("Voice not supported");return;}
    if (listening){recRef.current?.stop();setListening(false);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const r=new SR();r.lang="en-IN";r.continuous=true;r.interimResults=false;
    r.onresult=(e)=>setCompNote(p=>p+(p?" ":"")+Array.from(e.results).map(x=>x[0].transcript).join(" "));
    r.onerror=()=>{setListening(false);showToast("Voice error");};
    r.onend=()=>setListening(false);
    r.start();recRef.current=r;setListening(true);showToast("🎤 Listening...");
  };

  const updVital=(i,v)=>setVitals(p=>p.map((vt,j)=>j===i?{...vt,v}:vt));

  const handleSaveAndSend = async ()=>{
    const payload = {complaints:selC,compNote,labResults:addedTests,investigations:selInv,invNote,diagnoses:selD,diagNote,rx:rxList,advice:selAdv,advNote,procedures:selProc,procNote,vitals,followUpDate:fuDate,followUpNote:fuNote,followUpReminder:fuRemind};
    try {
      await onSave?.(payload);
      await onSendWhatsApp?.(payload);
      const phone = patient?.phone?.replace(/\D/g,"");
      const msg = buildWAMessage();
      const url = phone ? `https://wa.me/91${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
      window.open(url,"_blank");
      showToast("✓ Saved & prescription sent!");
    } catch(e){ showToast("Error: "+(e?.message||"Save failed")); }
  };

  const statusColor=(s)=>s==="HIGH"?"#dc2626":s==="LOW"?"#2563eb":s==="NORMAL"?"#16a34a":"#94a3b8";
  const statusBg=(s)=>s==="HIGH"?"#fef2f2":s==="LOW"?"#eff6ff":s==="NORMAL"?"#f0fdf4":"#f8fafc";

  // ── PRINT AREA data ──────────────────────────────────────────────────────────
  const PrintArea = () => (
    <div id="op-print-area" style={{fontFamily:"'Segoe UI',Arial,sans-serif",fontSize:"11pt",color:"#000",background:"#fff",padding:"12mm 14mm"}}>
      {/* Header */}
      <div style={{borderBottom:"2px solid #0f766e",paddingBottom:"8px",marginBottom:"10px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:"16pt",fontWeight:700,color:"#0f766e"}}>{doctor?.clinicName||"DocNudge Clinic"}</div>
          <div style={{fontSize:"10pt",color:"#555"}}>{doctor?.name||"Doctor"} · {dept.label}</div>
          <div style={{fontSize:"9pt",color:"#888"}}>{doctor?.address||""}</div>
        </div>
        <div style={{textAlign:"right",fontSize:"9pt",color:"#555"}}>
          <div>Date: {new Date().toLocaleDateString("en-IN")}</div>
          <div>Visit #{visitNo||1}</div>
          {patient?.mrn&&<div>MRN: {patient.mrn}</div>}
        </div>
      </div>
      {/* Patient */}
      <div style={{background:"#f0fdfa",border:"1px solid #ccfbf1",borderRadius:"5px",padding:"7px 10px",marginBottom:"10px",display:"flex",gap:"20px",fontSize:"10pt"}}>
        <span><b>Patient:</b> {patient?.name||"—"}</span>
        <span><b>Age/Sex:</b> {patient?.age||"—"} / {patient?.gender||"—"}</span>
        {patient?.phone&&<span><b>Phone:</b> {patient.phone}</span>}
        {patient?.conditions?.length>0&&<span><b>Alerts:</b> {patient.conditions.join(", ")}</span>}
      </div>
      {/* Complaints */}
      {compNote&&<div style={{marginBottom:"8px"}}><b style={{color:"#0f766e"}}>Chief Complaints:</b><div style={{marginTop:"3px",whiteSpace:"pre-wrap"}}>{compNote}</div></div>}
      {/* Vitals */}
      {vitals.some(v=>v.v)&&(
        <div style={{marginBottom:"8px"}}>
          <b style={{color:"#0f766e"}}>Vitals:</b>
          <div style={{display:"flex",gap:"15px",marginTop:"3px",flexWrap:"wrap"}}>
            {vitals.filter(v=>v.v).map(v=><span key={v.k}><b>{v.k}:</b> {v.v} {v.u}</span>)}
          </div>
        </div>
      )}
      {/* Lab Results */}
      {addedTests.filter(t=>t.result).length>0&&(
        <div style={{marginBottom:"8px"}}>
          <b style={{color:"#0f766e"}}>Lab Results:</b>
          <table style={{width:"100%",borderCollapse:"collapse",marginTop:"4px",fontSize:"10pt"}}>
            <thead><tr style={{background:"#f0fdfa"}}>
              <th style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"left"}}>Test</th>
              <th style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"left"}}>Parameter</th>
              <th style={{border:"1px solid #ccc",padding:"4px 6px"}}>Result</th>
              <th style={{border:"1px solid #ccc",padding:"4px 6px"}}>Unit</th>
              <th style={{border:"1px solid #ccc",padding:"4px 6px"}}>Status</th>
              <th style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"left"}}>Range / Note</th>
            </tr></thead>
            <tbody>
              {addedTests.filter(t=>t.result).map((t,i)=>(
                <tr key={i} style={{background:i%2===0?"#fff":"#f8fafc"}}>
                  <td style={{border:"1px solid #ccc",padding:"4px 6px"}}>{t.testName}</td>
                  <td style={{border:"1px solid #ccc",padding:"4px 6px"}}>{t.param}</td>
                  <td style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"center",fontWeight:700,color:statusColor(t.status)}}>{t.result}</td>
                  <td style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"center",color:"#555"}}>{t.unit}</td>
                  <td style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"center",fontWeight:700,color:statusColor(t.status)}}>{t.status||"—"}</td>
                  <td style={{border:"1px solid #ccc",padding:"4px 6px",fontSize:"9pt",color:"#555"}}>{t.aiNote||t.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Investigations ordered */}
      {invNote&&<div style={{marginBottom:"8px"}}><b style={{color:"#0f766e"}}>Investigations Advised:</b><div style={{marginTop:"3px",whiteSpace:"pre-wrap"}}>{invNote}</div></div>}
      {/* Diagnosis */}
      {diagNote&&<div style={{marginBottom:"8px"}}><b style={{color:"#0f766e"}}>Diagnosis:</b><div style={{marginTop:"3px",whiteSpace:"pre-wrap"}}>{diagNote}</div></div>}
      {/* Rx Table */}
      {rxList.some(r=>r[0])&&(
        <div style={{marginBottom:"8px"}}>
          <b style={{color:"#0f766e"}}>Prescription (Rx):</b>
          <table style={{width:"100%",borderCollapse:"collapse",marginTop:"4px",fontSize:"10pt"}}>
            <thead><tr style={{background:"#f0fdfa"}}>
              <th style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"left"}}>#</th>
              <th style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"left"}}>Medicine</th>
              <th style={{border:"1px solid #ccc",padding:"4px 6px"}}>Dose</th>
              <th style={{border:"1px solid #ccc",padding:"4px 6px"}}>Frequency</th>
              <th style={{border:"1px solid #ccc",padding:"4px 6px"}}>Food</th>
              <th style={{border:"1px solid #ccc",padding:"4px 6px"}}>Duration</th>
              <th style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"left"}}>Notes</th>
            </tr></thead>
            <tbody>
              {rxList.filter(r=>r[0]).map((r,i)=>(
                <tr key={i}>
                  <td style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"center"}}>{i+1}</td>
                  <td style={{border:"1px solid #ccc",padding:"4px 6px",fontWeight:600}}>{r[0]}</td>
                  <td style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"center"}}>{r[1]}</td>
                  <td style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"center",fontWeight:700}}>{r[2]}</td>
                  <td style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"center",fontSize:"9pt"}}>{r[3]}</td>
                  <td style={{border:"1px solid #ccc",padding:"4px 6px",textAlign:"center"}}>{r[4]}</td>
                  <td style={{border:"1px solid #ccc",padding:"4px 6px",fontSize:"9pt",color:"#555"}}>{r[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Advice */}
      {advNote&&<div style={{marginBottom:"8px"}}><b style={{color:"#0f766e"}}>Advice:</b><div style={{marginTop:"3px",whiteSpace:"pre-wrap"}}>{advNote}</div></div>}
      {/* Procedure */}
      {procNote&&<div style={{marginBottom:"8px"}}><b style={{color:"#0f766e"}}>Procedure Done:</b><div style={{marginTop:"3px",whiteSpace:"pre-wrap"}}>{procNote}</div></div>}
      {/* Follow up */}
      {fuDate&&<div style={{marginBottom:"8px"}}><b style={{color:"#0f766e"}}>Follow-up:</b> {fuDate}{fuNote&&` — ${fuNote}`}</div>}
      {/* Footer */}
      <div style={{borderTop:"1px solid #ccc",marginTop:"14px",paddingTop:"8px",fontSize:"9pt",color:"#888",display:"flex",justifyContent:"space-between"}}>
        <span>Generated by DocNudge • {new Date().toLocaleDateString("en-IN")}</span>
        <span>Signature: _______________</span>
      </div>
    </div>
  );

  // ── BUILD WHATSAPP MESSAGE + PDF LINK ────────────────────────────────────────
  const buildWAMessage = () => {
    const lines = [
      `*DocNudge Prescription*`,
      `👤 *Patient:* ${patient?.name||"—"} | ${patient?.age||"—"}y / ${patient?.gender||"—"}`,
      `👨‍⚕️ *Doctor:* ${doctor?.name||"—"} | ${dept.label}`,
      `📅 *Date:* ${new Date().toLocaleDateString("en-IN")}`,
      ``,
    ];
    if (diagNote) lines.push(`*Diagnosis:* ${diagNote.replace(/\n/g,", ")}`,"");
    if (rxList.filter(r=>r[0]).length) {
      lines.push("*💊 Prescription:*");
      rxList.filter(r=>r[0]).forEach((r,i)=>{
        lines.push(`${i+1}. ${r[0]} ${r[1]} — ${r[2]} — ${r[3]} — ${r[4]}${r[5]?" ("+r[5]+")":""}`);
      });
      lines.push("");
    }
    if (advNote) lines.push(`*📋 Advice:*`,advNote,"");
    if (fuDate) lines.push(`*📅 Follow-up:* ${fuDate}${fuNote?" — "+fuNote:""}`,``);
    lines.push(
      `---`,
      `📄 *View your full prescription PDF:*`,
      `${window.location.origin}/patient/${patient?.id||""}`,
      ``,
      `_This is a computer-generated prescription. For queries, contact the clinic._`
    );
    return encodeURIComponent(lines.join("\n"));
  };

  const handlePrint = () => { window.print(); };

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <>
    <div style={{display:"grid",gridTemplateColumns:"210px 1fr",height:"100vh",background:c.w,fontFamily:"'Segoe UI',system-ui,sans-serif",fontSize:"12px",color:c.s,position:"relative",overflow:"hidden"}} className="no-print">

      {/* ── SIDEBAR ── */}
      <div style={{background:"#0f172a",display:"flex",flexDirection:"column",overflow:"hidden"}} className="no-print">
        {/* Patient */}
        <div style={{padding:"12px 12px 10px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"9px",marginBottom:"8px"}}>
            <div style={{width:"34px",height:"34px",borderRadius:"50%",background:c.t,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:700,color:"#fff",flexShrink:0}}>
              {(patient?.name||"P").slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{fontSize:"13px",fontWeight:600,color:"#f1f5f9",lineHeight:"1.3"}}>{patient?.name||"Patient Name"}</div>
              <div style={{fontSize:"10px",color:"#64748b",marginTop:"1px"}}>
                {[patient?.gender,patient?.age&&patient.age+"y",patient?.mrn&&"MRN-"+patient.mrn].filter(Boolean).join(" · ")||""}
              </div>
            </div>
          </div>
          <div style={{fontSize:"10px",color:"#94a3b8",marginBottom:"2px"}}>{doctor?.name||"Doctor"}</div>
          <div style={{fontSize:"11px",color:c.t,fontWeight:700}}>{dept.label}</div>
          {visitNo&&<div style={{fontSize:"10px",color:"#475569",marginTop:"3px"}}>Visit #{visitNo}</div>}
        </div>

        {/* Alerts */}
        <div style={{padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:"9px",textTransform:"uppercase",letterSpacing:".07em",color:"#475569",fontWeight:700,marginBottom:"5px"}}>Clinical Alerts</div>
          {patient?.conditions?.map(c2=>(
            <span key={c2} style={{display:"inline-flex",alignItems:"center",padding:"2px 6px",borderRadius:"4px",fontSize:"10px",fontWeight:600,background:"rgba(220,38,38,.2)",color:"#fca5a5",margin:"2px 2px 0 0"}}>{c2}</span>
          ))}
          {patient?.allergies?.map(a=>(
            <span key={a} style={{display:"inline-flex",alignItems:"center",padding:"2px 6px",borderRadius:"4px",fontSize:"10px",fontWeight:600,background:"rgba(217,119,6,.2)",color:"#fcd34d",margin:"2px 2px 0 0"}}>⚠ {a}</span>
          ))}
          {!patient?.conditions?.length&&!patient?.allergies?.length&&
            <span style={{fontSize:"10px",color:"#475569"}}>No alerts on record</span>}
        </div>

        {/* Vitals */}
        <div style={{padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:"9px",textTransform:"uppercase",letterSpacing:".07em",color:"#475569",fontWeight:700,marginBottom:"5px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            Vitals
            <span style={{fontSize:"9px",color:c.t,cursor:"pointer",fontWeight:600}} onClick={()=>setVEdit(v=>!v)}>{vEdit?"Done":"Edit"}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px"}}>
            {vitals.map((v,i)=>(
              <div key={v.k} style={{background:"rgba(255,255,255,0.05)",borderRadius:"5px",padding:"5px 7px",border:`1px solid ${vEdit?"#0f766e":"rgba(255,255,255,0.07)"}`}}>
                <div style={{fontSize:"13px",fontWeight:600,color:"#f1f5f9",display:"flex",alignItems:"center",gap:"3px"}}>
                  {vEdit
                    ? <input defaultValue={v.v} onChange={e=>updVital(i,e.target.value)} placeholder="—"
                        style={{background:"transparent",border:"none",outline:"none",color:"#f1f5f9",fontSize:"12px",fontWeight:600,width:v.k==="BP"?"52px":"38px",fontFamily:"inherit"}}/>
                    : <span>{v.v||"—"}</span>}
                  <span style={{fontSize:"9px",color:"#64748b"}}>{v.u}</span>
                </div>
                <div style={{fontSize:"9px",color:"#64748b",marginTop:"1px"}}>{v.k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Visit history */}
        <div style={{flex:1,overflowY:"auto",padding:"8px 12px"}}>
          <div style={{fontSize:"9px",textTransform:"uppercase",letterSpacing:".07em",color:"#475569",fontWeight:700,marginBottom:"6px"}}>Visit History</div>
          {(patient?.visits||[]).map((v,i)=>(
            <div key={i} style={{padding:"6px 8px",borderRadius:"5px",background:"rgba(255,255,255,0.04)",marginBottom:"4px",borderLeft:"2px solid #0f766e",cursor:"pointer"}}
              onClick={()=>{setRxList((v.rx||dept.rx).map(r=>[...r]));showToast("Last Rx loaded ✓");}}>
              <div style={{fontSize:"9px",color:"#475569"}}>{v.date}</div>
              <div style={{fontSize:"11px",color:"#e2e8f0",fontWeight:500,marginTop:"1px"}}>{v.diagnosis}</div>
              <div style={{fontSize:"10px",color:"#64748b",marginTop:"2px",lineHeight:"1.4"}}>{v.rx_summary}</div>
            </div>
          ))}
          {(!patient?.visits||!patient.visits.length)&&(
            <div style={{padding:"6px 8px",borderRadius:"5px",background:"rgba(255,255,255,0.04)",borderLeft:"2px solid #0f766e",cursor:"pointer"}} onClick={repRx}>
              <div style={{fontSize:"9px",color:"#475569"}}>Previous visit</div>
              <div style={{fontSize:"11px",color:"#e2e8f0",fontWeight:500,marginTop:"1px"}}>Click to load last Rx</div>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{display:"flex",flexDirection:"column",overflow:"hidden",background:c.sf}}>
        {/* Top bar */}
        <div style={{padding:"8px 12px",borderBottom:`0.5px solid ${c.b}`,background:c.w,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}} className="no-print">
          <div style={{fontSize:"12px",fontWeight:700,color:c.s}}>OP Sheet — {patient?.name||"Patient"}</div>
          <button style={{padding:"4px 10px",borderRadius:"5px",border:`0.5px solid ${c.b}`,background:c.w,color:c.m,fontSize:"11px",cursor:"pointer"}} onClick={onClose}>✕ Close</button>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:"0"}}>

          {/* S */}
          <div style={slbl}>S <span style={{fontSize:"9px",fontWeight:500,color:c.m}}>Subjective — Complaint</span></div>
          <div style={card}>
            <div style={ch}>
              <span style={ct}>Chief Complaint</span>
              <div style={{display:"flex",gap:"5px",alignItems:"center"}}>
                <input style={{...inp,width:"70px"}} placeholder="Since..."/>
                <select style={{...sel,width:"85px"}}><option>Sudden</option><option>Gradual</option><option>Chronic</option><option>Recurrent</option></select>
              </div>
            </div>
            <div style={cb}>
              <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginBottom:"7px"}}>
                {dept.complaints.map(x=>(
                  <span key={x} style={chip(selC.includes(x))} onClick={()=>toggleComplaint(x)}>{x}</span>
                ))}
              </div>
              <div style={{display:"flex",gap:"4px",marginBottom:"5px"}}>
                <span style={{fontSize:"9px",color:c.m,fontWeight:600,alignSelf:"center"}}>Notes:</span>
                {[["type","✏ Type"],["voice","🎤 Voice"],["short","⚡ Shorthand"]].map(([m,l])=>(
                  <button key={m} style={{padding:"2px 8px",borderRadius:"4px",border:`0.5px solid ${rxMode===m?c.t:c.b}`,background:rxMode===m?c.t:c.w,color:rxMode===m?"#fff":c.m,fontSize:"10px",fontWeight:600,cursor:"pointer"}} onClick={()=>setRxMode(m)}>{l}</button>
                ))}
              </div>
              {rxMode==="type"&&<textarea style={ta} value={compNote} onChange={e=>setCompNote(e.target.value)} placeholder="Complaint notes (keywords above auto-add here)..."/>}
              {rxMode==="voice"&&(
                <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                  <button style={{flex:1,padding:"6px",borderRadius:"5px",border:"none",background:listening?"#ef4444":"#22c55e",color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer"}} onClick={toggleVoice}>
                    {listening?"⏹ Stop listening":"🎤 Start voice dictation"}
                  </button>
                </div>
              )}
              {rxMode==="short"&&(
                <div>
                  <input style={inp} value={short} onChange={e=>expandSH(e.target.value)} placeholder="Type /htn /dm /fever /uri /bp /review" onKeyDown={e=>e.key==="Enter"&&expandSH(short)}/>
                  <div style={{fontSize:"9px",color:c.m,marginTop:"3px"}}>Available: /htn · /dm · /fever · /uri · /bp · /review</div>
                  {compNote&&<textarea style={{...ta,marginTop:"4px"}} value={compNote} onChange={e=>setCompNote(e.target.value)}/>}
                </div>
              )}
            </div>
          </div>

          {/* O */}
          <div style={{...slbl,marginTop:"4px"}}>O <span style={{fontSize:"9px",fontWeight:500,color:c.m}}>Objective — Examination & Investigations</span></div>

          {/* Lab Results — NEW AI-powered panel */}
          <div style={card}>
            <div style={ch}>
              <span style={ct}>Lab Results (Previous / Recent)</span>
              <div style={{display:"flex",gap:"4px"}}>
                {addedTests.filter(t=>t.result).length>0&&(
                  <button style={{padding:"3px 8px",borderRadius:"4px",border:"none",background:c.t,color:"#fff",fontSize:"10px",fontWeight:600,cursor:"pointer"}} onClick={runAI}>
                    📊 Analyse
                  </button>
                )}
                <button style={{padding:"3px 8px",borderRadius:"4px",border:`0.5px solid ${c.t}`,background:c.tl,color:c.t,fontSize:"10px",fontWeight:600,cursor:"pointer"}} onClick={()=>setLabPanel(v=>!v)}>
                  {labPanel?"▲ Close":"＋ Add Tests"}
                </button>
              </div>
            </div>
            <div style={cb}>
              {/* Search & add panel */}
              {labPanel&&(
                <div style={{background:c.sf,border:`0.5px solid ${c.b}`,borderRadius:"6px",padding:"8px",marginBottom:"8px"}}>
                  <input style={{...inp,marginBottom:"6px"}} placeholder="Search test name (e.g. CBC, HbA1c, TSH)..." value={labSearch} onChange={e=>setLabSearch(e.target.value)} autoFocus/>
                  <div style={{maxHeight:"200px",overflowY:"auto",display:"flex",flexDirection:"column",gap:"4px"}}>
                    {filteredTests.slice(0,50).map(t=>(
                      <div key={t.name} style={{background:c.w,border:`0.5px solid ${c.b}`,borderRadius:"5px",padding:"5px 8px"}}>
                        <div style={{fontSize:"10px",fontWeight:700,color:c.s,marginBottom:"3px",display:"flex",justifyContent:"space-between"}}>
                          <span>{t.name}</span>
                          <span style={{fontSize:"9px",color:c.m,fontWeight:400}}>{t.cat}</span>
                        </div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"2px"}}>
                          {t.params.map(p=>{
                            const already = addedTests.find(x=>x.testName===t.name&&x.param===p.p);
                            return (
                              <span key={p.p} style={{...chip(!!already),fontSize:"10px",padding:"2px 6px"}}
                                onClick={()=>!already&&addTestParam(t.name,p.p,p.unit,p.range)}>
                                {p.p}{already?" ✓":""}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {filteredTests.length===0&&<div style={{fontSize:"11px",color:c.m,padding:"8px"}}>No tests found. Try a different keyword.</div>}
                  </div>
                </div>
              )}

              {/* Added tests table */}
              {addedTests.length>0?(
                <div>
                  {/* Group by test */}
                  {[...new Set(addedTests.map(t=>t.testName))].map(testName=>(
                    <div key={testName} style={{marginBottom:"8px"}}>
                      <div style={{fontSize:"10px",fontWeight:700,color:c.t,marginBottom:"3px"}}>{testName}</div>
                      {addedTests.filter(t=>t.testName===testName).map((t,globalIdx)=>{
                        const idx = addedTests.findIndex(x=>x.testName===t.testName&&x.param===t.param);
                        return (
                          <div key={t.param} style={{display:"grid",gridTemplateColumns:"1.5fr 90px 55px 1.5fr 20px",gap:"4px",alignItems:"center",marginBottom:"3px"}}>
                            <div style={{fontSize:"10px",color:c.s,fontWeight:500}}>{t.param}</div>
                            <input style={{...inp,padding:"3px 6px"}} placeholder="Result" value={t.result} onChange={e=>updateResult(idx,e.target.value)}/>
                            <div style={{fontSize:"10px",color:c.m,textAlign:"center"}}>{t.unit||"—"}</div>
                            <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                              {t.status&&(
                                <span style={{padding:"2px 6px",borderRadius:"4px",fontSize:"10px",fontWeight:700,background:statusBg(t.status),color:statusColor(t.status),flexShrink:0}}>
                                  {t.status}
                                </span>
                              )}
                              {t.aiNote&&<span style={{fontSize:"9px",color:c.m,lineHeight:"1.3"}}>{t.aiNote}</span>}
                              {!t.aiNote&&<span style={{fontSize:"9px",color:"#cbd5e1",lineHeight:"1.3"}}>{t.range}</span>}
                            </div>
                            <button style={{width:"18px",height:"18px",borderRadius:"3px",border:"0.5px solid #fca5a5",background:"#fef2f2",color:"#ef4444",fontSize:"10px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>removeTestParam(idx)}>✕</button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  {addedTests.some(t=>t.result&&!t.status)&&(
                    <div style={{fontSize:"10px",color:c.m,marginTop:"4px"}}>💡 Results entered — click <b>📊 Analyse</b> to get HIGH/LOW/NORMAL status</div>
                  )}
                </div>
              ):(
                <div style={{fontSize:"11px",color:c.m,padding:"4px 0"}}>No lab tests added. Click <b>＋ Add Tests</b> to select from 100+ tests.</div>
              )}
            </div>
          </div>

          {/* Investigations Advised */}
          <div style={card}>
            <div style={ch}><span style={ct}>Investigations Advised</span></div>
            <div style={cb}>
              <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginBottom:"6px"}}>
                {dept.investigations.map(x=>(
                  <span key={x} style={chip(selInv.includes(x))} onClick={()=>toggleInv(x)}>{x}</span>
                ))}
              </div>
              <div style={{fontSize:"9px",color:c.m,marginBottom:"3px"}}>Additional notes (keywords auto-add below):</div>
              <textarea style={{...ta,height:"52px"}} value={invNote} onChange={e=>setInvNote(e.target.value)} placeholder="Selected investigations appear here. Edit or add custom tests..."/>
            </div>
          </div>

          {/* A */}
          <div style={{...slbl,marginTop:"4px"}}>A <span style={{fontSize:"9px",fontWeight:500,color:c.m}}>Assessment — Diagnosis</span></div>
          <div style={card}>
            <div style={ch}><span style={ct}>Diagnosis</span></div>
            <div style={cb}>
              <div style={{marginBottom:"6px"}}>
                <div style={lbl}>Select diagnosis</div>
                <select style={sel} onChange={e=>{addDiag(e.target.value);e.target.value="";}}>
                  <option value="">— Select —</option>
                  {dept.diag.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginBottom:"5px"}}>
                {selD.map(d=>(
                  <span key={d} style={{...chip(true),display:"flex",alignItems:"center",gap:"4px"}}>
                    {d}<span style={{cursor:"pointer",fontSize:"10px",opacity:.7}} onClick={()=>{ setSelD(p=>p.filter(x=>x!==d)); setDiagNote(p=>removeLineNote(p,d)); }}>✕</span>
                  </span>
                ))}
              </div>
              <div style={{fontSize:"9px",color:c.m,marginBottom:"3px"}}>Diagnosis notes (selection auto-adds here):</div>
              <textarea style={ta} value={diagNote} onChange={e=>setDiagNote(e.target.value)} placeholder="Provisional / differential / ICD notes..."/>
            </div>
          </div>

          {/* P */}
          <div style={{...slbl,marginTop:"4px"}}>P <span style={{fontSize:"9px",fontWeight:500,color:c.m}}>Plan — Prescription, Advice & Follow-up</span></div>

          {/* Rx */}
          <div style={card}>
            <div style={ch}>
              <span style={ct}>Prescription (Rx)</span>
              <div style={{display:"flex",gap:"4px"}}>
                <button style={{padding:"3px 8px",borderRadius:"4px",border:`0.5px solid ${c.b}`,background:c.sf,color:c.m,fontSize:"10px",fontWeight:600,cursor:"pointer"}} onClick={repRx}>↺ Repeat last</button>
                <button style={{padding:"3px 8px",borderRadius:"4px",border:`0.5px solid ${c.t}`,background:c.tl,color:c.t,fontSize:"10px",fontWeight:600,cursor:"pointer"}} onClick={addRx}>+ Add</button>
              </div>
            </div>
            <div style={cb}>
              <div style={{display:"grid",gridTemplateColumns:"2.4fr 80px 100px 90px 80px 1fr 18px",gap:"4px",marginBottom:"3px",padding:"0 4px"}}>
                {["Medicine","Dose","Frequency","Food","Duration","Notes / Composition",""].map(h=>(
                  <div key={h} style={{fontSize:"9px",fontWeight:700,color:c.m,textTransform:"uppercase",letterSpacing:".04em"}}>{h}</div>
                ))}
              </div>
              {rxList.map((r,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"2.4fr 80px 100px 90px 80px 1fr 18px",gap:"4px",marginBottom:"4px",alignItems:"start"}}>
                  <div style={{position:"relative"}}>
                    <input style={{...inp,fontWeight:500}} value={r[0]} placeholder="Medicine name" onChange={e=>medSug(i,e.target.value)}/>
                    {sugg[i]&&(
                      <div style={{position:"absolute",top:"100%",left:0,right:0,background:c.w,border:`0.5px solid ${c.b}`,borderRadius:"5px",zIndex:30,maxHeight:"90px",overflowY:"auto",boxShadow:"0 4px 12px rgba(0,0,0,.08)"}}>
                        {sugg[i].map(m=>(
                          <div key={m} style={{padding:"5px 9px",fontSize:"11px",cursor:"pointer"}}
                            onMouseOver={e=>e.currentTarget.style.background=c.tl}
                            onMouseOut={e=>e.currentTarget.style.background=""}
                            onClick={()=>pickMed(i,m)}>{m}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <select style={sel} value={r[1]} onChange={e=>updRx(i,1,e.target.value)}>
                    <option value="">—</option>
                    {DOSES.map(d=><option key={d}>{d}</option>)}
                  </select>
                  <select style={sel} value={r[2]} onChange={e=>updRx(i,2,e.target.value)}>
                    <option value="">—</option>
                    {FREQ.map(f=><option key={f.v} value={f.v}>{f.l}</option>)}
                  </select>
                  <select style={sel} value={r[3]} onChange={e=>updRx(i,3,e.target.value)}>
                    {FOOD.map(f=><option key={f}>{f}</option>)}
                  </select>
                  <select style={sel} value={r[4]} onChange={e=>updRx(i,4,e.target.value)}>
                    <option value="">—</option>
                    {DURATION.map(d=><option key={d}>{d}</option>)}
                  </select>
                  <input style={inp} value={r[5]||""} placeholder="Composition / note..." onChange={e=>updRx(i,5,e.target.value)}/>
                  <button style={{width:"18px",height:"18px",borderRadius:"4px",border:`0.5px solid #fca5a5`,background:"#fef2f2",color:"#ef4444",fontSize:"10px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"4px"}} onClick={()=>delRx(i)}>✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Advice + Procedure */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"6px"}}>
            <div style={{...card,marginBottom:0}}>
              <div style={ch}><span style={ct}>Advice to Patient</span></div>
              <div style={cb}>
                <div style={{marginBottom:"6px"}}>
                  <select style={sel} onChange={e=>{if(e.target.value)toggleAdv(e.target.value);e.target.value="";}}>
                    <option value="">— Add advice —</option>
                    {dept.advice.map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginBottom:"5px"}}>
                  {selAdv.map(a=>(
                    <span key={a} style={{...chip(true),display:"flex",alignItems:"center",gap:"4px",fontSize:"10px"}}>
                      {a}<span style={{cursor:"pointer",opacity:.7}} onClick={()=>{ setSelAdv(p=>p.filter(x=>x!==a)); setAdvNote(p=>removeLineNote(p,a)); }}>✕</span>
                    </span>
                  ))}
                </div>
                <div style={{fontSize:"9px",color:c.m,marginBottom:"3px"}}>Additional notes (keywords auto-add here):</div>
                <textarea style={{...ta,height:"52px"}} value={advNote} onChange={e=>setAdvNote(e.target.value)} placeholder="Advice notes..."/>
              </div>
            </div>
            <div style={{...card,marginBottom:0}}>
              <div style={ch}><span style={ct}>Procedure Done</span></div>
              <div style={cb}>
                <div style={{marginBottom:"6px"}}>
                  <select style={sel} onChange={e=>{if(e.target.value)toggleProc(e.target.value);e.target.value="";}}>
                    <option value="">— Select procedure —</option>
                    {dept.proc.map(p2=><option key={p2}>{p2}</option>)}
                  </select>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginBottom:"5px"}}>
                  {selProc.map(p2=>(
                    <span key={p2} style={{...chip(true),display:"flex",alignItems:"center",gap:"4px",fontSize:"10px"}}>
                      {p2}<span style={{cursor:"pointer",opacity:.7}} onClick={()=>{ setSelProc(p=>p.filter(x=>x!==p2)); setProcNote(p=>removeLineNote(p,p2)); }}>✕</span>
                    </span>
                  ))}
                </div>
                <div style={{fontSize:"9px",color:c.m,marginBottom:"3px"}}>Procedure notes (keywords auto-add here):</div>
                <textarea style={{...ta,height:"52px"}} value={procNote} onChange={e=>setProcNote(e.target.value)} placeholder="Procedure notes..."/>
              </div>
            </div>
          </div>

          {/* Follow-up */}
          <div style={card}>
            <div style={ch}><span style={ct}>Follow-up & WhatsApp Reminder</span></div>
            <div style={cb}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"7px"}}>
                <div>
                  <div style={lbl}>Follow-up date</div>
                  <input type="date" style={inp} value={fuDate} onChange={e=>setFuDate(e.target.value)}/>
                </div>
                <div>
                  <div style={lbl}>Quick set</div>
                  <select style={sel} onChange={e=>setFuQ(e.target.value)}>
                    <option value="">Pick...</option>
                    {[["3","3 days"],["7","1 week"],["14","2 weeks"],["30","1 month"],["90","3 months"]].map(([v,l])=>(
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={lbl}>WA Reminder</div>
                  <select style={sel} value={fuRemind} onChange={e=>setFuRemind(e.target.value)}>
                    <option>Day before</option><option>Same day</option><option>Off</option>
                  </select>
                </div>
                <div>
                  <div style={lbl}>Instructions</div>
                  <input style={inp} value={fuNote} onChange={e=>setFuNote(e.target.value)} placeholder="e.g. Bring HbA1c report"/>
                </div>
              </div>
            </div>
          </div>

        </div>{/* end scroll */}

        {/* ── ACTION BAR ── */}
        <div style={{padding:"7px 12px",borderTop:`0.5px solid ${c.b}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:c.w,flexShrink:0}} className="no-print">
          <button style={{padding:"5px 9px",borderRadius:"5px",border:`0.5px solid ${c.b}`,background:c.w,color:c.m,fontSize:"11px",fontWeight:600,cursor:"pointer"}} onClick={handlePrint}>🖨 Print</button>
          <button style={{padding:"5px 18px",borderRadius:"5px",border:"none",background:c.t,color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer"}} onClick={handleSaveAndSend}>
            💾 Save &amp; Send Rx
          </button>
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast&&(
        <div style={{position:"fixed",bottom:"14px",right:"14px",background:c.s,color:"#fff",padding:"7px 13px",borderRadius:"7px",fontSize:"11px",fontWeight:600,display:"flex",alignItems:"center",gap:"5px",zIndex:999}} className="no-print">
          {toast}
        </div>
      )}
    </div>
    <PrintArea/>
    </>
  );
}
