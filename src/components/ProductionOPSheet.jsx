import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────
// DEPARTMENT DATA — all keywords per specialty
// ─────────────────────────────────────────────────────────
const DEPT = {
  gen: {
    label: "General Medicine",
    complaints: ["Fever","Headache","Cough","Chest pain","Fatigue","Breathlessness","Vomiting","Diarrhoea","Abdominal pain","Weakness","Dizziness","Palpitations","Body aches","Loss of appetite","Sweating","Chills","Jaundice","Swelling"],
    diag: ["Hypertension","Type 2 Diabetes","Viral fever","URI","GERD","Anaemia","Asthma","UTI","Migraine","Hypothyroidism","Dengue","Malaria","Typhoid","Hepatitis","IBS","CKD","Heart failure"],
    inv: {
      Blood: ["CBC","RBS","HbA1c","Lipid profile","LFT","KFT","CRP","ESR","Blood culture","PT/INR","Blood group","Dengue NS1","Widal","Malarial antigen","Serum electrolytes"],
      Imaging: ["Chest X-ray","USG abdomen","CT scan","MRI brain","X-ray KUB"],
      Urine: ["Urine R/M","Urine culture","24hr urine protein","Urine ACR"],
      Cardiac: ["ECG","Echo","TMT","Troponin","BNP","Holter"],
      Hormonal: ["TSH","T3/T4","Cortisol","Insulin","Vitamin D","Vitamin B12","Ferritin"],
    },
    advice: ["Low salt diet","Low sugar diet","Regular exercise","Stay hydrated","Take rest","Avoid alcohol","Quit smoking","Weight loss","Balanced diet","Monitor BP at home","Monitor sugar daily","Follow up if symptoms worsen"],
    proc: ["Injection given","IV cannula inserted","Nebulisation done","Wound dressing","Suturing","Blood sample taken","Urine sample taken","ECG done","IV fluids given","NG tube inserted"],
    vacc: [{n:"Influenza",s:"due"},{n:"Pneumococcal",s:"done"},{n:"Hepatitis B",s:"done"},{n:"Covid booster",s:"miss"},{n:"Typhoid",s:"done"}],
    rx: [["Paracetamol","500mg","TDS","5 days"],["Pantoprazole","40mg","Once daily (empty stomach)","14 days"]],
  },
  pedia: {
    label: "Paediatrics",
    complaints: ["Fever","Cough","Cold","Vomiting","Loose stools","Ear pain","Throat pain","Rash","Poor feeding","Crying excessively","Breathlessness","Seizure","Constipation","Abdominal pain","Runny nose","Eye discharge","Redness of eyes","Weight loss"],
    diag: ["Viral URTI","Otitis media","Tonsillitis","Bronchiolitis","Gastroenteritis","Febrile seizure","Pneumonia","Anaemia","Malnutrition","Asthma","Dengue","Hand foot mouth","Measles","Chickenpox","Intussusception"],
    inv: {
      Blood: ["CBC","CRP","Blood culture","Blood glucose","Serum electrolytes","Widal","Dengue NS1","Blood group"],
      Imaging: ["Chest X-ray","USG abdomen","X-ray skull","USG hip"],
      Urine: ["Urine R/M","Urine culture"],
      Cardiac: ["ECG","Echo (if needed)"],
      Hormonal: ["Thyroid neonatal","Vitamin D","Iron studies","Serum calcium"],
    },
    advice: ["ORS for diarrhoea","Paracetamol for fever","Sponge bath if high fever","Continue breastfeeding","Adequate fluid intake","Isolate if contagious","Soft diet","No school for 3 days","Mosquito protection","Hand hygiene","Return if not improving in 48hrs"],
    proc: ["Injection given","IV cannula","Nebulisation","Ear syringing","Wound dressing","IV fluids","Blood sample taken","Urine bag sample","Lumbar puncture"],
    vacc: [{n:"BCG",s:"done"},{n:"Hepatitis B",s:"done"},{n:"OPV",s:"done"},{n:"DPT",s:"done"},{n:"MMR",s:"due"},{n:"Typhoid",s:"miss"},{n:"Varicella",s:"due"},{n:"Pneumococcal",s:"due"},{n:"Rotavirus",s:"done"}],
    rx: [["Paracetamol syrup","5ml","TDS","5 days"],["Amoxicillin syrup","5ml","BD","7 days"]],
  },
  gynec: {
    label: "Gynaecology & Obstetrics",
    complaints: ["Irregular periods","Pelvic pain","Vaginal discharge","Missed period","Heavy bleeding","Nausea & vomiting","Lower back pain","Breast pain","Burning urination","Hot flashes","Infertility","Spotting","Bloating","Mood swings","Painful intercourse"],
    diag: ["PCOS","Dysmenorrhoea","PID","Pregnancy","UTI","Uterine fibroids","Ovarian cyst","Anaemia","Menopause","Ectopic pregnancy","Endometriosis","Cervical erosion","Preeclampsia","Gestational diabetes","Threatened abortion"],
    inv: {
      Blood: ["CBC","HCG quantitative","FSH/LH","AMH","Blood group","HbA1c","VDRL","HIV","HBsAg"],
      Imaging: ["USG pelvis","USG abdomen","Hysterosonography","Mammography","Foetal scan"],
      Urine: ["Urine R/M","Urine culture","UPT"],
      Cardiac: ["ECG (pre-op)","Echo (if needed)"],
      Hormonal: ["TSH","Prolactin","Testosterone","Estradiol","Progesterone","Anti-TPO","DHEAS"],
    },
    advice: ["Folic acid daily","Iron-rich foods","Avoid heavy lifting","Pelvic floor exercises","Regular ANC visits","Safe intercourse","Rest adequately","Avoid raw/uncooked food","Calcium & Vitamin D","Monitor BP","Reduce stress"],
    proc: ["IUD insertion","Pap smear done","Cauterisation","Endometrial biopsy","Colposcopy","Vaginal swab","Foetal Doppler done","IUD removal","D&C","Cervical stitch"],
    vacc: [{n:"HPV vaccine",s:"due"},{n:"Hepatitis B",s:"done"},{n:"Influenza",s:"due"},{n:"Rubella",s:"done"},{n:"Tetanus toxoid",s:"due"}],
    rx: [["Folic acid","5mg","Once daily","30 days"],["Ferrous sulphate","200mg","Twice daily","30 days"]],
  },
  ortho: {
    label: "Orthopaedics",
    complaints: ["Knee pain","Back pain","Joint swelling","Shoulder pain","Neck pain","Hip pain","Foot pain","Wrist pain","Weakness in limbs","After fall","Morning stiffness","Numbness","Tingling","Locking of joint","Limping"],
    diag: ["Osteoarthritis","Lumbar spondylosis","Fracture","Sciatica","Cervical spondylosis","Gout","Frozen shoulder","Plantar fasciitis","Tendinitis","Ligament tear","Meniscus tear","Prolapsed disc","Rheumatoid arthritis","Pott's spine","Osteomyelitis"],
    inv: {
      Blood: ["CBC","CRP","ESR","Uric acid","Calcium","Vitamin D","ALP","RF factor","Anti-CCP","ANA"],
      Imaging: ["X-ray (affected joint)","MRI","CT scan","Bone density scan","Ultrasound joint"],
      Urine: ["Urine R/M","24hr urine calcium"],
      Cardiac: ["ECG (pre-op)"],
      Hormonal: ["Vitamin D","PTH","Thyroid","Testosterone (bone density)"],
    },
    advice: ["Apply ice pack 20 min TDS","Elevate the limb","Physiotherapy referral","Avoid weight bearing","Use walking aid / crutches","Calcium & Vitamin D rich diet","Avoid squatting","Back support / lumbar belt","Posture correction","Weight reduction","Swimming allowed","No strenuous activity for 6 weeks"],
    proc: ["Casting done","Splinting done","Joint aspiration","Intra-articular injection","K-wire insertion","Wound dressing","Traction applied","POP cast applied","Plaster removal","Suture removal"],
    vacc: [{n:"Tetanus toxoid",s:"due"},{n:"Hepatitis B",s:"done"}],
    rx: [["Diclofenac","50mg","BD after food","5 days"],["Calcium + D3","1 tab","Once daily","30 days"],["Muscle relaxant","1 tab","Once at night","5 days"]],
  },
  dental: {
    label: "Dental",
    complaints: ["Toothache","Swollen gum","Bleeding gums","Sensitivity to cold/hot","Bad breath","Broken tooth","Jaw pain","Food lodgement","Oral ulcer","Numbness in jaw","Clicking jaw","Loose tooth","Pus discharge","Difficulty chewing"],
    diag: ["Dental caries","Gingivitis","Periodontitis","Pulpitis","Pericoronitis","Periapical abscess","TMJ disorder","Oral ulcer","Dry socket","Impacted wisdom tooth","Cellulitis","Stomatitis","Bruxism","Root canal needed"],
    inv: {
      Blood: ["CBC (if abscess)","Blood glucose","INR (if on anticoagulants)","Blood group"],
      Imaging: ["OPG X-ray","IOPA X-ray","Bitewing X-ray","CBCT"],
      Urine: [],
      Cardiac: [],
      Hormonal: [],
    },
    advice: ["Soft diet for 24 hrs","No hot/cold drinks","Brush gently twice daily","Salt water gargle TDS","No smoking","Avoid hard foods","Apply ice pack if swollen","Keep head elevated","No straws after extraction","Follow up if swelling increases","Take medicines on time"],
    proc: ["Tooth extraction","Root canal treatment","Scaling & polishing","Filling done","Crown fitting","Incision & drainage","Socket irrigation","Splinting","Fluoride application","Pulp capping"],
    vacc: [{n:"Hepatitis B",s:"done"}],
    rx: [["Amoxicillin","500mg","TDS","5 days"],["Ibuprofen","400mg","BD after food","3 days"],["Metronidazole","400mg","TDS","5 days"],["Chlorhexidine mouthwash","10ml","BD rinse","7 days"]],
  },
  skin: {
    label: "Dermatology",
    complaints: ["Rash","Itching","Acne","Hair loss","Nail changes","Pigmentation","Dry skin","Oozing wound","Scaling","Blistering","Burning sensation","Skin darkening","Warts","Fungal patches","Dandruff","Hives"],
    diag: ["Atopic dermatitis","Psoriasis","Acne vulgaris","Fungal infection (tinea)","Urticaria","Alopecia areata","Vitiligo","Seborrhoeic dermatitis","Contact dermatitis","Scabies","Pediculosis","Cellulitis","Melasma","Lichen planus","Pityriasis versicolor"],
    inv: {
      Blood: ["CBC","IgE levels","ANA","Thyroid","Serum ferritin","Vitamin D","Blood glucose"],
      Imaging: ["Dermoscopy","Skin biopsy"],
      Urine: ["Urine R/M"],
      Cardiac: [],
      Hormonal: ["DHEA","Testosterone","FSH (hair loss)","Anti-TPO","Prolactin"],
    },
    advice: ["Avoid scratching","Moisturiser twice daily","Sun protection SPF 30+","Avoid trigger foods","Use gentle cleansers","Wear loose cotton clothes","Keep nails short","Avoid sharing towels","Change bed linen weekly","No hot water bath","Avoid synthetic fabrics"],
    proc: ["Intralesional steroid injection","Cryotherapy","Chemical peel","Comedone extraction","Patch test","Skin biopsy","Wound dressing","Electrocautery","Laser referral","Excision of lesion"],
    vacc: [{n:"Varicella",s:"done"},{n:"HPV",s:"due"},{n:"Hepatitis B",s:"done"}],
    rx: [["Cetirizine","10mg","Once at night","7 days"],["Betamethasone cream","Apply thinly","BD","14 days"],["Ketoconazole 2% shampoo","Apply","Twice weekly","4 weeks"]],
  },
  ent: {
    label: "ENT",
    complaints: ["Ear pain","Hearing loss","Blocked nose","Sore throat","Hoarseness","Nasal discharge","Tinnitus","Vertigo","Snoring","Swallowing difficulty","Post nasal drip","Facial pain","Epistaxis","Foreign body","Ear discharge"],
    diag: ["Otitis media (AOM)","CSOM","Allergic rhinitis","Tonsillitis","Sinusitis","Laryngitis","BPPV","DNS","Pharyngitis","Adenoid hypertrophy","Nasal polyps","Wax impaction","Epiglottitis","Meniere's disease"],
    inv: {
      Blood: ["CBC","CRP","Culture swab","Allergy panel (RAST)","ASO titre"],
      Imaging: ["X-ray PNS","CT temporal bone","CT PNS","Nasal endoscopy","MRI inner ear"],
      Urine: [],
      Cardiac: [],
      Hormonal: ["Thyroid (hoarseness)"],
    },
    advice: ["Steam inhalation BD","Avoid cold drinks & ice cream","Nasal saline wash daily","Avoid dusty environments","Voice rest if hoarse","Elevate head while sleeping","Avoid nose picking","Sneeze with mouth open","Use nasal spray as directed","Avoid allergens","Swimming avoided for 2 weeks"],
    proc: ["Ear syringing / suction","Nasal cauterisation","Tonsillectomy","Myringotomy","Foreign body removal","Suction clearance","Aural toilet","Nasal packing","Paracentesis","Grommet insertion"],
    vacc: [{n:"Influenza",s:"due"},{n:"Pneumococcal",s:"due"},{n:"Hepatitis B",s:"done"}],
    rx: [["Amoxicillin","500mg","TDS","7 days"],["Xylometazoline nasal drops","2 drops each nostril","BD","5 days"],["Budesonide nasal spray","2 sprays each nostril","Once daily","30 days"]],
  },
  eye: {
    label: "Ophthalmology",
    complaints: ["Blurred vision","Red eye","Eye pain","Watering","Itching","Foreign body sensation","Double vision","Night blindness","Floaters","Flashes","Discharge","Eyelid swelling","Headache with eye strain","Sudden vision loss","Glare"],
    diag: ["Refractive error","Conjunctivitis","Cataract","Glaucoma","Dry eye syndrome","Stye (Hordeolum)","Corneal ulcer","Diabetic retinopathy","Uveitis","Age-related macular degeneration","Retinal detachment","Pterygium","Chalazion"],
    inv: {
      Blood: ["Blood glucose","HbA1c","BP check","CBC"],
      Imaging: ["Refraction test","IOP (Tonometry)","Slit lamp exam","Fundus photography","OCT","B-scan","Fluorescein angiography","Visual field test"],
      Urine: [],
      Cardiac: [],
      Hormonal: ["Thyroid (proptosis)"],
    },
    advice: ["Avoid rubbing eyes","Cold compress for swelling","Wash hands before touching eyes","No contact lens until cleared","Screen break every 20 mins","20-20-20 rule","Wear sunglasses outdoors","Use lubricating drops as advised","Maintain diabetes control","Night driving restriction","Return immediately if sudden vision loss"],
    proc: ["Visual acuity tested","IOP measured","Slit lamp examination","Fundus examination","Foreign body removal","Eye wash done","Fluorescein staining","Pad and bandage applied","Subconjunctival injection","Lid scrub done"],
    vacc: [],
    rx: [["Moxifloxacin eye drops","1 drop","4 times daily","7 days"],["Lubricating eye drops","1 drop","4-6 times daily","Ongoing"],["Prednisolone eye drops","1 drop","QID (taper)","10 days"]],
  },
  cardio: {
    label: "Cardiology",
    complaints: ["Chest pain","Palpitations","Breathlessness","Ankle swelling","Syncope","Exertional dyspnoea","Orthopnoea","Chest tightness","Irregular heartbeat","Fatigue on exertion","Cough on lying down","Sudden sweating"],
    diag: ["Hypertension","Ischaemic heart disease","Heart failure","Arrhythmia","Angina","Cardiomyopathy","Valvular heart disease","STEMI","NSTEMI","Atrial fibrillation","DVT","Pulmonary embolism","Pericarditis"],
    inv: {
      Blood: ["Troponin I","BNP / NT-proBNP","CK-MB","Lipid profile","CBC","CRP","D-dimer","Serum electrolytes","PT/INR"],
      Imaging: ["ECG","Echo (2D)","Chest X-ray","Coronary angiography","CT coronary","Cardiac MRI","Carotid Doppler"],
      Urine: ["Urine R/M","Microalbuminuria"],
      Cardiac: ["Holter (24hr)","TMT","Cardiac catheterisation","Tilt table test","EP study"],
      Hormonal: ["Thyroid","Aldosterone","Cortisol","BNP"],
    },
    advice: ["Low salt diet (< 2g/day)","Quit smoking immediately","Cardiac rehab programme","Daily 30 min walk (if allowed)","Weigh daily — report if +2kg","Avoid strenuous exertion","Monitor BP twice daily","Restrict fluids if advised","Avoid NSAIDs","Keep GTN spray handy","Emergency: Call 108 if chest pain"],
    proc: ["ECG done","Pericardiocentesis","Cardioversion done","Pacemaker check","Defibrillation","IV line inserted","Cardiac monitoring started","Oxygen given","Nebulisation done"],
    vacc: [{n:"Influenza",s:"due"},{n:"Pneumococcal",s:"due"},{n:"Covid booster",s:"miss"}],
    rx: [["Aspirin","75mg","Once daily after food","Lifelong"],["Atorvastatin","40mg","Once at night","Lifelong"],["Metoprolol","25mg","Twice daily","Ongoing"]],
  },
  pulmo: {
    label: "Pulmonology",
    complaints: ["Cough","Breathlessness","Wheezing","Chest tightness","Haemoptysis","Sputum production","Noisy breathing","Stridor","Night sweats","Weight loss","Cyanosis","Chest pain on breathing"],
    diag: ["Asthma","COPD","Pneumonia","Tuberculosis","Bronchiectasis","Interstitial lung disease","Pleural effusion","Pulmonary embolism","Obstructive sleep apnoea","Lung cancer","Sarcoidosis","Pulmonary fibrosis"],
    inv: {
      Blood: ["CBC","CRP","ESR","Sputum AFB","Sputum culture","ANA","ANCA","LDH","D-dimer"],
      Imaging: ["Chest X-ray","HRCT chest","CT pulmonary angiography","PET scan","Bronchoscopy"],
      Urine: [],
      Cardiac: ["ECG","Echo (if cor pulmonale)"],
      Hormonal: ["ACE level (sarcoidosis)","Thyroid"],
    },
    advice: ["Quit smoking","Avoid cold air exposure","Avoid dust & allergens","Use inhaler correctly","Breathing exercises daily","Steam inhalation","Increase fluid intake","Sleep with head elevated","Annual flu vaccine","Pulmonary rehab referral","Avoid chemical fumes","Pursed lip breathing"],
    proc: ["Spirometry done","Nebulisation done","Bronchoscopy","Pleural tap (thoracocentesis)","Chest tube insertion","Oxygen therapy","Incentive spirometry","Sputum sample taken","Peak flow measured","Intercostal drain"],
    vacc: [{n:"Influenza",s:"due"},{n:"Pneumococcal",s:"due"},{n:"Covid booster",s:"miss"}],
    rx: [["Salbutamol inhaler","2 puffs","SOS / TDS","Ongoing"],["Budesonide + Formoterol inhaler","1 puff","BD","Ongoing"],["Montelukast","10mg","Once at night","30 days"]],
  },
  gastro: {
    label: "Gastroenterology",
    complaints: ["Abdominal pain","Nausea","Vomiting","Diarrhoea","Constipation","Bloating","Heartburn","Jaundice","Blood in stool","Loss of appetite","Difficulty swallowing","Belching","Abdominal distension","Dark stools","Rectal bleeding"],
    diag: ["GERD","Peptic ulcer","IBS","IBD (Crohn's / UC)","Hepatitis","Cirrhosis","Pancreatitis","Gallstones","Appendicitis","Colorectal cancer","Fatty liver","Coeliac disease","Gastroenteritis","Haemorrhoids","Anal fissure"],
    inv: {
      Blood: ["CBC","LFT","Serum amylase","Serum lipase","HBsAg","Anti-HCV","H. pylori antibody","CA 19-9","AFP","CEA","PT/INR"],
      Imaging: ["USG abdomen","CT abdomen","MRI abdomen","Endoscopy (OGD)","Colonoscopy","MRCP","ERCP","Barium swallow"],
      Urine: ["Urine R/M","Urine bilirubin"],
      Cardiac: ["ECG"],
      Hormonal: ["Thyroid (constipation)","Cortisol"],
    },
    advice: ["Small frequent meals","Avoid spicy food","Avoid alcohol","Avoid fatty food","High fibre diet","Plenty of water (2–3L)","Avoid NSAIDs","Do not lie down after meals","Head elevation while sleeping","Avoid carbonated drinks","Stop smoking","Low FODMAP diet if IBS"],
    proc: ["Endoscopy done","Colonoscopy done","Liver biopsy","Paracentesis","ERCP","Banding of varices","Polypectomy","Stool sample taken","Rectal examination","Ascitic tap"],
    vacc: [{n:"Hepatitis A",s:"due"},{n:"Hepatitis B",s:"done"},{n:"Typhoid",s:"done"}],
    rx: [["Pantoprazole","40mg","Once daily (empty stomach)","14 days"],["Ondansetron","4mg","TDS","3 days"],["Metronidazole","400mg","TDS","7 days"]],
  },
  neuro: {
    label: "Neurology",
    complaints: ["Headache","Dizziness","Seizure","Weakness","Numbness","Tingling","Memory loss","Difficulty walking","Slurred speech","Vision change","Loss of consciousness","Tremors","Facial deviation","Diplopia","Incontinence"],
    diag: ["Migraine","Tension headache","Epilepsy","Stroke","TIA","Parkinson's disease","Multiple sclerosis","Peripheral neuropathy","Cervical myelopathy","Bell's palsy","Meningitis","Brain tumour","Alzheimer's disease","Guillain-Barré syndrome","Myasthenia gravis"],
    inv: {
      Blood: ["CBC","ESR","CRP","Blood glucose","Lipid profile","Serum B12","Folate","Serum electrolytes","ANA","ANCA","Thyroid"],
      Imaging: ["MRI brain","CT brain","MRI spine","EEG","EMG/NCS","Cerebral angiography","Carotid Doppler"],
      Urine: ["Urine R/M"],
      Cardiac: ["ECG","Echo (stroke workup)","Holter (AF)"],
      Hormonal: ["Thyroid","Cortisol","Vitamin D","Vitamin B12"],
    },
    advice: ["Take medicines at same time daily","Do not skip anti-epileptics","Avoid driving if seizure disorder","Adequate sleep","Physiotherapy referral","Avoid alcohol","Reduce stress","Head injury precautions","Speech therapy if needed","Occupational therapy referral","Emergency: Call 108 if stroke symptoms"],
    proc: ["LP (lumbar puncture) done","EEG done","EMG done","IV Mannitol given","Thrombolysis","CT done","MRI arranged","Nerve block given","Botox injection","Deep brain stimulation"],
    vacc: [{n:"Meningococcal",s:"due"},{n:"Influenza",s:"due"},{n:"Covid booster",s:"miss"}],
    rx: [["Levetiracetam","500mg","Twice daily","Ongoing"],["Amitriptyline","10mg","Once at night","30 days"],["Betahistine","16mg","TDS","30 days"]],
  },
  psych: {
    label: "Psychiatry",
    complaints: ["Depressed mood","Anxiety","Sleep problems","Irritability","Hallucinations","Suicidal ideation","Memory issues","Aggression","Panic attacks","Obsessive thoughts","Compulsive behaviour","Social withdrawal","Mood swings","Excessive worry","Low self-esteem"],
    diag: ["Depression","Generalised anxiety disorder","Bipolar disorder","Schizophrenia","OCD","PTSD","Insomnia","Dementia","Panic disorder","ADHD","Borderline PD","Substance use disorder","Eating disorder","Conversion disorder","Somatisation disorder"],
    inv: {
      Blood: ["CBC","LFT","KFT","Thyroid","Vitamin B12","Vitamin D","Blood glucose","Fasting glucose","Prolactin","Lithium level (if on lithium)"],
      Imaging: ["MRI brain (if needed)","EEG (if seizures)","CT brain"],
      Urine: ["Urine toxicology screen"],
      Cardiac: ["ECG (before antipsychotics)"],
      Hormonal: ["Thyroid","Prolactin","Cortisol","Testosterone"],
    },
    advice: ["Regular sleep schedule (same time)","Mindfulness / relaxation daily","Avoid alcohol and recreational drugs","Family support is important","Attend all counselling sessions","Do not stop medicines suddenly","Exercise 30 min daily","Limit screen time","Journaling helpful","Engage in social activities","Seek help if feeling unsafe"],
    proc: ["Psychotherapy session done","Rating scales administered","MMSE done","CAGE questionnaire","Hamilton Depression Scale","PANSS assessment","CBT session","Psychiatric evaluation"],
    vacc: [{n:"Influenza",s:"due"},{n:"Hepatitis B",s:"done"}],
    rx: [["Sertraline","50mg","Once morning after food","30 days"],["Clonazepam","0.5mg","Once at night","14 days"]],
  },
  physio: {
    label: "Physiotherapy",
    complaints: ["Back pain","Neck pain","Knee pain","Shoulder pain","Post-surgery rehabilitation","Weakness","Balance problems","Post-stroke","Sports injury","Frozen shoulder","Foot drop","Gait disturbance","Post-fracture stiffness","Scoliosis","Work-related pain"],
    diag: ["Lumbar spondylosis","Cervical spondylosis","Knee OA","Rotator cuff injury","Post-stroke rehabilitation","Nerve palsy","Muscle weakness","Frozen shoulder","Sports injury","Postural kyphosis","Hemiplegia","Cerebral palsy","Plantar fasciitis"],
    inv: {
      Blood: ["CBC","CRP (if inflammatory)","Vitamin D","Calcium"],
      Imaging: ["X-ray","MRI","Ultrasound muscle","CT scan"],
      Urine: [],
      Cardiac: [],
      Hormonal: ["Vitamin D","Calcium","PTH"],
    },
    advice: ["Continue home exercise programme","Ice pack for acute pain","Heat therapy for chronic pain","Posture correction essential","Ergonomic workspace setup","Walk 30 min daily","Avoid prolonged sitting / standing","Use ergonomic chair","Sleep on firm mattress","Stretching twice daily","Avoid lifting heavy weights","Footwear with arch support"],
    proc: ["TENS therapy","Therapeutic ultrasound","Hot pack application","Cold pack application","Manual therapy","Dry needling","Traction therapy","Exercise prescription","Hydrotherapy","Gait training","Balance training","Kinesio taping"],
    vacc: [{n:"Tetanus toxoid",s:"due"},{n:"Influenza",s:"due"}],
    rx: [["Diclofenac gel","Apply locally","BD","14 days"],["Muscle relaxant","1 tab","Once at night","5 days"]],
  },
};

// Map specialty strings from backend to dept keys
const SPECIALTY_MAP = {
  "general medicine": "gen","general physician": "gen","internal medicine": "gen",
  "paediatrics": "pedia","pediatrics": "pedia","child specialist": "pedia",
  "gynaecology": "gynec","gynecology": "gynec","obstetrics": "gynec","obs & gynae": "gynec",
  "orthopaedics": "ortho","orthopedics": "ortho","ortho": "ortho",
  "dental": "dental","dentist": "dental","oral surgery": "dental",
  "dermatology": "skin","skin": "skin",
  "ent": "ent","ear nose throat": "ent","otolaryngology": "ent",
  "ophthalmology": "eye","eye": "eye",
  "cardiology": "cardio","cardiologist": "cardio",
  "pulmonology": "pulmo","respiratory": "pulmo","chest physician": "pulmo",
  "gastroenterology": "gastro","gastro": "gastro",
  "neurology": "neuro","neurologist": "neuro",
  "psychiatry": "psych","mental health": "psych",
  "physiotherapy": "physio","physiotherapist": "physio","physical therapy": "physio",
};

const MEDS = [
  "Amlodipine","Amoxicillin","Atorvastatin","Azithromycin","Cetirizine","Ciprofloxacin",
  "Dolo 650","Diclofenac","Folic acid","Ibuprofen","Lisinopril","Losartan","Levocetirizine",
  "Metformin","Metronidazole","Metoprolol","Montelukast","Omeprazole","Ondansetron",
  "Paracetamol","Pantoprazole","Rabeprazole","Sertraline","Telmisartan","Vitamin D3",
  "Calcium + D3","Insulin (regular)","Insulin (glargine)","Salbutamol","Clopidogrel",
  "Warfarin","Aspirin","Rosuvastatin","Ramipril","Furosemide","Spironolactone",
  "Levothyroxine","Betahistine","Levetiracetam","Amitriptyline","Pregabalin","Gabapentin",
  "Ketoconazole","Fluconazole","Albendazole","Ivermectin","Hydroxychloroquine",
];

const FREQ_OPTIONS = ["Once daily","Twice daily (BD)","Three times (TDS)","Four times (QID)","Once at night","SOS (as needed)","Once weekly","Twice weekly","Once monthly","Every 8 hours"];
const DUR_OPTIONS  = ["3 days","5 days","7 days","10 days","14 days","30 days","3 months","6 months","Lifelong","Ongoing","As directed"];

const VITALS_INIT = [
  {k:"BP",     v:"120/80", u:"mmHg",  flag:""},
  {k:"Temp",   v:"98.6",   u:"°F",    flag:""},
  {k:"Pulse",  v:"78",     u:"bpm",   flag:""},
  {k:"SpO2",   v:"99",     u:"%",     flag:""},
  {k:"Weight", v:"70",     u:"kg",    flag:""},
  {k:"RBS",    v:"110",    u:"mg/dL", flag:""},
];

// ─────────────────────────────────────────────────────────
// STYLES (inline CSS-in-JS map)
// ─────────────────────────────────────────────────────────
const S = {
  wrap:    {display:"grid",gridTemplateColumns:"215px 1fr",height:"100vh",maxHeight:"760px",background:"#fff",border:"0.5px solid #e2e8f0",borderRadius:"12px",overflow:"hidden",position:"relative",fontFamily:"'Segoe UI',system-ui,sans-serif",fontSize:"12px",color:"#0f172a"},
  sid:     {background:"#0f172a",display:"flex",flexDirection:"column",overflow:"hidden"},
  sidTop:  {padding:"10px 12px",borderBottom:"1px solid rgba(255,255,255,0.07)"},
  av:      {width:"32px",height:"32px",borderRadius:"50%",background:"#0f766e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700,color:"#fff",float:"left",marginRight:"8px",marginTop:"2px"},
  ptName:  {fontSize:"13px",fontWeight:600,color:"#f1f5f9",lineHeight:"1.3"},
  ptSub:   {fontSize:"10px",color:"#64748b",marginTop:"1px"},
  sidSec:  {padding:"7px 12px",borderBottom:"1px solid rgba(255,255,255,0.07)"},
  sidLbl:  {fontSize:"9px",textTransform:"uppercase",letterSpacing:".07em",color:"#475569",fontWeight:700,marginBottom:"5px",display:"flex",justifyContent:"space-between",alignItems:"center"},
  alPill:  (c)=>({display:"inline-flex",alignItems:"center",gap:"3px",padding:"2px 6px",borderRadius:"4px",fontSize:"10px",fontWeight:600,margin:"2px 2px 0 0",...(c==="r"?{background:"rgba(220,38,38,.2)",color:"#fca5a5"}:c==="a"?{background:"rgba(217,119,6,.2)",color:"#fcd34d"}:{background:"rgba(29,78,216,.2)",color:"#93c5fd"})}),
  vg:      {display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px"},
  vb:      (ed)=>({background:"rgba(255,255,255,0.05)",borderRadius:"5px",padding:"5px 7px",border:`1px solid ${ed?"#0f766e":"rgba(255,255,255,0.07)"}`,cursor:"pointer"}),
  vv:      {fontSize:"13px",fontWeight:600,color:"#f1f5f9",display:"flex",alignItems:"center",gap:"3px"},
  vn:      {fontSize:"9px",color:"#64748b",marginTop:"1px"},
  hist:    {flex:1,overflowY:"auto",padding:"7px 12px"},
  hi:      {padding:"6px 8px",borderRadius:"5px",background:"rgba(255,255,255,0.04)",marginBottom:"4px",borderLeft:"2px solid #0f766e",cursor:"pointer"},
  hiDate:  {fontSize:"9px",color:"#475569"},
  hiDiag:  {fontSize:"11px",color:"#e2e8f0",fontWeight:500,marginTop:"1px"},
  hiRx:    {fontSize:"10px",color:"#64748b",marginTop:"2px",lineHeight:"1.4"},
  main:    {display:"flex",flexDirection:"column",overflow:"hidden"},
  scroll:  {flex:1,overflowY:"auto",padding:"8px 10px",display:"flex",flexDirection:"column",gap:"6px"},
  slbl:    {fontSize:"9px",fontWeight:800,color:"#0f766e",textTransform:"uppercase",letterSpacing:".08em",display:"flex",alignItems:"center",gap:"5px",padding:"4px 0 2px"},
  card:    {background:"#fff",border:"0.5px solid #e2e8f0",borderRadius:"7px",overflow:"visible"},
  ch:      {padding:"5px 10px",background:"#f8fafc",borderBottom:"0.5px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between",borderRadius:"7px 7px 0 0"},
  ct:      {fontSize:"10px",fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".05em",display:"flex",alignItems:"center",gap:"4px"},
  cb:      {padding:"7px 10px"},
  chips:   {display:"flex",flexWrap:"wrap",gap:"3px"},
  chip:    (on)=>({padding:"3px 8px",borderRadius:"4px",fontSize:"11px",border:`0.5px solid ${on?"#0f766e":"#e2e8f0"}`,background:on?"#0f766e":"#fff",color:on?"#fff":"#64748b",cursor:"pointer",lineHeight:"1.4"}),
  ta:      {width:"100%",border:"0.5px solid #e2e8f0",borderRadius:"5px",padding:"6px 8px",fontSize:"12px",color:"#0f172a",background:"#fff",resize:"none",fontFamily:"inherit",outline:"none",height:"38px"},
  inp:     {border:"0.5px solid #e2e8f0",borderRadius:"5px",padding:"5px 8px",fontSize:"11px",color:"#0f172a",background:"#fff",outline:"none",width:"100%",fontFamily:"inherit"},
  sel:     {border:"0.5px solid #e2e8f0",borderRadius:"5px",padding:"5px 8px",fontSize:"11px",color:"#0f172a",background:"#fff",outline:"none",width:"100%",fontFamily:"inherit"},
  row2:    {display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"},
  ic:      (on)=>({padding:"3px 7px",borderRadius:"4px",fontSize:"10px",fontWeight:600,border:`0.5px solid ${on?"#0f766e":"#e2e8f0"}`,background:on?"#f0fdfa":"#fff",color:on?"#0f766e":"#64748b",cursor:"pointer"}),
  rxg:     {display:"grid",gridTemplateColumns:"2fr 72px 1fr 70px 20px",gap:"4px",alignItems:"center",marginBottom:"3px",position:"relative"},
  rxh:     {display:"grid",gridTemplateColumns:"2fr 72px 1fr 70px 20px",gap:"4px",marginBottom:"3px"},
  rh:      {fontSize:"9px",fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".04em",paddingLeft:"8px"},
  del:     {width:"20px",height:"20px",borderRadius:"4px",border:"0.5px solid #fca5a5",background:"#fef2f2",color:"#ef4444",fontSize:"11px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},
  addRx:   {display:"inline-flex",alignItems:"center",gap:"3px",padding:"3px 8px",borderRadius:"5px",border:"0.5px solid #0f766e",background:"#f0fdfa",color:"#0f766e",fontSize:"10px",fontWeight:600,cursor:"pointer",marginTop:"3px"},
  repRx:   {display:"inline-flex",alignItems:"center",gap:"3px",padding:"3px 8px",borderRadius:"5px",border:"0.5px solid #e2e8f0",background:"#f8fafc",color:"#64748b",fontSize:"10px",fontWeight:600,cursor:"pointer",marginTop:"3px",marginLeft:"4px"},
  acDrop:  {position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"0.5px solid #e2e8f0",borderRadius:"5px",zIndex:30,maxHeight:"90px",overflowY:"auto",boxShadow:"0 4px 12px rgba(0,0,0,.08)"},
  acItem:  {padding:"5px 9px",fontSize:"11px",color:"#0f172a",cursor:"pointer"},
  lbl:     {fontSize:"10px",fontWeight:600,color:"#64748b",marginBottom:"3px"},
  vaccRow: {display:"flex",alignItems:"center",justifyContent:"space-between",padding:"3px 0",borderBottom:"0.5px solid #f8fafc",fontSize:"11px"},
  ab:      {padding:"7px 10px",borderTop:"0.5px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,background:"#fff"},
  btnG:    {display:"inline-flex",alignItems:"center",gap:"3px",padding:"5px 8px",borderRadius:"5px",border:"0.5px solid #e2e8f0",background:"#fff",color:"#64748b",fontSize:"11px",fontWeight:600,cursor:"pointer"},
  btnWA:   {display:"inline-flex",alignItems:"center",gap:"3px",padding:"5px 9px",borderRadius:"5px",border:"none",background:"#22c55e",color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer"},
  btnS:    {display:"inline-flex",alignItems:"center",gap:"3px",padding:"5px 14px",borderRadius:"5px",border:"none",background:"#0f766e",color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer"},
  toast:   {position:"absolute",bottom:"12px",right:"12px",background:"#0f172a",color:"#fff",padding:"6px 12px",borderRadius:"6px",fontSize:"11px",fontWeight:600,display:"flex",alignItems:"center",gap:"5px",zIndex:99,transition:"opacity .3s"},
  modeBtn: (on)=>({display:"inline-flex",alignItems:"center",gap:"3px",padding:"3px 8px",borderRadius:"4px",border:`0.5px solid ${on?"#0f766e":"#e2e8f0"}`,background:on?"#0f766e":"#fff",color:on?"#fff":"#64748b",fontSize:"10px",fontWeight:600,cursor:"pointer"}),
};

// ─────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────
export default function OPSheet({ patient, doctor, onSave, onSendWhatsApp }) {
  // Detect department from doctor specialty
  const deptKey = (() => {
    const sp = (doctor?.specialty || doctor?.designation || "").toLowerCase().trim();
    for (const [k, v] of Object.entries(SPECIALTY_MAP)) {
      if (sp.includes(k)) return v;
    }
    return "gen";
  })();
  const dept = DEPT[deptKey];

  // State
  const [selC,   setSelC]   = useState([]);
  const [selD,   setSelD]   = useState([]);
  const [selI,   setSelI]   = useState([]);
  const [selA,   setSelA]   = useState([]);
  const [selP,   setSelP]   = useState([]);
  const [invCat, setInvCat] = useState("Blood");
  const [rxList, setRxList] = useState(dept.rx.map(r=>[...r]));
  const [vitals, setVitals] = useState(VITALS_INIT);
  const [vEdit,  setVEdit]  = useState(false);
  const [toast,  setToast]  = useState(null);
  const [rxMode, setRxMode] = useState("type"); // "type" | "voice" | "short"
  const [fuDate, setFuDate] = useState("");
  const [suggestions, setSuggestions] = useState({});
  const [complaintNote, setComplaintNote] = useState("");
  const [historyNote,   setHistoryNote]   = useState("");
  const [examNote,      setExamNote]      = useState("");
  const [diagNote,      setDiagNote]      = useState("");
  const [adviceNote,    setAdviceNote]    = useState("");
  const [fuNote,        setFuNote]        = useState("");
  const [fuReminder,    setFuReminder]    = useState("Day before");
  const [shorthandInput,setShorthandInput]= useState("");
  const [isListening,   setIsListening]   = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const recognitionRef = useRef(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // Chip toggle
  const tog = (arr, setArr, v) =>
    setArr(prev => prev.includes(v) ? prev.filter(x=>x!==v) : [...prev, v]);

  // Rx helpers
  const addRx = () => setRxList(prev => [...prev, ["","","",""]]);
  const delRx = (i) => setRxList(prev => prev.filter((_,j)=>j!==i));
  const updRx = (i, col, val) => setRxList(prev => prev.map((r,j) => j===i ? r.map((c,k)=>k===col?val:c) : r));
  const repeatRx = () => { setRxList(dept.rx.map(r=>[...r])); showToast("Last Rx loaded ✓"); };

  // Medicine autocomplete
  const medSuggest = (i, val) => {
    updRx(i, 0, val);
    if (val.length < 2) { setSuggestions(s=>({...s,[i]:null})); return; }
    const m = MEDS.filter(x=>x.toLowerCase().includes(val.toLowerCase())).slice(0,6);
    setSuggestions(s=>({...s,[i]:m.length?m:null}));
  };
  const pickMed = (i, med) => { updRx(i, 0, med); setSuggestions(s=>({...s,[i]:null})); };

  // Follow-up quick set
  const setFuQuick = (days) => {
    if (!days) return;
    const d = new Date(); d.setDate(d.getDate() + parseInt(days));
    setFuDate(d.toISOString().split("T")[0]);
  };

  // Shorthand expand
  const SHORTHANDS = {
    "/htn": "Hypertension — well controlled. Continue current medications. Low salt diet advised. Monitor BP at home twice daily.",
    "/dm":  "Diabetes mellitus Type 2 — follow-up. Continue current medications. Low sugar diet. HbA1c after 3 months.",
    "/fever": "Viral fever — supportive management. Adequate hydration. Paracetamol for fever. Return if not improving in 48 hours.",
    "/bp":  "Blood pressure review — BP measured today. Medications adjusted. Low salt diet. Monitor BP twice daily.",
    "/uri": "Upper respiratory tract infection — symptomatic treatment. Steam inhalation. Hydration. Avoid cold drinks.",
  };
  const expandShorthand = (val) => {
    setShorthandInput(val);
    if (SHORTHANDS[val.trim()]) {
      setComplaintNote(prev => prev + (prev?"\n":"") + SHORTHANDS[val.trim()]);
      setShorthandInput("");
      showToast("Shorthand expanded ✓");
    }
  };

  // Voice dictation
  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      showToast("Voice not supported in this browser");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = "en-IN";
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      const t = Array.from(e.results).map(x=>x[0].transcript).join(" ");
      setComplaintNote(prev => prev + (prev?" ":"") + t);
    };
    r.onerror = () => { setIsListening(false); showToast("Voice error — try again"); };
    r.onend = () => setIsListening(false);
    r.start();
    recognitionRef.current = r;
    setIsListening(true);
    showToast("🎤 Listening...");
  };

  // Vital update
  const updVital = (i, val) => setVitals(prev => prev.map((v,j)=>j===i?{...v,v:val}:v));

  // Save
  const handleSaveAndSend = async () => {
    const data = {
      complaints: selC, complaintNote, historyNote,
      examNote, investigations: selI,
      diagnoses: selD, diagNote,
      rx: rxList, advice: selA, adviceNote,
      procedures: selP, vitals,
      followUpDate: fuDate, followUpNote: fuNote, followUpReminder: fuReminder,
    };
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSave?.(data);
      await onSendWhatsApp?.(data);
      showToast("Visit saved and prescription sent on WhatsApp.");
    } catch (error) {
      console.error(error);
      showToast(error?.response?.data?.detail || error?.message || "Could not save the prescription.");
    } finally {
      setSubmitting(false);
    }
  };

  const vaccColor = (s) => s==="done"?"#16a34a":s==="due"?"#d97706":"#dc2626";
  const vaccLabel = (s) => s==="done"?"✓ Done":s==="due"?"⏰ Due":"✕ Missed";

  return (
    <div style={S.wrap}>
      {/* ── SIDEBAR ── */}
      <div style={S.sid}>
        {/* Patient */}
        <div style={S.sidTop}>
          <div style={S.av}>{(patient?.name||"P").slice(0,2).toUpperCase()}</div>
          <div style={{overflow:"hidden"}}>
            <div style={S.ptName}>{patient?.name || "Patient Name"}</div>
            <div style={S.ptSub}>
              {[patient?.gender, patient?.age&&patient.age+"y", patient?.mrn&&"MRN-"+patient.mrn].filter(Boolean).join(" · ") || "Patient details"}
            </div>
          </div>
        </div>

        {/* Doctor info */}
        <div style={S.sidSec}>
          <div style={{fontSize:"10px",color:"#94a3b8",fontWeight:600,marginBottom:"3px"}}>{doctor?.name || "Doctor"}</div>
          <div style={{fontSize:"10px",color:"#0f766e",fontWeight:700}}>{dept.label}</div>
        </div>

        {/* Alerts */}
        <div style={S.sidSec}>
          <div style={S.sidLbl}>Alerts</div>
          {patient?.conditions?.map(c=>(
            <span key={c} style={S.alPill("r")}>{c}</span>
          ))}
          {patient?.allergies?.map(a=>(
            <span key={a} style={S.alPill("a")}>⚠ {a} allergy</span>
          ))}
          {!patient?.conditions?.length && !patient?.allergies?.length &&
            <span style={{fontSize:"10px",color:"#475569"}}>No alerts</span>}
        </div>

        {/* Vitals */}
        <div style={S.sidSec}>
          <div style={S.sidLbl}>
            Vitals
            <span style={{fontSize:"9px",color:"#0f766e",cursor:"pointer",fontWeight:600}} onClick={()=>setVEdit(v=>!v)}>
              {vEdit ? "Done" : "Edit"}
            </span>
          </div>
          <div style={S.vg}>
            {vitals.map((v,i)=>(
              <div key={v.k} style={S.vb(vEdit)} onClick={()=>{}}>
                <div style={S.vv}>
                  {vEdit
                    ? <input defaultValue={v.v} onChange={e=>updVital(i,e.target.value)}
                        style={{background:"transparent",border:"none",outline:"none",color:"#f1f5f9",fontSize:"12px",fontWeight:600,width:v.k==="BP"?"52px":"38px",fontFamily:"inherit"}}/>
                    : <span>{v.v}</span>}
                  <span style={{fontSize:"9px",color:"#64748b"}}>{v.u}</span>
                </div>
                <div style={S.vn}>{v.k}</div>
                {v.flag==="r"&&<div style={{fontSize:"9px",color:"#fca5a5",fontWeight:600}}>↑ High</div>}
                {v.flag==="a"&&<div style={{fontSize:"9px",color:"#fcd34d",fontWeight:600}}>↑ High</div>}
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div style={S.hist}>
          <div style={{...S.sidLbl,marginBottom:"5px"}}>Visit history</div>
          {(patient?.visits||[]).map((v,i)=>(
            <div key={i} style={S.hi} onClick={()=>{ setRxList((v.rx||dept.rx).map(r=>[...r])); showToast("Last Rx loaded ✓"); }}>
              <div style={S.hiDate}>{v.date}</div>
              <div style={S.hiDiag}>{v.diagnosis}</div>
              <div style={S.hiRx}>{v.rx_summary}</div>
            </div>
          ))}
          {/* fallback demo */}
          {(!patient?.visits||patient.visits.length===0)&&[
            {date:"Previous visit",diag:"Follow-up",rx:"Tap to load last Rx"},
          ].map((v,i)=>(
            <div key={i} style={S.hi} onClick={repeatRx}>
              <div style={S.hiDate}>{v.date}</div>
              <div style={S.hiDiag}>{v.diag}</div>
              <div style={S.hiRx}>{v.rx}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN SCROLL ── */}
      <div style={S.main}>
        <div style={S.scroll}>

          {/* ── S — SUBJECTIVE ── */}
          <div style={S.slbl}>S <span style={{fontSize:"9px",fontWeight:500,color:"#64748b"}}>Subjective — Complaint & History</span></div>

          <div style={S.card}>
            <div style={S.ch}>
              <div style={S.ct}>Chief complaint</div>
              <div style={{display:"flex",gap:"5px",alignItems:"center"}}>
                <input style={{...S.inp,width:"68px"}} placeholder="Since..." />
                <select style={{...S.sel,width:"80px"}}>
                  <option>Sudden</option><option>Gradual</option><option>Chronic</option>
                </select>
              </div>
            </div>
            <div style={S.cb}>
              <div style={S.chips}>
                {dept.complaints.map(c=>(
                  <span key={c} style={S.chip(selC.includes(c))} onClick={()=>tog(selC,setSelC,c)}>{c}</span>
                ))}
              </div>
              {/* Rx input mode toggle */}
              <div style={{display:"flex",gap:"4px",margin:"6px 0 4px"}}>
                <span style={{fontSize:"9px",color:"#64748b",fontWeight:600,alignSelf:"center"}}>Notes:</span>
                {["type","voice","short"].map(m=>(
                  <button key={m} style={S.modeBtn(rxMode===m)} onClick={()=>setRxMode(m)}>
                    {m==="type"?"✏ Type":m==="voice"?"🎤 Voice":"⚡ Shorthand"}
                  </button>
                ))}
              </div>
              {rxMode==="type" && (
                <textarea style={S.ta} value={complaintNote} onChange={e=>setComplaintNote(e.target.value)} placeholder="Additional complaint notes..." />
              )}
              {rxMode==="voice" && (
                <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                  <button style={{...S.btnWA,background:isListening?"#ef4444":"#22c55e",flex:1,justifyContent:"center"}} onClick={toggleVoice}>
                    {isListening?"⏹ Stop listening":"🎤 Start voice dictation"}
                  </button>
                  {complaintNote&&<span style={{fontSize:"10px",color:"#64748b"}}>✓ Captured</span>}
                </div>
              )}
              {rxMode==="short" && (
                <div>
                  <input style={S.inp} value={shorthandInput} onChange={e=>expandShorthand(e.target.value)}
                    placeholder="Type /htn, /dm, /fever, /bp, /uri and press Enter" onKeyDown={e=>e.key==="Enter"&&expandShorthand(shorthandInput)}/>
                  <div style={{fontSize:"10px",color:"#64748b",marginTop:"3px"}}>
                    Available: /htn · /dm · /fever · /bp · /uri
                  </div>
                  {complaintNote&&<textarea style={{...S.ta,marginTop:"4px"}} value={complaintNote} onChange={e=>setComplaintNote(e.target.value)}/>}
                </div>
              )}
            </div>
          </div>

          <div style={S.card}>
            <div style={S.ch}><div style={S.ct}>History</div></div>
            <div style={S.cb}>
              <textarea style={S.ta} value={historyNote} onChange={e=>setHistoryNote(e.target.value)} placeholder="Past / family / surgical / drug history..."/>
            </div>
          </div>

          {/* ── O — OBJECTIVE ── */}
          <div style={{...S.slbl,marginTop:"4px"}}>O <span style={{fontSize:"9px",fontWeight:500,color:"#64748b"}}>Objective — Examination & Investigations</span></div>

          <div style={S.card}>
            <div style={S.ch}><div style={S.ct}>Examination findings</div></div>
            <div style={S.cb}>
              <textarea style={S.ta} value={examNote} onChange={e=>setExamNote(e.target.value)} placeholder="General condition, CVS, RS, Abdomen, CNS..."/>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.ch}>
              <div style={S.ct}>Investigations</div>
              <div style={{display:"flex",gap:"3px"}}>
                {Object.keys(dept.inv).map(cat=>(
                  <button key={cat} style={S.ic(invCat===cat)} onClick={()=>setInvCat(cat)}>{cat}</button>
                ))}
              </div>
            </div>
            <div style={S.cb}>
              <div style={S.chips}>
                {(dept.inv[invCat]||[]).map(x=>(
                  <span key={x} style={S.chip(selI.includes(x))} onClick={()=>tog(selI,setSelI,x)}>{x}</span>
                ))}
                {(dept.inv[invCat]||[]).length===0&&<span style={{fontSize:"11px",color:"#94a3b8"}}>No items for this category</span>}
              </div>
            </div>
          </div>

          {/* ── A — ASSESSMENT ── */}
          <div style={{...S.slbl,marginTop:"4px"}}>A <span style={{fontSize:"9px",fontWeight:500,color:"#64748b"}}>Assessment — Diagnosis</span></div>

          <div style={S.row2}>
            <div style={S.card}>
              <div style={S.ch}><div style={S.ct}>Diagnosis</div></div>
              <div style={S.cb}>
                <div style={S.chips}>
                  {dept.diag.map(d=>(
                    <span key={d} style={S.chip(selD.includes(d))} onClick={()=>tog(selD,setSelD,d)}>{d}</span>
                  ))}
                </div>
                <textarea style={{...S.ta,marginTop:"5px"}} value={diagNote} onChange={e=>setDiagNote(e.target.value)} placeholder="Provisional / differential..."/>
              </div>
            </div>
            <div style={S.card}>
              <div style={S.ch}><div style={S.ct}>Vaccinations</div></div>
              <div style={{...S.cb,maxHeight:"130px",overflowY:"auto"}}>
                {dept.vacc.length===0&&<div style={{fontSize:"11px",color:"#94a3b8"}}>None tracked for this dept</div>}
                {dept.vacc.map(v=>(
                  <div key={v.n} style={S.vaccRow}>
                    <span>{v.n}</span>
                    <span style={{fontSize:"10px",fontWeight:600,color:vaccColor(v.s)}}>{vaccLabel(v.s)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── P — PLAN ── */}
          <div style={{...S.slbl,marginTop:"4px"}}>P <span style={{fontSize:"9px",fontWeight:500,color:"#64748b"}}>Plan — Rx, Advice & Follow-up</span></div>

          <div style={S.card}>
            <div style={S.ch}>
              <div style={S.ct}>Prescription (Rx)</div>
              <div style={{display:"flex",gap:"4px"}}>
                <button style={S.repRx} onClick={repeatRx}>↺ Repeat last</button>
                <button style={S.addRx} onClick={addRx}>+ Add</button>
              </div>
            </div>
            <div style={S.cb}>
              <div style={S.rxh}>
                <div style={{...S.rh,paddingLeft:"8px"}}>Medicine</div>
                <div style={S.rh}>Dose</div>
                <div style={S.rh}>Frequency</div>
                <div style={S.rh}>Duration</div>
                <div/>
              </div>
              {rxList.map((r,i)=>(
                <div key={i} style={S.rxg}>
                  <div style={{position:"relative"}}>
                    <input style={S.inp} value={r[0]} placeholder="Medicine name"
                      onChange={e=>medSuggest(i,e.target.value)}/>
                    {suggestions[i]&&(
                      <div style={S.acDrop}>
                        {suggestions[i].map(m=>(
                          <div key={m} style={S.acItem} onClick={()=>pickMed(i,m)}
                            onMouseOver={e=>e.currentTarget.style.background="#f0fdfa"}
                            onMouseOut={e=>e.currentTarget.style.background=""}>{m}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input style={S.inp} value={r[1]} placeholder="Dose" onChange={e=>updRx(i,1,e.target.value)}/>
                  <select style={S.sel} value={r[2]} onChange={e=>updRx(i,2,e.target.value)}>
                    <option value="">Frequency...</option>
                    {FREQ_OPTIONS.map(f=><option key={f}>{f}</option>)}
                  </select>
                  <select style={S.sel} value={r[3]} onChange={e=>updRx(i,3,e.target.value)}>
                    <option value="">Duration...</option>
                    {DUR_OPTIONS.map(d=><option key={d}>{d}</option>)}
                  </select>
                  <button style={S.del} onClick={()=>delRx(i)} title="Remove">✕</button>
                </div>
              ))}
            </div>
          </div>

          <div style={S.row2}>
            <div style={S.card}>
              <div style={S.ch}><div style={S.ct}>Advice to patient</div></div>
              <div style={S.cb}>
                <div style={S.chips}>
                  {dept.advice.map(a=>(
                    <span key={a} style={S.chip(selA.includes(a))} onClick={()=>tog(selA,setSelA,a)}>{a}</span>
                  ))}
                </div>
                <textarea style={{...S.ta,marginTop:"5px"}} value={adviceNote} onChange={e=>setAdviceNote(e.target.value)} placeholder="Additional advice..."/>
              </div>
            </div>
            <div style={S.card}>
              <div style={S.ch}><div style={S.ct}>Procedure done</div></div>
              <div style={S.cb}>
                <div style={S.chips}>
                  {dept.proc.map(p=>(
                    <span key={p} style={S.chip(selP.includes(p))} onClick={()=>tog(selP,setSelP,p)}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.ch}><div style={S.ct}>Follow-up & Reminder</div></div>
            <div style={S.cb}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginBottom:"5px"}}>
                <div>
                  <div style={S.lbl}>Date</div>
                  <input type="date" style={S.inp} value={fuDate} onChange={e=>setFuDate(e.target.value)}/>
                </div>
                <div>
                  <div style={S.lbl}>Quick set</div>
                  <select style={S.sel} onChange={e=>setFuQuick(e.target.value)}>
                    <option value="">Pick...</option>
                    <option value="3">3 days</option>
                    <option value="7">1 week</option>
                    <option value="14">2 weeks</option>
                    <option value="30">1 month</option>
                    <option value="90">3 months</option>
                  </select>
                </div>
                <div>
                  <div style={S.lbl}>WA Reminder</div>
                  <select style={S.sel} value={fuReminder} onChange={e=>setFuReminder(e.target.value)}>
                    <option>Day before</option>
                    <option>Same day</option>
                    <option>Off</option>
                  </select>
                </div>
              </div>
              <input style={S.inp} value={fuNote} onChange={e=>setFuNote(e.target.value)} placeholder="Instructions e.g. Bring HbA1c report"/>
            </div>
          </div>

        </div>{/* end scroll */}

        {/* ── ACTION BAR ── */}
        <div style={S.ab}>
          <div style={{display:"flex",gap:"5px"}}>
            <button style={S.btnG} onClick={()=>window.print()}>🖨 Print</button>
            <button style={S.btnG} onClick={()=>showToast("Lab form ready")}>🧪 Labs</button>
            <button style={S.btnG} onClick={()=>showToast("Upload ready")}>📎 Report</button>
          </div>
          <button style={S.btnS} onClick={handleSaveAndSend} disabled={submitting}>
            {submitting ? "Saving..." : "Save and Send Rx"}
          </button>
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{...S.toast,opacity:toast?1:0}}>{toast}</div>
      )}
    </div>
  );
}
