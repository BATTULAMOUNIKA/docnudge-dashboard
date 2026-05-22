import { useState, useRef, useCallback } from "react";

const DEPT = {
  gen: {
    label: "General Medicine",
    complaints: ["Fever", "Headache", "Cough", "Chest pain", "Fatigue", "Breathlessness", "Vomiting", "Diarrhoea", "Abdominal pain", "Weakness", "Dizziness", "Palpitations", "Body aches", "Loss of appetite", "Sweating", "Chills", "Jaundice", "Swelling"],
    diag: ["Hypertension", "Type 2 Diabetes", "Viral fever", "URI", "GERD", "Anaemia", "Asthma", "UTI", "Migraine", "Hypothyroidism", "Dengue", "Malaria", "Typhoid", "Hepatitis", "IBS", "CKD", "Heart failure"],
    examSystems: ["General condition", "Cardiovascular (CVS)", "Respiratory (RS)", "Abdomen", "CNS / Neurological", "Musculoskeletal", "Lymph nodes", "Skin"],
    investigations: ["CBC", "RBS", "HbA1c", "Lipid profile", "LFT", "KFT", "CRP", "ESR", "Blood culture", "PT/INR", "Blood group", "Dengue NS1", "Widal", "Malarial antigen", "Serum electrolytes", "Urine R/M", "Urine culture", "Chest X-ray", "USG abdomen", "CT scan", "ECG", "Echo", "TSH", "Vitamin D", "Vitamin B12"],
    advice: ["Low salt diet", "Low sugar diet", "Regular exercise", "Stay hydrated", "Take rest", "Avoid alcohol", "Quit smoking", "Weight loss", "Balanced diet", "Monitor BP at home", "Monitor sugar daily", "Follow up if worsens"],
    proc: ["Injection given", "IV cannula inserted", "Nebulisation done", "Wound dressing", "Suturing", "ECG done", "IV fluids given"],
    vacc: [{ n: "Influenza", s: "due" }, { n: "Pneumococcal", s: "done" }, { n: "Hepatitis B", s: "done" }, { n: "Covid booster", s: "miss" }],
    rx: [["Paracetamol", "500mg", "1-0-1", "After food", "5 days", ""], ["Pantoprazole", "40mg", "1-0-0", "Before food", "14 days", ""]],
  },
  pedia: {
    label: "Paediatrics",
    complaints: ["Fever", "Cough", "Cold", "Vomiting", "Loose stools", "Ear pain", "Throat pain", "Rash", "Poor feeding", "Crying excessively", "Breathlessness", "Seizure", "Constipation", "Abdominal pain", "Runny nose"],
    diag: ["Viral URTI", "Otitis media", "Tonsillitis", "Bronchiolitis", "Gastroenteritis", "Febrile seizure", "Pneumonia", "Anaemia", "Malnutrition", "Asthma", "Dengue", "Measles", "Chickenpox"],
    examSystems: ["General condition", "Temperature", "Weight/Height", "Throat", "Chest", "Abdomen", "Ear", "Skin", "Hydration status"],
    investigations: ["CBC", "CRP", "Blood culture", "Blood glucose", "Serum electrolytes", "Widal", "Dengue NS1", "Blood group", "Urine R/M", "Urine culture", "Chest X-ray", "USG abdomen", "Thyroid neonatal", "Vitamin D", "Iron studies"],
    advice: ["ORS for diarrhoea", "Paracetamol for fever", "Sponge bath if high fever", "Continue breastfeeding", "Adequate fluids", "Isolate if contagious", "Soft diet", "No school for 3 days", "Hand hygiene", "Return if not improving in 48hrs"],
    proc: ["Injection given", "IV cannula", "Nebulisation", "Ear syringing", "Wound dressing", "IV fluids", "Blood sample", "Urine bag sample"],
    vacc: [{ n: "BCG", s: "done" }, { n: "Hepatitis B", s: "done" }, { n: "OPV", s: "done" }, { n: "DPT", s: "done" }, { n: "MMR", s: "due" }, { n: "Typhoid", s: "miss" }, { n: "Varicella", s: "due" }, { n: "Pneumococcal", s: "due" }],
    rx: [["Paracetamol syrup", "5ml", "1-0-1", "After food", "5 days", ""], ["Amoxicillin syrup", "5ml", "1-1-1", "After food", "7 days", ""]],
  },
  gynec: {
    label: "Gynaecology & Obstetrics",
    complaints: ["Irregular periods", "Pelvic pain", "Vaginal discharge", "Missed period", "Heavy bleeding", "Nausea & vomiting", "Lower back pain", "Breast pain", "Burning urination", "Hot flashes", "Infertility", "Spotting", "Bloating", "Mood swings"],
    diag: ["PCOS", "Dysmenorrhoea", "PID", "Pregnancy", "UTI", "Uterine fibroids", "Ovarian cyst", "Anaemia", "Menopause", "Ectopic pregnancy", "Endometriosis", "Preeclampsia", "Gestational diabetes", "Threatened abortion"],
    examSystems: ["General condition", "P/A examination", "P/V examination", "Uterus size", "Adnexa", "Cervix", "Fundal height (if pregnant)", "Blood pressure", "Weight"],
    investigations: ["CBC", "HCG quantitative", "FSH/LH", "AMH", "Blood group", "HbA1c", "VDRL", "HIV", "HBsAg", "USG pelvis", "Urine R/M", "UPT", "TSH", "Prolactin", "Testosterone", "Estradiol", "Progesterone", "Pap smear"],
    advice: ["Folic acid daily", "Iron-rich foods", "Avoid heavy lifting", "Pelvic floor exercises", "Regular ANC visits", "Rest adequately", "Avoid raw food", "Calcium & Vitamin D", "Monitor BP", "Reduce stress"],
    proc: ["IUD insertion", "Pap smear done", "Cauterisation", "Endometrial biopsy", "Colposcopy", "Vaginal swab", "Foetal Doppler done", "IUD removal", "D&C"],
    vacc: [{ n: "HPV vaccine", s: "due" }, { n: "Hepatitis B", s: "done" }, { n: "Influenza", s: "due" }, { n: "Rubella", s: "done" }, { n: "Tetanus toxoid", s: "due" }],
    rx: [["Folic acid", "5mg", "0-1-0", "After food", "30 days", ""], ["Ferrous sulphate", "200mg", "1-0-1", "After food", "30 days", ""]],
  },
  ortho: {
    label: "Orthopaedics",
    complaints: ["Knee pain", "Back pain", "Joint swelling", "Shoulder pain", "Neck pain", "Hip pain", "Foot pain", "Wrist pain", "Weakness in limbs", "After fall", "Morning stiffness", "Numbness", "Tingling", "Locking of joint", "Limping"],
    diag: ["Osteoarthritis", "Lumbar spondylosis", "Fracture", "Sciatica", "Cervical spondylosis", "Gout", "Frozen shoulder", "Plantar fasciitis", "Tendinitis", "Ligament tear", "Meniscus tear", "Prolapsed disc", "Rheumatoid arthritis"],
    examSystems: ["Gait", "Range of motion", "Tenderness", "Swelling", "Deformity", "Neurovascular status", "Power & reflexes", "Special tests"],
    investigations: ["X-ray (affected joint)", "MRI", "CT scan", "Bone density scan", "CBC", "CRP", "ESR", "Uric acid", "Calcium", "Vitamin D", "ALP", "RF factor", "Anti-CCP", "ANA"],
    advice: ["Apply ice pack 20 min TDS", "Elevate the limb", "Physiotherapy referral", "Avoid weight bearing", "Use walking aid", "Calcium & Vitamin D diet", "Avoid squatting", "Lumbar belt", "Posture correction", "Weight reduction"],
    proc: ["Casting done", "Splinting done", "Joint aspiration", "Intra-articular injection", "Wound dressing", "Traction applied", "POP cast", "Plaster removal", "Suture removal"],
    vacc: [{ n: "Tetanus toxoid", s: "due" }, { n: "Hepatitis B", s: "done" }],
    rx: [["Diclofenac", "50mg", "1-0-1", "After food", "5 days", ""], ["Calcium + D3", "1 tab", "1-0-0", "After food", "30 days", ""]],
  },
  dental: {
    label: "Dental",
    complaints: ["Toothache", "Swollen gum", "Bleeding gums", "Sensitivity", "Bad breath", "Broken tooth", "Jaw pain", "Food lodgement", "Oral ulcer", "Numbness", "Clicking jaw", "Loose tooth", "Pus discharge", "Difficulty chewing"],
    diag: ["Dental caries", "Gingivitis", "Periodontitis", "Pulpitis", "Pericoronitis", "Periapical abscess", "TMJ disorder", "Oral ulcer", "Dry socket", "Impacted wisdom tooth", "Bruxism", "Root canal needed"],
    examSystems: ["Extraoral examination", "Intraoral examination", "Tooth (affected)", "Gum condition", "Occlusion", "TMJ", "Lymph nodes"],
    investigations: ["OPG X-ray", "IOPA X-ray", "Bitewing X-ray", "CBCT", "CBC (if abscess)", "Blood glucose", "INR"],
    advice: ["Soft diet 24 hrs", "No hot/cold drinks", "Brush gently twice daily", "Salt water gargle TDS", "No smoking", "No straws after extraction", "Take medicines on time", "Follow up if swelling increases"],
    proc: ["Tooth extraction", "Root canal treatment", "Scaling & polishing", "Filling done", "Crown fitting", "Incision & drainage", "Socket irrigation", "Fluoride application"],
    vacc: [{ n: "Hepatitis B", s: "done" }],
    rx: [["Amoxicillin", "500mg", "1-1-1", "After food", "5 days", ""], ["Ibuprofen", "400mg", "1-0-1", "After food", "3 days", ""], ["Metronidazole", "400mg", "1-1-1", "After food", "5 days", ""]],
  },
  skin: {
    label: "Dermatology",
    complaints: ["Rash", "Itching", "Acne", "Hair loss", "Nail changes", "Pigmentation", "Dry skin", "Oozing wound", "Scaling", "Blistering", "Burning", "Skin darkening", "Warts", "Fungal patches", "Dandruff", "Hives"],
    diag: ["Atopic dermatitis", "Psoriasis", "Acne vulgaris", "Fungal infection", "Urticaria", "Alopecia areata", "Vitiligo", "Seborrhoeic dermatitis", "Contact dermatitis", "Scabies", "Cellulitis", "Melasma", "Lichen planus", "Pityriasis versicolor"],
    examSystems: ["Site & distribution", "Type of lesion", "Morphology", "Color", "Surface changes", "Margins", "Associated features", "Scalp", "Nails", "Mucous membranes"],
    investigations: ["KOH mount", "Skin biopsy", "CBC", "IgE levels", "ANA", "Thyroid", "Serum ferritin", "Vitamin D", "DHEA", "Testosterone", "Dermoscopy", "Patch test"],
    advice: ["Avoid scratching", "Moisturiser twice daily", "Sun protection SPF 30+", "Avoid trigger foods", "Gentle cleansers", "Loose cotton clothes", "Keep nails short", "Avoid sharing towels", "No hot water bath"],
    proc: ["Intralesional steroid injection", "Cryotherapy", "Chemical peel", "Comedone extraction", "Patch test", "Skin biopsy", "Wound dressing", "Electrocautery"],
    vacc: [{ n: "Varicella", s: "done" }, { n: "HPV", s: "due" }, { n: "Hepatitis B", s: "done" }],
    rx: [["Cetirizine", "10mg", "0-0-1", "After food", "7 days", ""], ["Betamethasone cream", "Apply thinly", "1-0-1", "External use", "14 days", "On affected area"]],
  },
  ent: {
    label: "ENT",
    complaints: ["Ear pain", "Hearing loss", "Blocked nose", "Sore throat", "Hoarseness", "Nasal discharge", "Tinnitus", "Vertigo", "Snoring", "Swallowing difficulty", "Post nasal drip", "Facial pain", "Epistaxis", "Foreign body", "Ear discharge"],
    diag: ["Otitis media", "CSOM", "Allergic rhinitis", "Tonsillitis", "Sinusitis", "Laryngitis", "BPPV", "DNS", "Pharyngitis", "Adenoid hypertrophy", "Nasal polyps", "Wax impaction", "Meniere's disease"],
    examSystems: ["Ear (otoscopy)", "Nose (anterior rhinoscopy)", "Throat (tonsils, pharynx)", "Neck (lymph nodes)", "Face (sinus tenderness)", "Voice", "Nasal septum"],
    investigations: ["X-ray PNS", "CT PNS", "CT temporal bone", "CBC", "CRP", "Culture swab", "Allergy panel", "ASO titre", "Pure tone audiometry", "Tympanometry"],
    advice: ["Steam inhalation BD", "Avoid cold drinks", "Nasal saline wash daily", "Avoid dust", "Voice rest if hoarse", "Elevate head while sleeping", "Avoid nose picking", "Avoid allergens", "Swimming avoided 2 weeks"],
    proc: ["Ear syringing / suction", "Nasal cauterisation", "Foreign body removal", "Aural toilet", "Nasal packing", "Incision & drainage"],
    vacc: [{ n: "Influenza", s: "due" }, { n: "Pneumococcal", s: "due" }, { n: "Hepatitis B", s: "done" }],
    rx: [["Amoxicillin", "500mg", "1-1-1", "After food", "7 days", ""], ["Xylometazoline drops", "2 drops each nostril", "1-0-1", "-", "5 days", ""]],
  },
  eye: {
    label: "Ophthalmology",
    complaints: ["Blurred vision", "Red eye", "Eye pain", "Watering", "Itching", "Foreign body sensation", "Double vision", "Night blindness", "Floaters", "Flashes", "Discharge", "Eyelid swelling", "Sudden vision loss", "Glare"],
    diag: ["Refractive error", "Conjunctivitis", "Cataract", "Glaucoma", "Dry eye syndrome", "Stye", "Corneal ulcer", "Diabetic retinopathy", "Uveitis", "Macular degeneration", "Retinal detachment", "Pterygium", "Chalazion"],
    examSystems: ["Visual acuity", "IOP (Tonometry)", "Anterior segment (Slit lamp)", "Posterior segment (Fundus)", "Pupils", "Ocular motility", "Colour vision", "Visual field"],
    investigations: ["Refraction test", "IOP measurement", "Slit lamp exam", "Fundus exam", "OCT", "B-scan", "Fluorescein angiography", "Visual field test", "Blood glucose", "HbA1c"],
    advice: ["Avoid rubbing eyes", "Cold compress for swelling", "Wash hands before touching eyes", "No contact lens until cleared", "20-20-20 rule", "Wear sunglasses outdoors", "Lubricate as advised", "Control diabetes", "Return if sudden vision loss"],
    proc: ["Visual acuity tested", "IOP measured", "Slit lamp exam done", "Fundus exam done", "Foreign body removal", "Eye wash done", "Subconjunctival injection", "Lid scrub done"],
    vacc: [],
    rx: [["Moxifloxacin eye drops", "1 drop", "1-1-1-1", "-", "7 days", ""], ["Lubricating eye drops", "1 drop", "1-1-1-1", "-", "Ongoing", ""]],
  },
  cardio: {
    label: "Cardiology",
    complaints: ["Chest pain", "Palpitations", "Breathlessness", "Ankle swelling", "Syncope", "Exertional dyspnoea", "Orthopnoea", "Chest tightness", "Irregular heartbeat", "Fatigue on exertion", "Cough on lying down"],
    diag: ["Hypertension", "Ischaemic heart disease", "Heart failure", "Arrhythmia", "Angina", "Cardiomyopathy", "Valvular heart disease", "STEMI", "NSTEMI", "Atrial fibrillation", "DVT", "Pericarditis"],
    examSystems: ["General condition", "Blood pressure (both arms)", "Heart rate", "JVP", "Heart sounds", "Lungs", "Peripheral oedema", "Pulse character", "Apex beat"],
    investigations: ["ECG", "Echo (2D)", "Troponin I", "BNP", "CK-MB", "Lipid profile", "CBC", "CRP", "D-dimer", "Chest X-ray", "Coronary angiography", "Holter (24hr)", "TMT", "Urine microalbuminuria"],
    advice: ["Low salt diet (<2g/day)", "Quit smoking", "Cardiac rehab", "Daily 30 min walk", "Weigh daily", "Avoid strenuous exertion", "Monitor BP twice daily", "Avoid NSAIDs", "Keep GTN spray handy", "Emergency: call 108 if chest pain"],
    proc: ["ECG done", "IV line inserted", "Cardiac monitoring", "Oxygen given", "Nebulisation done", "Pericardiocentesis", "Cardioversion done"],
    vacc: [{ n: "Influenza", s: "due" }, { n: "Pneumococcal", s: "due" }, { n: "Covid booster", s: "miss" }],
    rx: [["Aspirin", "75mg", "1-0-0", "After food", "Lifelong", ""], ["Atorvastatin", "40mg", "0-0-1", "After food", "Lifelong", ""]],
  },
  pulmo: {
    label: "Pulmonology",
    complaints: ["Cough", "Breathlessness", "Wheezing", "Chest tightness", "Haemoptysis", "Sputum production", "Noisy breathing", "Stridor", "Night sweats", "Weight loss", "Cyanosis"],
    diag: ["Asthma", "COPD", "Pneumonia", "Tuberculosis", "Bronchiectasis", "Interstitial lung disease", "Pleural effusion", "Pulmonary embolism", "Sleep apnoea", "Pulmonary fibrosis", "Sarcoidosis"],
    examSystems: ["General condition", "Respiratory rate", "Chest expansion", "Trachea", "Percussion", "Auscultation", "Cyanosis", "Clubbing", "SpO2"],
    investigations: ["Chest X-ray", "HRCT chest", "Spirometry", "CBC", "CRP", "ESR", "Sputum AFB", "Sputum culture", "D-dimer", "CT pulmonary angiography", "Bronchoscopy", "Peak flow"],
    advice: ["Quit smoking", "Avoid cold air", "Avoid dust & allergens", "Use inhaler correctly", "Breathing exercises", "Increase fluids", "Sleep with head elevated", "Annual flu vaccine", "Pulmonary rehab"],
    proc: ["Spirometry done", "Nebulisation done", "Bronchoscopy", "Pleural tap", "Oxygen therapy", "Sputum sample taken", "Peak flow measured"],
    vacc: [{ n: "Influenza", s: "due" }, { n: "Pneumococcal", s: "due" }, { n: "Covid booster", s: "miss" }],
    rx: [["Salbutamol inhaler", "2 puffs", "SOS", "-", "Ongoing", ""], ["Budesonide + Formoterol", "1 puff", "1-0-1", "-", "Ongoing", ""]],
  },
  gastro: {
    label: "Gastroenterology",
    complaints: ["Abdominal pain", "Nausea", "Vomiting", "Diarrhoea", "Constipation", "Bloating", "Heartburn", "Jaundice", "Blood in stool", "Loss of appetite", "Difficulty swallowing", "Belching", "Abdominal distension", "Dark stools", "Rectal bleeding"],
    diag: ["GERD", "Peptic ulcer", "IBS", "IBD", "Hepatitis", "Cirrhosis", "Pancreatitis", "Gallstones", "Appendicitis", "Fatty liver", "Coeliac disease", "Gastroenteritis", "Haemorrhoids", "Anal fissure"],
    examSystems: ["General condition", "Abdomen (inspection)", "Palpation (tenderness, mass)", "Percussion (ascites)", "Bowel sounds", "Per rectal examination", "Jaundice", "Liver size", "Spleen size"],
    investigations: ["LFT", "Serum amylase", "Serum lipase", "HBsAg", "Anti-HCV", "H. pylori antibody", "CBC", "USG abdomen", "CT abdomen", "Endoscopy (OGD)", "Colonoscopy", "MRCP", "Stool R/E", "Urine bilirubin"],
    advice: ["Small frequent meals", "Avoid spicy food", "Avoid alcohol", "Avoid fatty food", "High fibre diet", "2-3L water daily", "Avoid NSAIDs", "No lying down after meals", "Head elevation while sleeping", "Avoid carbonated drinks"],
    proc: ["Endoscopy done", "Colonoscopy done", "Liver biopsy", "Paracentesis", "Banding of varices", "Polypectomy", "Stool sample taken", "Rectal examination", "Ascitic tap"],
    vacc: [{ n: "Hepatitis A", s: "due" }, { n: "Hepatitis B", s: "done" }, { n: "Typhoid", s: "done" }],
    rx: [["Pantoprazole", "40mg", "1-0-0", "Before food", "14 days", ""], ["Ondansetron", "4mg", "1-1-1", "Before food", "3 days", ""]],
  },
  neuro: {
    label: "Neurology",
    complaints: ["Headache", "Dizziness", "Seizure", "Weakness", "Numbness", "Tingling", "Memory loss", "Difficulty walking", "Slurred speech", "Vision change", "Loss of consciousness", "Tremors", "Facial deviation", "Incontinence"],
    diag: ["Migraine", "Tension headache", "Epilepsy", "Stroke", "TIA", "Parkinson's disease", "Multiple sclerosis", "Peripheral neuropathy", "Bell's palsy", "Meningitis", "Alzheimer's disease", "Guillain-Barre", "Myasthenia gravis"],
    examSystems: ["GCS / consciousness", "Cranial nerves", "Motor system (power, tone)", "Sensory system", "Reflexes", "Cerebellar signs", "Gait", "Speech", "Meningeal signs", "Fundus"],
    investigations: ["MRI brain", "CT brain", "EEG", "EMG/NCS", "CBC", "ESR", "Blood glucose", "Lipid profile", "Serum B12", "Thyroid", "Carotid Doppler", "CSF analysis", "ANA", "ANCA"],
    advice: ["Take medicines at same time daily", "Do not skip anti-epileptics", "Avoid driving if seizure disorder", "Adequate sleep", "Physiotherapy referral", "Avoid alcohol", "Reduce stress", "Speech therapy if needed", "Emergency: call 108 if stroke"],
    proc: ["LP (lumbar puncture)", "EEG done", "EMG done", "IV Mannitol given", "Thrombolysis", "CT done", "MRI arranged", "Nerve block", "Botox injection"],
    vacc: [{ n: "Meningococcal", s: "due" }, { n: "Influenza", s: "due" }],
    rx: [["Levetiracetam", "500mg", "1-0-1", "After food", "Ongoing", ""], ["Amitriptyline", "10mg", "0-0-1", "After food", "30 days", ""]],
  },
  psych: {
    label: "Psychiatry",
    complaints: ["Depressed mood", "Anxiety", "Sleep problems", "Irritability", "Hallucinations", "Suicidal ideation", "Memory issues", "Aggression", "Panic attacks", "Obsessive thoughts", "Compulsive behaviour", "Social withdrawal", "Mood swings", "Low self-esteem"],
    diag: ["Depression", "Generalised anxiety", "Bipolar disorder", "Schizophrenia", "OCD", "PTSD", "Insomnia", "Dementia", "Panic disorder", "ADHD", "Substance use disorder", "Eating disorder"],
    examSystems: ["Appearance & behaviour", "Speech", "Mood & affect", "Thought content", "Thought process", "Perceptions (hallucinations)", "Cognition (MMSE)", "Insight & judgement", "Suicidal ideation assessment"],
    investigations: ["CBC", "LFT", "KFT", "Thyroid", "Vitamin B12", "Vitamin D", "Blood glucose", "Urine toxicology", "ECG (before antipsychotics)", "Prolactin", "Cortisol", "Lithium level"],
    advice: ["Regular sleep schedule", "Mindfulness daily", "Avoid alcohol & drugs", "Family support important", "Attend all counselling", "Do not stop medicines suddenly", "Exercise 30 min daily", "Limit screen time", "Seek help if feeling unsafe"],
    proc: ["Psychotherapy session", "Rating scales administered", "MMSE done", "Hamilton Depression Scale", "PANSS assessment", "CBT session", "Psychiatric evaluation"],
    vacc: [{ n: "Influenza", s: "due" }, { n: "Hepatitis B", s: "done" }],
    rx: [["Sertraline", "50mg", "1-0-0", "After food", "30 days", ""], ["Clonazepam", "0.5mg", "0-0-1", "After food", "14 days", ""]],
  },
  physio: {
    label: "Physiotherapy",
    complaints: ["Back pain", "Neck pain", "Knee pain", "Shoulder pain", "Post-surgery rehab", "Weakness", "Balance problems", "Post-stroke", "Sports injury", "Frozen shoulder", "Foot drop", "Gait disturbance", "Scoliosis", "Work-related pain"],
    diag: ["Lumbar spondylosis", "Cervical spondylosis", "Knee OA", "Rotator cuff injury", "Post-stroke rehab", "Nerve palsy", "Frozen shoulder", "Sports injury", "Postural kyphosis", "Hemiplegia", "Plantar fasciitis"],
    examSystems: ["Posture", "Range of motion", "Muscle strength (MRC grade)", "Gait", "Balance", "Neurological screen", "Pain assessment (VAS)", "Functional assessment"],
    investigations: ["X-ray", "MRI", "Ultrasound muscle", "CT scan", "CBC", "Vitamin D", "Calcium"],
    advice: ["Home exercise programme daily", "Ice for acute, heat for chronic", "Posture correction", "Ergonomic workspace", "Walk 30 min daily", "Avoid prolonged sitting", "Firm mattress", "Stretching twice daily", "Footwear with arch support"],
    proc: ["TENS therapy", "Therapeutic ultrasound", "Hot pack", "Cold pack", "Manual therapy", "Dry needling", "Traction", "Exercise prescription", "Gait training", "Kinesio taping"],
    vacc: [{ n: "Tetanus toxoid", s: "due" }, { n: "Influenza", s: "due" }],
    rx: [["Diclofenac gel", "Apply locally", "1-0-1", "External use", "14 days", "On affected area"], ["Muscle relaxant", "1 tab", "0-0-1", "After food", "5 days", ""]],
  },
};

const SPECIALTY_MAP = {
  "general medicine": "gen", "general physician": "gen", "internal medicine": "gen",
  "paediatrics": "pedia", "pediatrics": "pedia", "child specialist": "pedia",
  "gynaecology": "gynec", "gynecology": "gynec", "obstetrics": "gynec", "obs & gynae": "gynec",
  "orthopaedics": "ortho", "orthopedics": "ortho", "ortho": "ortho",
  "dental": "dental", "dentist": "dental", "oral surgery": "dental",
  "dermatology": "skin", "skin": "skin",
  "ent": "ent", "ear nose throat": "ent", "otolaryngology": "ent",
  "ophthalmology": "eye", "eye": "eye",
  "cardiology": "cardio", "cardiologist": "cardio",
  "pulmonology": "pulmo", "respiratory": "pulmo", "chest physician": "pulmo",
  "gastroenterology": "gastro", "gastro": "gastro",
  "neurology": "neuro", "neurologist": "neuro",
  "psychiatry": "psych", "mental health": "psych",
  "physiotherapy": "physio", "physiotherapist": "physio",
};

const MEDS = [
  "Amlodipine", "Amoxicillin", "Amoxicillin + Clavulanate", "Atorvastatin", "Azithromycin",
  "Betamethasone cream", "Cetirizine", "Ciprofloxacin", "Clonazepam", "Clopidogrel",
  "Diclofenac", "Diclofenac gel", "Dolo 650", "Domperidone", "Folic acid", "Furosemide",
  "Ibuprofen", "Insulin (glargine)", "Insulin (regular)", "Ketoconazole", "Levocetirizine",
  "Lisinopril", "Losartan", "Metformin", "Metformin XR", "Metoprolol", "Metronidazole",
  "Montelukast", "Moxifloxacin eye drops", "Omeprazole", "Ondansetron", "Pantoprazole",
  "Paracetamol", "Prednisolone", "Pregabalin", "Rabeprazole", "Ramipril", "Rosuvastatin",
  "Salbutamol inhaler", "Sertraline", "Spironolactone", "Telmisartan", "Vitamin D3",
  "Calcium + D3", "Warfarin", "Aspirin", "Levothyroxine", "Betahistine", "Levetiracetam",
  "Amitriptyline", "Gabapentin", "Fluconazole", "Albendazole", "Ivermectin",
];

const DOSES = ["1 tab", "2 tabs", "1/2 tab", "5ml", "10ml", "2.5ml", "1 cap", "2 caps", "1 puff", "2 puffs",
  "1 drop", "2 drops", "Apply locally", "Apply thinly", "1 sachet", "50mg", "75mg", "100mg", "150mg",
  "200mg", "250mg", "400mg", "500mg", "750mg", "1000mg", "1g", "5mg", "10mg", "20mg", "25mg", "40mg",
  "80mg", "2mg", "4mg", "8mg", "10mcg", "25mcg", "50mcg", "100mcg", "0.5mg", "1mg", "2.5mg", "5ml syrup",
];

const FREQ = [
  { v: "1-0-0", l: "1-0-0  (Morning only)" },
  { v: "0-1-0", l: "0-1-0  (Afternoon only)" },
  { v: "0-0-1", l: "0-0-1  (Night only)" },
  { v: "1-0-1", l: "1-0-1  (Morning & Night)" },
  { v: "1-1-0", l: "1-1-0  (Morning & Afternoon)" },
  { v: "1-1-1", l: "1-1-1  (Three times daily)" },
  { v: "1-1-1-1", l: "1-1-1-1  (Four times daily)" },
  { v: "SOS", l: "SOS  (As needed)" },
  { v: "Once weekly", l: "Once weekly" },
  { v: "Twice weekly", l: "Twice weekly" },
  { v: "Once monthly", l: "Once monthly" },
  { v: "1-0-0 (alternate day)", l: "Alternate days" },
];

const FOOD = ["After food", "Before food", "With food", "Empty stomach", "-", "External use"];

const DURATION = ["1 day", "2 days", "3 days", "5 days", "7 days", "10 days", "14 days", "21 days",
  "1 month", "3 months", "6 months", "Lifelong", "Ongoing", "As directed", "2 weeks", "4 weeks", "2 months",
];

const VITALS_INIT = [
  { k: "BP", v: "120/80", u: "mmHg" },
  { k: "Temp", v: "98.6", u: "F" },
  { k: "Pulse", v: "78", u: "bpm" },
  { k: "SpO2", v: "99", u: "%" },
  { k: "Weight", v: "", u: "kg" },
  { k: "RBS", v: "", u: "mg/dL" },
];

const c = {
  t: "#0f766e", tl: "#f0fdfa", s: "#0f172a", m: "#64748b", b: "#e2e8f0", sf: "#f8fafc", w: "#fff",
  red: "#dc2626", amber: "#d97706", green: "#16a34a",
};

const inp = { border: `0.5px solid ${c.b}`, borderRadius: "5px", padding: "5px 8px", fontSize: "11px", color: c.s, background: c.w, outline: "none", width: "100%", fontFamily: "inherit" };
const sel = { ...inp };
const ta = { ...inp, resize: "none", height: "44px", fontFamily: "inherit" };
const chip = (on) => ({ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", border: `0.5px solid ${on ? c.t : c.b}`, background: on ? c.t : c.w, color: on ? "#fff" : c.m, cursor: "pointer", userSelect: "none" });
const card = { background: c.w, border: `0.5px solid ${c.b}`, borderRadius: "7px", marginBottom: "6px" };
const ch = { padding: "6px 11px", background: c.sf, borderBottom: `0.5px solid ${c.b}`, borderRadius: "7px 7px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" };
const ct = { fontSize: "10px", fontWeight: 700, color: c.m, textTransform: "uppercase", letterSpacing: ".05em" };
const cb = { padding: "8px 11px" };
const slbl = { fontSize: "9px", fontWeight: 800, color: c.t, textTransform: "uppercase", letterSpacing: ".08em", padding: "5px 0 3px", display: "flex", alignItems: "center", gap: "5px" };
const lbl = { fontSize: "10px", fontWeight: 600, color: c.m, marginBottom: "2px" };

export default function OPSheet({ patient, doctor, visitNo, onSave, onSendWhatsApp, onClose }) {
  const deptKey = (() => {
    const sp = (doctor?.specialty || doctor?.designation || "").toLowerCase().trim();
    for (const [k, v] of Object.entries(SPECIALTY_MAP)) {
      if (sp.includes(k)) return v;
    }
    return "gen";
  })();
  const dept = DEPT[deptKey];

  const [selC, setSelC] = useState([]);
  const [selD, setSelD] = useState([]);
  const [selAdv, setSelAdv] = useState([]);
  const [selProc, setSelProc] = useState([]);
  const [selInv, setSelInv] = useState([]);
  const [rxList, setRxList] = useState(dept.rx.map((r) => [...r]));
  const [vitals, setVitals] = useState(VITALS_INIT);
  const [vEdit, setVEdit] = useState(false);
  const [toast, setToast] = useState(null);
  const [rxMode, setRxMode] = useState("type");
  const [fuDate, setFuDate] = useState("");
  const [fuRemind, setFuRemind] = useState("Day before");
  const [fuNote, setFuNote] = useState("");
  const [compNote, setCompNote] = useState("");
  const [examNote, setExamNote] = useState("");
  const [diagNote, setDiagNote] = useState("");
  const [advNote, setAdvNote] = useState("");
  const [short, setShort] = useState("");
  const [listening, setListening] = useState(false);
  const [sugg, setSugg] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const recRef = useRef(null);
  const tRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const tog = (arr, setter, v) => setter((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const addRx = () => setRxList((prev) => [...prev, ["", "", "1-0-1", "After food", "5 days", ""]]);
  const delRx = (i) => setRxList((prev) => prev.filter((_, j) => j !== i));
  const updRx = (i, col, val) => setRxList((prev) => prev.map((r, j) => (j === i ? r.map((entry, k) => (k === col ? val : entry)) : r)));
  const repRx = () => { setRxList(dept.rx.map((r) => [...r])); showToast("Last Rx loaded."); };

  const medSug = (i, val) => {
    updRx(i, 0, val);
    if (val.length < 2) { setSugg((state) => ({ ...state, [i]: null })); return; }
    const matches = MEDS.filter((x) => x.toLowerCase().includes(val.toLowerCase())).slice(0, 6);
    setSugg((state) => ({ ...state, [i]: matches.length ? matches : null }));
  };

  const pickMed = (i, med) => { updRx(i, 0, med); setSugg((state) => ({ ...state, [i]: null })); };

  const setFuQ = (d) => {
    if (!d) return;
    const dt = new Date();
    dt.setDate(dt.getDate() + parseInt(d, 10));
    setFuDate(dt.toISOString().split("T")[0]);
  };

  const SH = {
    "/htn": "Hypertension - well controlled. Continue current medications. Low salt diet. Monitor BP twice daily.",
    "/dm": "T2 Diabetes mellitus - follow-up. Continue medications. Low sugar diet. HbA1c after 3 months.",
    "/fever": "Viral fever - symptomatic. Hydration. Paracetamol. Return if not improving in 48 hours.",
    "/uri": "Upper respiratory tract infection. Steam inhalation. Hydration. Avoid cold drinks.",
    "/bp": "BP review - measured today. Medications adjusted. Low salt diet. Monitor twice daily.",
    "/review": "Review visit - improving. Continue current medications. Follow up as scheduled.",
  };

  const expandSH = (val) => {
    setShort(val);
    if (SH[val.trim()]) {
      setCompNote((prev) => prev + (prev ? "\n" : "") + SH[val.trim()]);
      setShort("");
      showToast("Expanded.");
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) { showToast("Voice not supported"); return; }
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = "en-IN";
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => setCompNote((prev) => prev + (prev ? " " : "") + Array.from(e.results).map((x) => x[0].transcript).join(" "));
    r.onerror = () => { setListening(false); showToast("Voice error"); };
    r.onend = () => setListening(false);
    r.start();
    recRef.current = r;
    setListening(true);
    showToast("Listening...");
  };

  const updVital = (i, v) => setVitals((prev) => prev.map((vt, j) => (j === i ? { ...vt, v } : vt)));

  const buildPayload = () => ({
    complaints: selC,
    compNote,
    examNote,
    investigations: selInv,
    diagnoses: selD,
    diagNote,
    rx: rxList,
    advice: selAdv,
    advNote,
    procedures: selProc,
    vitals,
    followUpDate: fuDate,
    followUpNote: fuNote,
    followUpReminder: fuRemind,
  });

  const handleSaveAndSend = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = buildPayload();
      await onSave?.(payload);
      await onSendWhatsApp?.(payload);
      showToast("Visit saved and prescription sent on WhatsApp.");
    } catch (error) {
      console.error(error);
      showToast(error?.response?.data?.detail || error?.message || "Could not save the prescription.");
    } finally {
      setSubmitting(false);
    }
  };

  const vaccColor = (s) => s === "done" ? c.green : s === "due" ? c.amber : c.red;
  const vaccLabel = (s) => s === "done" ? "Done" : s === "due" ? "Due" : "Missed";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", height: "100vh", background: c.w, fontFamily: "'Segoe UI',system-ui,sans-serif", fontSize: "12px", color: c.s, position: "relative", overflow: "hidden" }}>
      <div style={{ background: "#0f172a", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "8px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: c.t, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {(patient?.name || "P").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9", lineHeight: "1.3" }}>{patient?.name || "Patient Name"}</div>
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "1px" }}>
                {[patient?.gender, patient?.age && patient.age + "y", patient?.mrn && "MRN-" + patient.mrn].filter(Boolean).join(" · ") || ""}
              </div>
            </div>
          </div>
          <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>{doctor?.name || "Doctor"}</div>
          <div style={{ fontSize: "11px", color: c.t, fontWeight: 700 }}>{dept.label}</div>
          {visitNo && <div style={{ fontSize: "10px", color: "#475569", marginTop: "3px" }}>Visit #{visitNo}</div>}
        </div>

        <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: ".07em", color: "#475569", fontWeight: 700, marginBottom: "5px" }}>Clinical Alerts</div>
          {patient?.conditions?.map((condition) => (
            <span key={condition} style={{ display: "inline-flex", alignItems: "center", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 600, background: "rgba(220,38,38,.2)", color: "#fca5a5", margin: "2px 2px 0 0" }}>{condition}</span>
          ))}
          {patient?.allergies?.map((allergy) => (
            <span key={allergy} style={{ display: "inline-flex", alignItems: "center", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 600, background: "rgba(217,119,6,.2)", color: "#fcd34d", margin: "2px 2px 0 0" }}>! {allergy}</span>
          ))}
          {!patient?.conditions?.length && !patient?.allergies?.length && <span style={{ fontSize: "10px", color: "#475569" }}>No alerts on record</span>}
        </div>

        <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: ".07em", color: "#475569", fontWeight: 700, marginBottom: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Vitals
            <span style={{ fontSize: "9px", color: c.t, cursor: "pointer", fontWeight: 600 }} onClick={() => setVEdit((value) => !value)}>{vEdit ? "Done" : "Edit"}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px" }}>
            {vitals.map((v, i) => (
              <div key={v.k} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "5px", padding: "5px 7px", border: `1px solid ${vEdit ? "#0f766e" : "rgba(255,255,255,0.07)"}` }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "3px" }}>
                  {vEdit ? (
                    <input defaultValue={v.v} onChange={(e) => updVital(i, e.target.value)} placeholder="-" style={{ background: "transparent", border: "none", outline: "none", color: "#f1f5f9", fontSize: "12px", fontWeight: 600, width: v.k === "BP" ? "52px" : "38px", fontFamily: "inherit" }} />
                  ) : (
                    <span>{v.v || "-"}</span>
                  )}
                  <span style={{ fontSize: "9px", color: "#64748b" }}>{v.u}</span>
                </div>
                <div style={{ fontSize: "9px", color: "#64748b", marginTop: "1px" }}>{v.k}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: ".07em", color: "#475569", fontWeight: 700, marginBottom: "6px" }}>Visit History</div>
          {(patient?.visits || []).map((visit, i) => (
            <div key={i} style={{ padding: "6px 8px", borderRadius: "5px", background: "rgba(255,255,255,0.04)", marginBottom: "4px", borderLeft: "2px solid #0f766e", cursor: "pointer" }}
              onClick={() => { setRxList((visit.rx || dept.rx).map((r) => [...r])); showToast("Last Rx loaded."); }}>
              <div style={{ fontSize: "9px", color: "#475569" }}>{visit.date}</div>
              <div style={{ fontSize: "11px", color: "#e2e8f0", fontWeight: 500, marginTop: "1px" }}>{visit.diagnosis}</div>
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px", lineHeight: "1.4" }}>{visit.rx_summary}</div>
            </div>
          ))}
          {(!patient?.visits || !patient.visits.length) && (
            <div style={{ padding: "6px 8px", borderRadius: "5px", background: "rgba(255,255,255,0.04)", borderLeft: "2px solid #0f766e", cursor: "pointer" }} onClick={repRx}>
              <div style={{ fontSize: "9px", color: "#475569" }}>Previous visit</div>
              <div style={{ fontSize: "11px", color: "#e2e8f0", fontWeight: 500, marginTop: "1px" }}>Click to load last Rx</div>
            </div>
          )}
        </div>

        {dept.vacc.length > 0 && (
          <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: ".07em", color: "#475569", fontWeight: 700, marginBottom: "5px" }}>Vaccinations</div>
            {dept.vacc.map((v) => (
              <div key={v.n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 0", borderBottom: "0.5px solid rgba(255,255,255,0.04)", fontSize: "10px" }}>
                <span style={{ color: "#cbd5e1" }}>{v.n}</span>
                <span style={{ fontWeight: 600, color: vaccColor(v.s) }}>{vaccLabel(v.s)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: c.sf }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "0" }}>
          <div style={slbl}>S <span style={{ fontSize: "9px", fontWeight: 500, color: c.m }}>Subjective - Complaint</span></div>

          <div style={card}>
            <div style={ch}>
              <span style={ct}>Chief Complaint</span>
              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                <input style={{ ...inp, width: "70px" }} placeholder="Since..." />
                <select style={{ ...sel, width: "85px" }}><option>Sudden</option><option>Gradual</option><option>Chronic</option><option>Recurrent</option></select>
              </div>
            </div>
            <div style={cb}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginBottom: "7px" }}>
                {dept.complaints.map((x) => (
                  <span key={x} style={chip(selC.includes(x))} onClick={() => tog(selC, setSelC, x)}>{x}</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
                <span style={{ fontSize: "9px", color: c.m, fontWeight: 600, alignSelf: "center" }}>Notes:</span>
                {[["type", "Type"], ["voice", "Voice"], ["short", "Shorthand"]].map(([m, l]) => (
                  <button key={m} style={{ padding: "2px 8px", borderRadius: "4px", border: `0.5px solid ${rxMode === m ? c.t : c.b}`, background: rxMode === m ? c.t : c.w, color: rxMode === m ? "#fff" : c.m, fontSize: "10px", fontWeight: 600, cursor: "pointer" }} onClick={() => setRxMode(m)}>{l}</button>
                ))}
              </div>
              {rxMode === "type" && <textarea style={ta} value={compNote} onChange={(e) => setCompNote(e.target.value)} placeholder="Additional complaint notes..." />}
              {rxMode === "voice" && (
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button style={{ flex: 1, padding: "6px", borderRadius: "5px", border: "none", background: listening ? "#ef4444" : "#22c55e", color: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer" }} onClick={toggleVoice}>
                    {listening ? "Stop listening" : "Start voice dictation"}
                  </button>
                </div>
              )}
              {rxMode === "short" && (
                <div>
                  <input style={inp} value={short} onChange={(e) => expandSH(e.target.value)} placeholder="Type /htn /dm /fever /uri /bp /review and press Enter" onKeyDown={(e) => e.key === "Enter" && expandSH(short)} />
                  <div style={{ fontSize: "9px", color: c.m, marginTop: "3px" }}>Available: /htn · /dm · /fever · /uri · /bp · /review</div>
                  {compNote && <textarea style={{ ...ta, marginTop: "4px" }} value={compNote} onChange={(e) => setCompNote(e.target.value)} />}
                </div>
              )}
            </div>
          </div>

          <div style={{ ...slbl, marginTop: "4px" }}>O <span style={{ fontSize: "9px", fontWeight: 500, color: c.m }}>Objective - Examination & Investigations</span></div>

          <div style={card}>
            <div style={ch}><span style={ct}>Examination Findings</span></div>
            <div style={cb}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", marginBottom: "6px" }}>
                {dept.examSystems.map((s) => (
                  <div key={s}>
                    <div style={{ fontSize: "9px", fontWeight: 600, color: c.m, marginBottom: "2px" }}>{s}</div>
                    <input style={inp} placeholder="Findings..." />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={ch}><span style={ct}>Investigations Advised</span></div>
            <div style={cb}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                {dept.investigations.map((x) => (
                  <span key={x} style={chip(selInv.includes(x))} onClick={() => tog(selInv, setSelInv, x)}>{x}</span>
                ))}
              </div>
              <textarea style={{ ...ta, marginTop: "6px" }} placeholder="Any additional tests..." />
            </div>
          </div>

          <div style={{ ...slbl, marginTop: "4px" }}>A <span style={{ fontSize: "9px", fontWeight: 500, color: c.m }}>Assessment - Diagnosis</span></div>

          <div style={card}>
            <div style={ch}><span style={ct}>Diagnosis</span></div>
            <div style={cb}>
              <div style={{ marginBottom: "6px" }}>
                <div style={lbl}>Select diagnosis</div>
                <select style={sel} onChange={(e) => { if (e.target.value && !selD.includes(e.target.value)) setSelD((prev) => [...prev, e.target.value]); e.target.value = ""; }}>
                  <option value="">- Select -</option>
                  {dept.diag.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginBottom: "5px" }}>
                {selD.map((d) => (
                  <span key={d} style={{ ...chip(true), display: "flex", alignItems: "center", gap: "4px" }}>
                    {d}
                    <span style={{ cursor: "pointer", fontSize: "10px", opacity: 0.7 }} onClick={() => setSelD((prev) => prev.filter((x) => x !== d))}>x</span>
                  </span>
                ))}
              </div>
              <textarea style={ta} value={diagNote} onChange={(e) => setDiagNote(e.target.value)} placeholder="Provisional / differential / ICD notes..." />
            </div>
          </div>

          <div style={{ ...slbl, marginTop: "4px" }}>P <span style={{ fontSize: "9px", fontWeight: 500, color: c.m }}>Plan - Prescription, Advice & Follow-up</span></div>

          <div style={card}>
            <div style={ch}>
              <span style={ct}>Prescription (Rx)</span>
              <div style={{ display: "flex", gap: "4px" }}>
                <button style={{ padding: "3px 8px", borderRadius: "4px", border: `0.5px solid ${c.b}`, background: c.sf, color: c.m, fontSize: "10px", fontWeight: 600, cursor: "pointer" }} onClick={repRx}>Repeat last</button>
                <button style={{ padding: "3px 8px", borderRadius: "4px", border: `0.5px solid ${c.t}`, background: c.tl, color: c.t, fontSize: "10px", fontWeight: 600, cursor: "pointer" }} onClick={addRx}>+ Add</button>
              </div>
            </div>
            <div style={cb}>
              <div style={{ display: "grid", gridTemplateColumns: "2.4fr 80px 100px 90px 80px 1fr 18px", gap: "4px", marginBottom: "3px", padding: "0 4px" }}>
                {["Medicine", "Dose", "Frequency", "Food", "Duration", "Notes / Composition", ""].map((h) => (
                  <div key={h} style={{ fontSize: "9px", fontWeight: 700, color: c.m, textTransform: "uppercase", letterSpacing: ".04em" }}>{h}</div>
                ))}
              </div>
              {rxList.map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2.4fr 80px 100px 90px 80px 1fr 18px", gap: "4px", marginBottom: "4px", alignItems: "start" }}>
                  <div style={{ position: "relative" }}>
                    <input style={{ ...inp, fontWeight: 500 }} value={r[0]} placeholder="Medicine name" onChange={(e) => medSug(i, e.target.value)} />
                    {sugg[i] && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: c.w, border: `0.5px solid ${c.b}`, borderRadius: "5px", zIndex: 30, maxHeight: "90px", overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}>
                        {sugg[i].map((m) => (
                          <div key={m} style={{ padding: "5px 9px", fontSize: "11px", cursor: "pointer" }} onMouseOver={(e) => { e.currentTarget.style.background = c.tl; }} onMouseOut={(e) => { e.currentTarget.style.background = ""; }} onClick={() => pickMed(i, m)}>{m}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <select style={sel} value={r[1]} onChange={(e) => updRx(i, 1, e.target.value)}>
                    <option value="">-</option>
                    {DOSES.map((d) => <option key={d}>{d}</option>)}
                    <option value={r[1] && !DOSES.includes(r[1]) ? r[1] : ""} disabled={!r[1] || DOSES.includes(r[1])}>{r[1] && !DOSES.includes(r[1]) ? r[1] : ""}</option>
                  </select>
                  <select style={sel} value={r[2]} onChange={(e) => updRx(i, 2, e.target.value)}>
                    <option value="">-</option>
                    {FREQ.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
                  </select>
                  <select style={sel} value={r[3]} onChange={(e) => updRx(i, 3, e.target.value)}>
                    {FOOD.map((f) => <option key={f}>{f}</option>)}
                  </select>
                  <select style={sel} value={r[4]} onChange={(e) => updRx(i, 4, e.target.value)}>
                    <option value="">-</option>
                    {DURATION.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <input style={inp} value={r[5] || ""} placeholder="Composition / note..." onChange={(e) => updRx(i, 5, e.target.value)} />
                  <button style={{ width: "18px", height: "18px", borderRadius: "4px", border: "0.5px solid #fca5a5", background: "#fef2f2", color: "#ef4444", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "4px" }} onClick={() => delRx(i)}>x</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "6px" }}>
            <div style={{ ...card, marginBottom: 0 }}>
              <div style={ch}><span style={ct}>Advice to Patient</span></div>
              <div style={cb}>
                <div style={{ marginBottom: "6px" }}>
                  <select style={sel} onChange={(e) => { if (e.target.value && !selAdv.includes(e.target.value)) setSelAdv((prev) => [...prev, e.target.value]); e.target.value = ""; }}>
                    <option value="">- Add advice -</option>
                    {dept.advice.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginBottom: "5px" }}>
                  {selAdv.map((a) => (
                    <span key={a} style={{ ...chip(true), display: "flex", alignItems: "center", gap: "4px", fontSize: "10px" }}>
                      {a}<span style={{ cursor: "pointer", opacity: 0.7 }} onClick={() => setSelAdv((prev) => prev.filter((x) => x !== a))}>x</span>
                    </span>
                  ))}
                </div>
                <textarea style={{ ...ta, height: "36px" }} value={advNote} onChange={(e) => setAdvNote(e.target.value)} placeholder="Additional advice..." />
              </div>
            </div>
            <div style={{ ...card, marginBottom: 0 }}>
              <div style={ch}><span style={ct}>Procedure Done</span></div>
              <div style={cb}>
                <div style={{ marginBottom: "6px" }}>
                  <select style={sel} onChange={(e) => { if (e.target.value && !selProc.includes(e.target.value)) setSelProc((prev) => [...prev, e.target.value]); e.target.value = ""; }}>
                    <option value="">- Select procedure -</option>
                    {dept.proc.map((p2) => <option key={p2}>{p2}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                  {selProc.map((p2) => (
                    <span key={p2} style={{ ...chip(true), display: "flex", alignItems: "center", gap: "4px", fontSize: "10px" }}>
                      {p2}<span style={{ cursor: "pointer", opacity: 0.7 }} onClick={() => setSelProc((prev) => prev.filter((x) => x !== p2))}>x</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={ch}><span style={ct}>Follow-up & WhatsApp Reminder</span></div>
            <div style={cb}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "7px" }}>
                <div>
                  <div style={lbl}>Follow-up date</div>
                  <input type="date" style={inp} value={fuDate} onChange={(e) => setFuDate(e.target.value)} />
                </div>
                <div>
                  <div style={lbl}>Quick set</div>
                  <select style={sel} onChange={(e) => setFuQ(e.target.value)}>
                    <option value="">Pick...</option>
                    {[["3", "3 days"], ["7", "1 week"], ["14", "2 weeks"], ["30", "1 month"], ["90", "3 months"]].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={lbl}>WA Reminder</div>
                  <select style={sel} value={fuRemind} onChange={(e) => setFuRemind(e.target.value)}>
                    <option>Day before</option>
                    <option>Same day</option>
                    <option>Off</option>
                  </select>
                </div>
                <div>
                  <div style={lbl}>Instructions</div>
                  <input style={inp} value={fuNote} onChange={(e) => setFuNote(e.target.value)} placeholder="e.g. Bring HbA1c report" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "7px 12px", borderTop: `0.5px solid ${c.b}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: c.w, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "5px" }}>
            <button style={{ padding: "5px 9px", borderRadius: "5px", border: `0.5px solid ${c.b}`, background: c.w, color: c.m, fontSize: "11px", fontWeight: 600, cursor: "pointer" }} onClick={() => window.print()}>Print</button>
            <button style={{ padding: "5px 9px", borderRadius: "5px", border: `0.5px solid ${c.b}`, background: c.w, color: c.m, fontSize: "11px", fontWeight: 600, cursor: "pointer" }} onClick={() => showToast("Lab form ready")}>Labs</button>
            <button style={{ padding: "5px 9px", borderRadius: "5px", border: `0.5px solid ${c.b}`, background: c.w, color: c.m, fontSize: "11px", fontWeight: 600, cursor: "pointer" }} onClick={() => showToast("Upload ready")}>Report</button>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button style={{ padding: "5px 16px", borderRadius: "5px", border: "none", background: c.t, color: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer" }} onClick={handleSaveAndSend} disabled={submitting}>
              {submitting ? "Saving..." : "Save and Send Rx"}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ position: "absolute", bottom: "14px", right: "14px", background: c.s, color: "#fff", padding: "7px 13px", borderRadius: "7px", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px", zIndex: 99 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
