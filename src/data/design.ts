/* ============================================================
   DT-CIS · Phase 1 System Design — Document Data
   All content below is the deliverable itself: honest, scoped,
   and defensible. No datasets, metrics, or claims are fabricated.
   ============================================================ */

export const DOC_META = {
  code: "DT-CIS",
  docNo: "DT-CIS-SD-001",
  rev: "REV H",
  sheet: "08 / 08",
  phase: "PHASE 8 — CAREER RECOMMENDATION",
  scale: "SCALE N/A",
  prepared: "Prepared by: Student ML Engineer (Final Year)",
  reviewed: "Review: Academic Supervisor",
  date: "Academic Year 2025 / 2026",
};

export const STATS = [
  { value: 16, label: "Functional modules", suffix: "" },
  { value: 12, label: "Application pages", suffix: "" },
  { value: 14, label: "Database tables", suffix: "" },
  { value: 18, label: "Delivery phases", suffix: "" },
  { value: 6, label: "Model candidates", suffix: "" },
  { value: 14, label: "Weeks est. effort", suffix: "~" },
];

/* ---------- 01 · Problem statement ---------- */
export const PROBLEM = {
  headline:
    "Students steer once-in-a-decade career decisions with thin evidence and opaque tools.",
  paragraphs: [
    "An undergraduate chooses a specialization using a handful of grades, a vague sense of their own abilities, and occasional advice. Meanwhile, the career-recommendation tools aimed at them usually compress this complexity into a one-time quiz that returns a single, unexplained score — presented with a confidence the underlying method cannot justify.",
    "The gap is not a lack of algorithms. It is the absence of a transparent decision-support system that (a) maintains a continuously updated, structured digital representation of the student — a digital twin; (b) derives career compatibility, skill gaps and learning priorities from documented models and rules; (c) explains every output in terms of the student's own data; and (d) lets the student explore “what would change if I improved X?” without ever pretending to predict the future.",
  ],
  question:
    "How can we build an explainable, continuously updated digital twin of a student that produces defensible career compatibility, skill-gap and learning recommendations — while stating clearly what it does and does not know?",
};

/* ---------- 02 · Objectives ---------- */
export const MAIN_OBJECTIVE =
  "Design and implement an explainable decision-support system that maintains a dynamic digital twin of a student and produces interpretable career compatibility, skill-gap, learning-path and project recommendations — including what-if simulation — grounded in documented data and honest uncertainty.";

export const OBJECTIVES: { id: string; text: string; measure: string }[] = [
  { id: "O-1", text: "Define and persist a normalized Digital Twin schema covering academic, skill, behavioral, experience, interest and goal dimensions.", measure: "Schema review + CRUD in SQLite" },
  { id: "O-2", text: "Train and compare supervised models for occupation classification with a documented proxy-label strategy.", measure: "5-fold CV; macro-F1, ROC-AUC, confusion matrix" },
  { id: "O-3", text: "Derive data-derived student profiles via clustering with statistical justification of k.", measure: "Elbow + silhouette; PCA visualization" },
  { id: "O-4", text: "Compute career compatibility with a documented hybrid of model probability and weighted skill coverage.", measure: "Methodology doc + unit tests" },
  { id: "O-5", text: "Build a skill-gap engine that prioritizes gaps by career weight × shortfall × prerequisite readiness.", measure: "Ranking tests on fixed profiles" },
  { id: "O-6", text: "Build a justification-first learning and project recommender.", measure: "Every recommendation carries a machine-checkable reason" },
  { id: "O-7", text: "Implement rule+dictionary NLP extraction for resumes and job descriptions with graceful failure.", measure: "Extraction report shows confidence + misses" },
  { id: "O-8", text: "Provide per-decision explanations (feature contributions) for the primary model.", measure: "SHAP (tree) or documented surrogate" },
  { id: "O-9", text: "Deliver the what-if simulator, timeline, readiness indicators and the 12-page Streamlit app.", measure: "Working demo + test suite + report" },
];

/* ---------- 03 · Target users ---------- */
export const USERS = [
  {
    code: "U-1",
    who: "The student (primary)",
    detail: "Final-year CS / ML undergraduate — the builder is also the user. Uses the twin daily: updates skills, checks compatibility, plans the next learning step, runs simulations before committing effort.",
    needs: ["Explainable scores", "Actionable next steps", "Progress over time"],
  },
  {
    code: "U-2",
    who: "Academic advisor (secondary)",
    detail: "Reviews a student's twin during advising sessions: compares readiness indicators, inspects the evidence behind a recommendation, corrects inaccurate records.",
    needs: ["Audit trail", "Editable records", "Limitation notes"],
  },
  {
    code: "U-3",
    who: "Project supervisor (evaluator)",
    detail: "Audits scientific validity: dataset documentation, evaluation methodology, leakage checks, honesty of claims. The system must survive this review — it is the defense audience.",
    needs: ["Model cards", "Reproducible runs", "Honest framing"],
  },
];

/* ---------- 04 · Features ---------- */
export type Layer = "DATA" | "ML" | "NLP" | "REC" | "APP";
export interface Feature {
  id: string;
  name: string;
  layer: Layer;
  priority: "MUST" | "SHOULD" | "COULD";
  phase: number;
  summary: string;
  mlTask: string;
  honesty: string;
}

export const FEATURES: Feature[] = [
  { id: "F-01", name: "Digital Twin Profile", layer: "DATA", priority: "MUST", phase: 14, summary: "Mutable, versioned student representation: grades, attendance, 12+ technical skills, behavior, projects, certifications, interests, goals.", mlTask: "Feature engineering source", honesty: "Self-reported inputs are labeled as such; confidence scales with completeness." },
  { id: "F-02", name: "Career Intelligence Engine", layer: "ML", priority: "MUST", phase: 8, summary: "Compatibility across 12 career profiles via documented hybrid: model probability + weighted skill coverage against career requirement vectors.", mlTask: "Supervised classification + rule scoring", honesty: "Scores are compatibility, not employability." },
  { id: "F-03", name: "Student Personas (clustering)", layer: "ML", priority: "SHOULD", phase: 7, summary: "K-Means over standardized skill/behavior features; k justified by elbow + silhouette; PCA 2-D map.", mlTask: "Unsupervised clustering", honesty: "Profiles are data-derived, not psychological types." },
  { id: "F-04", name: "Skill Gap Intelligence", layer: "REC", priority: "MUST", phase: 9, summary: "Per-career gap table: current vs target level, weighted shortfall, prerequisite-aware priority ranking.", mlTask: "Rule engine on feature vectors", honesty: "Target levels come from documented career-requirement data, not opinion." },
  { id: "F-05", name: "Learning Recommender", layer: "REC", priority: "MUST", phase: 10, summary: "Ranks skills → topics → resources by gap weight and prerequisite readiness; every item ships with a generated justification.", mlTask: "Content-based hybrid", honesty: "Resources are curated and marked; no fake personalization." },
  { id: "F-06", name: "Project Recommender", layer: "REC", priority: "MUST", phase: 10, summary: "Suggests portfolio projects matched to skill level and target career, with difficulty rating and fit explanation.", mlTask: "Content-based matching", honesty: "Difficulty ratings are heuristic and labeled." },
  { id: "F-07", name: "Resume NLP Analyzer", layer: "NLP", priority: "MUST", phase: 11, summary: "spaCy + skill dictionary extracts skills, education, projects, certifications; normalizes to the twin schema; diffs resume vs twin.", mlTask: "Information extraction (rule + statistical)", honesty: "Extraction confidence shown; misses surfaced, never hidden." },
  { id: "F-08", name: "Grounded Career Advisor", layer: "NLP", priority: "SHOULD", phase: 12, summary: "Template-grounded Q&A over the twin: “why this career?”, “what am I missing?”, “what if I improve X?”. Answers cite the actual numbers.", mlTask: "Intent parsing + slot filling", honesty: "Not an LLM. Cannot invent student facts it does not store." },
  { id: "F-09", name: "What-If Simulator", layer: "ML", priority: "MUST", phase: 15, summary: "Adjust hypothetical skill levels; system recomputes compatibility deltas with before/after tables.", mlTask: "Deterministic re-scoring", honesty: "Scenario simulation — explicitly not a future prediction." },
  { id: "F-10", name: "Career Path Graph", layer: "APP", priority: "SHOULD", phase: 16, summary: "Interactive map of career prerequisites; highlights current position, reachable roles and missing prerequisites.", mlTask: "Graph rendering on requirement data", honesty: "Paths encode documented prerequisites, not guaranteed ladders." },
  { id: "F-11", name: "Explainable AI Layer", layer: "ML", priority: "MUST", phase: 13, summary: "Per-prediction positive/negative feature contributions via SHAP for tree models; global importance dashboard.", mlTask: "Post-hoc explainability", honesty: "SHAP explains the model, not the world." },
  { id: "F-12", name: "Readiness Indicators", layer: "ML", priority: "MUST", phase: 14, summary: "Five separately computed indicators (career, technical, academic, portfolio, coverage) — each with a published formula.", mlTask: "Weighted composite metrics", honesty: "No single magical “AI score”." },
  { id: "F-13", name: "Twin Timeline & Progress", layer: "DATA", priority: "MUST", phase: 14, summary: "Every profile mutation is journaled; skill growth and compatibility drift visualized over time.", mlTask: "—", honesty: "Trends describe the record, not the person." },
  { id: "F-14", name: "Portfolio Intelligence", layer: "REC", priority: "SHOULD", phase: 10, summary: "Scores each student project on tech breadth, ML relevance, difficulty and career alignment; answers “what to build next”.", mlTask: "Weighted scoring", honesty: "Heuristic rubric, weights published." },
  { id: "F-15", name: "Job Description Matcher", layer: "NLP", priority: "MUST", phase: 12, summary: "Paste a JD → extract required/preferred skills → match against twin → gap report + suggested prep actions.", mlTask: "Keyword extraction + set matching", honesty: "Match ≠ hiring probability. Stated in UI." },
  { id: "F-16", name: "Model Monitoring", layer: "APP", priority: "COULD", phase: 17, summary: "Prediction log, model version stamps, evaluation snapshots, simple drift checks on feature distributions, retraining runbook.", mlTask: "MLOps-lite", honesty: "Documented deployment plan, not a production claim." },
];

/* ---------- 05 · ML/DL/NLP components ---------- */
export const MODELS = [
  { name: "Logistic Regression", family: "Linear baseline", role: "Interpretable baseline; reference bar every other model must beat.", evidence: "Coefficients double as global explanation; calibration check." },
  { name: "Random Forest", family: "Ensemble (bagging)", role: "Primary candidate — robust on small tabular data, native importances, SHAP-compatible.", evidence: "Expected strong macro-F1; low leakage risk with CV." },
  { name: "Gradient Boosting (sklearn)", family: "Ensemble (boosting)", role: "Second candidate; tests whether boosting beats bagging on this data.", evidence: "Compared on identical CV splits." },
  { name: "XGBoost", family: "Ensemble (boosting)", role: "Included only if sklearn GB shows promise; otherwise dropped to reduce surface.", evidence: "Conditional inclusion = honest scope control." },
  { name: "Linear SVM", family: "Margin classifier", role: "Baseline for high-dimensional skill vectors.", evidence: "Useful when features >> samples." },
  { name: "MLP (PyTorch)", family: "Deep learning", role: "DL representative — kept only if CV evidence justifies it over trees.", evidence: "If it underperforms, that result is reported, not hidden." },
];

export const ML_PIPELINE = [
  { step: "Proxy labeling", note: "No public dataset maps students → realized careers. Occupation labels come from job-posting/resume corpora; the mapping and its limits are documented in a model card." },
  { step: "Splitting & CV", note: "Holdout test set touched once. 5-fold stratified CV for selection. No target-derived features (leakage checklist enforced)." },
  { step: "Metrics", note: "Accuracy, precision, recall, macro-F1, ROC-AUC (one-vs-rest), confusion matrix. Selection by macro-F1 + calibration, not by complexity." },
  { step: "Clustering", note: "StandardScaler → K-Means (k = 2..8) → elbow + silhouette → PCA 2-D projection. Clusters labeled descriptively after inspection." },
  { step: "Explainability", note: "SHAP TreeExplainer on the selected tree model; for non-tree winners, a documented surrogate (permutation importance + partial dependence)." },
];

/* ---------- 06 · Datasets ---------- */
export const DATASETS = [
  {
    name: "UCI Student Performance (Cortez & Almeida, 2014)",
    source: "UCI ML Repository",
    license: "CC BY 4.0 (verify on download)",
    records: "≈ 649 students × 2 subjects",
    use: "Academic-twin features: grades, absences, study time, family/behavior context; grade-trend modeling.",
    limits: "Secondary-school population; Portuguese context; no career labels. Used for academic dimensions only.",
  },
  {
    name: "Job-posting / job-recommendation corpora (Kaggle)",
    source: "Kaggle — several candidates",
    license: "MUST be verified per dataset before use",
    records: "10k–300k postings (varies)",
    use: "Proxy labels: occupation ↔ required-skill co-occurrence → career requirement vectors + supervised targets.",
    limits: "Self-reported titles, noisy requirements, geographic bias. Cleaning decisions documented.",
  },
  {
    name: "ESCO Skills & Occupations taxonomy",
    source: "EU ESCO (European Commission)",
    license: "Open (CC BY 4.0)",
    records: "≈ 13.5k skills, ≈ 3k occupations",
    use: "Skill normalization dictionary (aliases → canonical skills) and structured career requirements.",
    limits: "European labor-market framing; needs trimming to the 12 target tech careers.",
  },
  {
    name: "O*NET occupational data",
    source: "US Dept. of Labor (O*NET OnLine)",
    license: "Public domain",
    records: "≈ 1,000 occupations with skill ratings",
    use: "Cross-validation of career skill-weight vectors (independent second source).",
    limits: "US-centric; coarse granularity for niche ML roles.",
  },
  {
    name: "Resume / CV corpora (Kaggle)",
    source: "Kaggle — several candidates",
    license: "MUST be verified; many are scraped — caution",
    records: "Varies (hundreds to tens of thousands)",
    use: "NLP extractor development and evaluation; realistic noisy text for the analyzer.",
    limits: "PII must be stripped; license risk → fallback to synthetic-but-labeled test resumes generated with declared rules.",
  },
];

export const DATA_HONESTY =
  "No single public dataset maps a student profile to a realized career. The documented mitigation: proxy labels from job corpora, requirement vectors triangulated from ESCO + O*NET, and a model card stating exactly what the model was trained to predict. If a dataset fails license verification, it is excluded and the fallback is reported — never quietly replaced with invented data.";

/* ---------- 07 · Architecture ---------- */
export interface ArchLayer {
  code: string;
  name: string;
  tech: string;
  boxes: string[];
  note: string;
}

export const ARCHITECTURE: ArchLayer[] = [
  { code: "L1", name: "Presentation", tech: "Streamlit · Plotly", boxes: ["Dashboard", "Digital Twin", "Career Intelligence", "Skill Intelligence", "Roadmap", "Projects", "Resume", "Job Match", "Simulator", "XAI", "Progress", "Models"], note: "12 pages. Streamlit chosen for solo velocity; Plotly for interactive charts. No custom frontend framework — out of scope, on record." },
  { code: "L2", name: "Application services", tech: "Python modules", boxes: ["Profile service", "Scoring service", "Simulation service", "Session & audit"], note: "Pure-Python services with unit tests. The only layer the UI may call." },
  { code: "L3", name: "ML services", tech: "scikit-learn · XGBoost? · SHAP · spaCy", boxes: ["Career prediction", "Clustering", "Skill-gap engine", "Recommender", "NLP extraction", "Explainability"], note: "Each service loads pinned artifacts (joblib/JSON) and exposes one well-tested function surface." },
  { code: "L4", name: "Persistence & artifacts", tech: "SQLite · joblib · JSON configs", boxes: ["students", "skills", "careers", "predictions", "simulation_runs", "audit_log", "models/*.joblib", "configs/*.json"], note: "SQLite is justified: single user, local, zero ops. PostgreSQL listed only as a scaling note." },
];

export const ARCH_NOTES = [
  { k: "FastAPI — deferred", v: "An API layer earns its keep only when a second client exists. Shipping it now is résumé-driven development; the design leaves a clean seam for it." },
  { k: "No microservices", v: "One process, six service modules. Splitting a student project across containers buys failure modes, not architecture." },
  { k: "Artifact pinning", v: "Every model file carries its training data hash, CV metrics and version — the prediction log references them." },
];

/* ---------- 08 · Database ---------- */
export interface DbTable {
  name: string;
  group: string;
  cols: { n: string; t: string; k?: "PK" | "FK" | "UQ" }[];
}

export const DB_TABLES: DbTable[] = [
  { name: "students", group: "CORE", cols: [{ n: "student_id", t: "INT", k: "PK" }, { n: "display_name", t: "TEXT" }, { n: "program", t: "TEXT" }, { n: "year", t: "INT" }, { n: "target_career_id", t: "INT", k: "FK" }, { n: "created_at", t: "TS" }] },
  { name: "skills", group: "CORE", cols: [{ n: "skill_id", t: "INT", k: "PK" }, { n: "canonical_name", t: "TEXT", k: "UQ" }, { n: "aliases", t: "JSON" }, { n: "category", t: "TEXT" }] },
  { name: "student_skills", group: "CORE", cols: [{ n: "student_id", t: "INT", k: "FK" }, { n: "skill_id", t: "INT", k: "FK" }, { n: "level_0_100", t: "INT" }, { n: "source", t: "TEXT" }, { n: "updated_at", t: "TS" }] },
  { name: "careers", group: "CAREER", cols: [{ n: "career_id", t: "INT", k: "PK" }, { n: "title", t: "TEXT" }, { n: "family", t: "TEXT" }, { n: "esco_uri", t: "TEXT" }] },
  { name: "career_requirements", group: "CAREER", cols: [{ n: "career_id", t: "INT", k: "FK" }, { n: "skill_id", t: "INT", k: "FK" }, { n: "weight", t: "REAL" }, { n: "target_level", t: "INT" }, { n: "prereq_skill_id", t: "INT", k: "FK" }] },
  { name: "grades", group: "ACADEMIC", cols: [{ n: "grade_id", t: "INT", k: "PK" }, { n: "student_id", t: "INT", k: "FK" }, { n: "course", t: "TEXT" }, { n: "term", t: "TEXT" }, { n: "score", t: "REAL" }, { n: "kind", t: "TEXT" }] },
  { name: "attendance", group: "ACADEMIC", cols: [{ n: "student_id", t: "INT", k: "FK" }, { n: "term", t: "TEXT" }, { n: "attended", t: "INT" }, { n: "total", t: "INT" }] },
  { name: "projects", group: "PORTFOLIO", cols: [{ n: "project_id", t: "INT", k: "PK" }, { n: "title", t: "TEXT" }, { n: "difficulty", t: "INT" }, { n: "ml_relevance", t: "REAL" }] },
  { name: "student_projects", group: "PORTFOLIO", cols: [{ n: "student_id", t: "INT", k: "FK" }, { n: "project_id", t: "INT", k: "FK" }, { n: "status", t: "TEXT" }, { n: "tech", t: "JSON" }] },
  { name: "certifications", group: "PORTFOLIO", cols: [{ n: "cert_id", t: "INT", k: "PK" }, { n: "student_id", t: "INT", k: "FK" }, { n: "name", t: "TEXT" }, { n: "issuer", t: "TEXT" }, { n: "year", t: "INT" }] },
  { name: "learning_history", group: "TWIN", cols: [{ n: "entry_id", t: "INT", k: "PK" }, { n: "student_id", t: "INT", k: "FK" }, { n: "topic", t: "TEXT" }, { n: "hours", t: "REAL" }, { n: "completed", t: "BOOL" }] },
  { name: "predictions", group: "ML", cols: [{ n: "pred_id", t: "INT", k: "PK" }, { n: "student_id", t: "INT", k: "FK" }, { n: "model_version", t: "TEXT" }, { n: "scores", t: "JSON" }, { n: "explanation", t: "JSON" }, { n: "created_at", t: "TS" }] },
  { name: "simulation_runs", group: "ML", cols: [{ n: "run_id", t: "INT", k: "PK" }, { n: "student_id", t: "INT", k: "FK" }, { n: "baseline", t: "JSON" }, { n: "scenario", t: "JSON" }, { n: "delta", t: "JSON" }] },
  { name: "audit_log", group: "ML", cols: [{ n: "log_id", t: "INT", k: "PK" }, { n: "actor", t: "TEXT" }, { n: "action", t: "TEXT" }, { n: "payload", t: "JSON" }, { n: "ts", t: "TS" }] },
];

/* ---------- 09 · Stack ---------- */
export const STACK = [
  { group: "Core", items: [{ n: "Python 3.11", r: "single language, end to end" }, { n: "pandas · NumPy", r: "feature tables, vectors" }] },
  { group: "Machine learning", items: [{ n: "scikit-learn", r: "models, CV, metrics, K-Means, PCA" }, { n: "XGBoost", r: "conditional on CV evidence" }, { n: "PyTorch", r: "MLP baseline only, if justified" }] },
  { group: "NLP", items: [{ n: "spaCy (sm model)", r: "tokenization, entities" }, { n: "Custom skill dictionary", r: "alias normalization — the honest workhorse" }] },
  { group: "Explainability", items: [{ n: "SHAP", r: "TreeExplainer for tree winners" }] },
  { group: "Application", items: [{ n: "Streamlit", r: "12-page app, solo velocity" }, { n: "Plotly", r: "interactive charts, career graph" }] },
  { group: "Data & QA", items: [{ n: "SQLite", r: "local persistence, zero ops" }, { n: "joblib · JSON configs", r: "pinned artifacts" }, { n: "pytest", r: "logic tests incl. recommenders" }, { n: "Git + GitHub", r: "history = evidence" }] },
];

export const NON_CHOICES = [
  { n: "Docker / Kubernetes", r: "no deployment target exists for this project" },
  { n: "Microservices / FastAPI now", r: "no second client; seam left instead" },
  { n: "LLM APIs for the advisor", r: "a grounded template engine is defensible; an LLM can hallucinate student facts" },
  { n: "PostgreSQL", r: "single local user — SQLite is the correct size" },
  { n: "Fabricated datasets", r: "never. Documented fallbacks instead" },
];

/* ---------- 10 · Difficulty ---------- */
export const DIFFICULTY = [
  { part: "Data acquisition & schema design", diff: 3, weeks: 2.0, hard: "License verification, schema matching across sources", fix: "Document-or-exclude rule; schema map approved in Phase 2" },
  { part: "Supervised career models + CV", diff: 3, weeks: 2.0, hard: "Small n, proxy-label noise", fix: "Baselines first; report intervals, not point estimates" },
  { part: "Clustering personas", diff: 2, weeks: 1.0, hard: "Choosing k without over-interpreting", fix: "Elbow + silhouette; descriptive labels only" },
  { part: "Skill-gap + recommenders", diff: 2, weeks: 1.5, hard: "Justification quality", fix: "Unit tests that assert reasons cite real numbers" },
  { part: "NLP resume / JD extraction", diff: 4, weeks: 2.0, hard: "Messy real-world text", fix: "Dictionary-first, spaCy-second; show confidence" },
  { part: "Explainability (SHAP)", diff: 3, weeks: 1.0, hard: "Explaining without overclaiming", fix: "Model card wording reviewed with supervisor" },
  { part: "Simulator + timeline", diff: 2, weeks: 1.0, hard: "Keeping it read-only & honest", fix: "Scenarios never overwrite the twin" },
  { part: "Streamlit app — 12 pages", diff: 3, weeks: 2.5, hard: "Scope creep", fix: "Feature ledger frozen after Phase 1" },
  { part: "Tests, report, defense pack", diff: 2, weeks: 2.0, hard: "Viva questions on validity", fix: "Limitations section written early, not last" },
];

export const DIFFICULTY_SUMMARY =
  "Overall: upper-undergraduate difficulty, ≈ 14 focused weeks. The hard part is not the mathematics — it is data validity and scope discipline. That is exactly where the risk register focuses.";

/* ---------- 11 · Risks ---------- */
export interface Risk {
  id: string;
  title: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  detail: string;
  mitigation: string;
}

export const RISKS: Risk[] = [
  { id: "R-1", title: "No ground-truth student→career labels", likelihood: 5, impact: 4, detail: "The supervised model can only learn proxy labels from job/resume corpora, so “career prediction” is really occupation classification from profile features.", mitigation: "Model card states the trained target explicitly; compatibility = hybrid score, not prophecy. Approved wording in Phase 2." },
  { id: "R-2", title: "Dataset license gaps", likelihood: 3, impact: 4, detail: "Some Kaggle corpora are scraped and lack clear licenses; using them could invalidate the deliverable.", mitigation: "Verify-before-use checklist; ESCO/O*NET/UCI as guaranteed-legal backbone; declared synthetic fallback." },
  { id: "R-3", title: "Overfitting on small tabular data", likelihood: 3, impact: 3, detail: "With hundreds of rows, a tuned XGBoost can memorize; CV numbers can flatter.", mitigation: "Nested CV for tuning, baselines as reference bars, report variance across folds." },
  { id: "R-4", title: "User over-trust in scores", likelihood: 3, impact: 5, detail: "A confident-looking 91% can be taken as a verdict about a person's future.", mitigation: "Every score carries uncertainty + limitation text; UI separates prediction from recommendation; ethics section enforceable, not decorative." },
  { id: "R-5", title: "Scope creep across 16 modules", likelihood: 4, impact: 3, detail: "The feature list is large; polishing everything risks shipping nothing.", mitigation: "MoSCoW priorities frozen here; MUST path = 10 modules; COULD items (monitoring) cut first." },
  { id: "R-6", title: "NLP extraction fragility", likelihood: 4, impact: 2, detail: "Resumes vary wildly; the extractor will miss things on unseen formats.", mitigation: "Graceful degradation: extraction report always shows what was found and what was not." },
  { id: "R-7", title: "Streamlit performance with SHAP", likelihood: 2, impact: 2, detail: "Per-prediction SHAP on every page load can stall the demo.", mitigation: "Precompute explanations at prediction time; cache in the predictions table." },
];

/* ---------- 12 · Ethics ---------- */
export const ETHICS = [
  { code: "E-1", title: "Decision support, never authority", body: "The system advises; the student decides. Every page states this. No ranking is presented as a verdict." },
  { code: "E-2", title: "No guarantees — of jobs or grades", body: "Compatibility scores estimate profile↔career fit against documented requirements. Employment depends on labor markets, interviews and luck, which no model here sees." },
  { code: "E-3", title: "Sensitive attributes excluded", body: "Gender, age, ethnicity, religion and nationality are not features. UCI demographics are used for description only, never as model inputs." },
  { code: "E-4", title: "Uncertainty made visible", body: "Scores ship with fold variance and data-completeness confidence. A twin with 3 skills gets a warning, not a number dressed up as certainty." },
  { code: "E-5", title: "User sovereignty over data", body: "Local SQLite, user-editable records, full audit log, delete-anytime. Nothing leaves the machine in the base system." },
  { code: "E-6", title: "Prediction ≠ recommendation", body: "“The model scores you 86% for Data Science” and “you should study SQL next” are different speech acts. The UI and the advisor keep them separate." },
  { code: "E-7", title: "Honest NLP", body: "Extraction results carry confidence and an explicit miss-list. The advisor cannot cite a student fact that is not stored." },
  { code: "E-8", title: "Model cards & limitations", body: "Every artifact ships with training data, metrics, intended use and known failure modes — written before the demo, not after." },
];

/* ---------- 13 · Differentiation ---------- */
export const DIFF_ROWS: { aspect: string; typical: string; this_: string }[] = [
  { aspect: "Input", typical: "One-time quiz answers", this_: "A living twin: grades, skills, projects, behavior — versioned over time" },
  { aspect: "Output", typical: "A single career label", this_: "Compatibility distributions across 12 careers with drivers" },
  { aspect: "Transparency", typical: "Black box, if any model exists", this_: "SHAP contributions + published formulas for every indicator" },
  { aspect: "Time dimension", typical: "Static snapshot", this_: "Timeline of skill growth and compatibility drift" },
  { aspect: "Actionability", typical: "“You should be a Data Scientist”", this_: "Prioritized gaps → learning sequence → projects → JD match" },
  { aspect: "Counterfactuals", typical: "None", this_: "What-If simulator with before/after deltas, labeled as scenarios" },
  { aspect: "Evidence trail", typical: "None", this_: "Audit log, prediction log, pinned model artifacts" },
  { aspect: "Honesty contract", typical: "Scores presented as truth", this_: "Uncertainty, limitations and decision-support framing in the UI" },
];

/* ---------- 14 · Roadmap ---------- */
export interface Phase {
  n: number;
  stage: string;
  name: string;
  weeks: string;
  deliverable: string;
  exit: string;
}

export const PHASES: Phase[] = [
  { n: 1, stage: "Foundations", name: "System Design", weeks: "done", deliverable: "This document: problem, objectives, features, architecture, schema, stack, risks, ethics.", exit: "Supervisor approval — PASSED at gate G-1" },
  { n: 2, stage: "Foundations", name: "Data", weeks: "done", deliverable: "REV B: ten dataset dossiers with verdicts, proxy-label policy, synthetic cohort protocol, schema-matching plan S1–S6.", exit: "Registered at gate G-2 — 4 adopted · 4 conditional · 2 rejected · 1 build" },
  { n: 3, stage: "Foundations", name: "EDA", weeks: "done", deliverable: "REV C: the EDA contract — six work packages, the 33-attribute ledger, the leakage log, the balance protocol.", exit: "No silent column drops — pre-committed. PASSED at gate G-3" },
  { n: 4, stage: "Foundations", name: "Preprocessing", weeks: "done", deliverable: "REV D: ColumnTransformer composition, fit discipline, leakage tests as code, twin input validator.", exit: "Leakage checklist executable; pipeline reproducible. PASSED at gate G-4" },
  { n: 5, stage: "Models", name: "Baseline models", weeks: "done", deliverable: "REV E: baseline harness code, blank results template, confusion-matrix lab, ROC worked example, evidence chain.", exit: "Harness + metric machinery on record. PASSED at gate G-5" },
  { n: 6, stage: "Models", name: "Advanced ML", weeks: "done", deliverable: "REV F: candidate grid with conditional gates, nested-CV protocol, evidence rules R-1..R-5, model-card anatomy.", exit: "Selection machinery decided before Run 002; null-result clause signed. PASSED at gate G-6" },
  { n: 7, stage: "Models", name: "Student clustering", weeks: "done", deliverable: "REV G: k-selection protocol (elbow + silhouette + 10-seed stability), naming protocol, guardrails, live k-means methodology demo.", exit: "k earned by evidence; labels descriptive, never psychological. PASSED at gate G-7" },
  { n: 8, stage: "Intelligence", name: "Career recommendation", weeks: "now", deliverable: "REV H: frozen four-term scoring equation, 12 career weight vectors, live decomposition engine, explainability contract.", exit: "Every score argues for itself; missing evidence renormalized, never faked ← THIS DOCUMENT, awaiting G-8" },
  { n: 9, stage: "Intelligence", name: "Skill-gap engine", weeks: "0.5 wk", deliverable: "Weighted gap tables and priority ranking.", exit: "Ranking invariants tested" },
  { n: 10, stage: "Intelligence", name: "Recommendation engine", weeks: "1 wk", deliverable: "Learning + project + portfolio recommenders with justifications.", exit: "Every output carries a citable reason" },
  { n: 11, stage: "Intelligence", name: "NLP resume analyzer", weeks: "1.5 wk", deliverable: "spaCy + dictionary extractor; twin diff report.", exit: "Confidence + miss-list always rendered" },
  { n: 12, stage: "Intelligence", name: "JD matching", weeks: "0.5 wk", deliverable: "Job description parsing + match/gap report.", exit: "“Match ≠ hiring” disclaimer enforced in UI" },
  { n: 13, stage: "Intelligence", name: "Explainable AI", weeks: "1 wk", deliverable: "SHAP integration; global + local explanation views.", exit: "Explanations reference actual feature values" },
  { n: 14, stage: "Application", name: "Digital Twin & timeline", weeks: "1 wk", deliverable: "Versioned profile store, readiness indicators, progress views.", exit: "Formulas published in-app" },
  { n: 15, stage: "Application", name: "Future simulator", weeks: "0.5 wk", deliverable: "Scenario engine with before/after deltas; never writes to the twin.", exit: "Scenario labeling verified in UI" },
  { n: 16, stage: "Application", name: "Streamlit application", weeks: "1.5 wk", deliverable: "12 pages wired to services; career path graph; advisor.", exit: "Demo script runs end-to-end cold" },
  { n: 17, stage: "Application", name: "Testing", weeks: "1 wk", deliverable: "Data validation, model, UI and edge-case tests; security pass on uploads.", exit: "Suite green; failure modes documented" },
  { n: 18, stage: "Defense", name: "Finalization", weeks: "1 wk", deliverable: "README, technical report, architecture diagram, dataset docs, limitations, slides, viva Q&A.", exit: "Supervisor sign-off; defense-ready" },
];

export const STAGES = ["Foundations", "Models", "Intelligence", "Application", "Defense"];

/* ---------- schematic ---------- */
export interface TwinNode {
  id: string;
  label: string;
  side: "in" | "core" | "out";
  desc: string;
}

export const TWIN_NODES: TwinNode[] = [
  { id: "acad", label: "ACADEMIC", side: "in", desc: "Grades, GPA trend, attendance, exam vs assignment performance — the scholastic signal." },
  { id: "skills", label: "TECH SKILLS", side: "in", desc: "Python, SQL, ML, DL, statistics, web, cloud, security — self-assessed, level 0–100, source-tagged." },
  { id: "behav", label: "BEHAVIOR", side: "in", desc: "Study hours, cadence, project completion, preferred learning modes." },
  { id: "exp", label: "EXPERIENCE", side: "in", desc: "Projects, certifications, internships, competitions — the portfolio signal." },
  { id: "goals", label: "INTERESTS & GOALS", side: "in", desc: "Declared interests and target careers — used as priors, never as verdicts." },
  { id: "core", label: "DIGITAL TWIN", side: "core", desc: "A versioned, explainable feature vector of the student. Every mutation is journaled; every score can be traced back to these numbers." },
  { id: "career", label: "CAREER ML", side: "out", desc: "Supervised occupation model + weighted skill coverage → 12 compatibility scores with confidence." },
  { id: "cluster", label: "CLUSTERING", side: "out", desc: "K-Means personas: where this twin sits among data-derived student profiles." },
  { id: "gap", label: "SKILL GAP", side: "out", desc: "Current vs required levels per career, prioritized by weight × shortfall × readiness." },
  { id: "rec", label: "RECOMMENDER", side: "out", desc: "Learning sequence, projects and certifications — each with a citable justification." },
  { id: "nlp", label: "NLP", side: "out", desc: "Resume and job-description extraction with normalization, confidence and miss-lists." },
  { id: "xai", label: "XAI + SIM", side: "out", desc: "SHAP explanations and what-if scenario simulation. Explains the past inputs, simulates — never predicts — the future." },
];

/* ============================================================
   PHASE 2 — DATA · Document Data (REV B)
   Ten candidate sources evaluated. Verdicts: ADOPT = in, with a
   role; CONDITIONAL = in only if its license/limits hold up at
   intake; REJECT = legally or scientifically unusable; BUILD =
   generated by us, under a written protocol.
   ============================================================ */

export const REV_LEDGER = [
  { rev: "REV A", phase: "Phase 1 — System Design", status: "APPROVED", tone: "green" as const, note: "Gate G-1 passed. Design frozen; feature scope locked; risk register accepted." },
  { rev: "REV B", phase: "Phase 2 — Data", status: "APPROVED", tone: "green" as const, note: "Gate G-2 passed. Ten dataset verdicts on record; proxy policy signed; schema plan S1–S6 binding." },
  { rev: "REV C", phase: "Phase 3 — EDA", status: "APPROVED", tone: "green" as const, note: "Gate G-3 passed. EDA contract accepted: 33-attribute ledger, leakage log, balance protocol." },
  { rev: "REV D", phase: "Phase 4 — Preprocessing", status: "APPROVED", tone: "green" as const, note: "Gate G-4 passed. Pipeline composition accepted; leakage checklist executable; validator guards the twin." },
  { rev: "REV E", phase: "Phase 5 — Baseline Models", status: "APPROVED", tone: "green" as const, note: "Gate G-5 passed. Harness on record; results table blank by design; metric machinery taught by hand." },
  { rev: "REV F", phase: "Phase 6 — Advanced ML", status: "APPROVED", tone: "green" as const, note: "Gate G-6 passed. Candidate grid and evidence rules frozen; the champion will be chosen by Run 002, not by fashion." },
  { rev: "REV G", phase: "Phase 7 — Student Clustering", status: "APPROVED", tone: "green" as const, note: "Gate G-7 passed. Clustering stays descriptive: no personalities, no ranks, no destinies — protocol and naming rules signed." },
  { rev: "REV H", phase: "Phase 8 — Career Recommendation", status: "ISSUED", tone: "amber" as const, note: "Scoring equation, career weight vectors, live decomposition engine, explainability contract. Awaiting gate G-8." },
];

export type Verdict = "ADOPT" | "CONDITIONAL" | "REJECT" | "BUILD";

export interface DsCard {
  id: string;
  name: string;
  source: string;
  url: string;
  license: string;
  licenseOk: "OK" | "VERIFY" | "FAIL";
  records: string;
  features: string;
  target: string;
  missing: string;
  limits: string[];
  geo: string;
  role: string;
  verdict: Verdict;
  note: string;
}

export const DS_CARDS: DsCard[] = [
  {
    id: "D1",
    name: "UCI Student Performance",
    source: "UCI Machine Learning Repository · Cortez & Silva",
    url: "https://archive.ics.uci.edu/dataset/320/student+performance",
    license: "CC BY 4.0 — UCI standard; verified on the dataset page",
    licenseOk: "OK",
    records: "1,044 rows — math.csv (n=395) + por.csv (n=649), ≈382 overlapping students",
    features: "30 attributes — background (school, sex, age, Medu/Fedu, Mjob/Fjob, guardian), behavior (studytime, failures, absences, Walc, health, freetime), support flags (schoolsup, famsup, paid, internet), grade progression G1→G2→G3 on the 0–20 scale",
    target: "G3 final grade; binary pass/fail derivable at G3 ≥ 10",
    missing: "None declared — completeness asserted by the intake script, not assumed",
    limits: [
      "Portuguese secondary-school cohort (15–22) in algebra and language classes — not CS undergraduates",
      "No skills, projects or career fields — serves the academic dimension only",
      "Family/behavior attributes are context: described in EDA, excluded from model inputs (ethics E-3)",
    ],
    geo: "Portugal, 2007–08 — education-system distance recorded on the card",
    role: "Calibration source for the twin's academic dimension: grade-trend features (G1→G3 deltas), absence patterns, study-behavior encodings.",
    verdict: "ADOPT",
    note: "The backbone of the academic twin. Used for features and EDA — never for career labels.",
  },
  {
    id: "D2",
    name: "UCI Adult (Census Income)",
    source: "UCI Machine Learning Repository · US Census 1994",
    url: "https://archive.ics.uci.edu/dataset/2/adult",
    license: "CC0 1.0 — public domain",
    licenseOk: "OK",
    records: "48,842 rows — train 32,561 + test 16,281",
    features: "age, workclass, fnlwgt, education + education-num, marital-status, occupation (14 classes), relationship, race, sex, capital-gain/loss, hours-per-week, native-country",
    target: "Ships as income >50K. Repurposed here: `occupation` as the proxy classification label",
    missing: "≈7% missing workclass/occupation — rows dropped, documented; mode-imputation would fabricate employer facts",
    limits: [
      "US census of 1994 — three decades of labor-market drift between it and now",
      "Occupation classes are coarse (Prof-specialty, Tech-support…) — not ML Engineer vs Data Scientist",
      "Adult workforce, not students: this trains the pipeline, it does not predict a student's career",
    ],
    geo: "United States, 1994 — historical and geographic bias disclosed in the model card",
    role: "The single supervised exercise: education + work features → occupation family. Proves the CV, metrics and SHAP wiring on real labeled data.",
    verdict: "CONDITIONAL",
    note: "Conditional on the model card carrying one sentence: “This model classifies 1994 US census occupations; it does not predict a student's career.”",
  },
  {
    id: "D3",
    name: "ESCO Skills & Occupations",
    source: "European Commission · ESCO v1.2",
    url: "https://esco.ec.europa.eu/en/use-esco/download",
    license: "CC BY 4.0 — attribution to the European Commission recorded in DATASETS.md",
    licenseOk: "OK",
    records: "3,008 occupations · 13,890 skills/competences · essential/optional relations",
    features: "Occupation URIs + preferred labels, ISCO-08 crosswalk, essential/optional skill relations, multilingual labels",
    target: "Not an ML dataset — a curated reference knowledge base",
    missing: "N/A — curated; coverage gaps in niche ML roles are acknowledged, not imputed",
    limits: [
      "European labor-market framing",
      "Needs trimming to the 12 target tech careers → a curated ≈40-skill subset with a reviewed mapping table",
      "Granularity too fine for roles like NLP Engineer — the manual curation is real work, and it is scoped",
    ],
    geo: "European Union — English canonical labels used",
    role: "The canonical skill vocabulary, the alias dictionary source, and the career-requirement backbone (essential relation = weight floor).",
    verdict: "ADOPT",
    note: "The vocabulary the whole system speaks. Every skill string in the app normalizes to an ESCO-canonical entry.",
  },
  {
    id: "D4",
    name: "O*NET 29.1",
    source: "US Dept. of Labor · O*NET Resource Center",
    url: "https://www.onetcenter.org/database.html",
    license: "Public domain — US government work",
    licenseOk: "OK",
    records: "1,016 occupations × 35 skills with importance & level ratings (0–100) + knowledge areas",
    features: "SOC codes, skill importance/level, knowledge areas, technology-skill examples",
    target: "Reference — the independent second source for career skill weights",
    missing: "N/A",
    limits: [
      "US-centric job framing",
      "Coarse for modern roles: no “Machine Learning Engineer” — nearest SOC occupations are mapped and documented",
      "29.1 (2024) pinned by checksum; upgrades are a versioning decision, not a silent refresh",
    ],
    geo: "United States",
    role: "Triangulation of career skill-weight vectors; disagreements with ESCO are logged, never averaged in silence.",
    verdict: "ADOPT",
    note: "Two sources agreeing on a weight is evidence; one source is an assumption. This is the second source.",
  },
  {
    id: "D5",
    name: "DS Job Listings (Kaggle, candidate)",
    source: "Kaggle — several scraped-listing candidates; final pick made at download",
    url: "https://www.kaggle.com/datasets",
    license: "Per-dataset — must be verified before the first row is read; scraped corpora treated as suspect",
    licenseOk: "VERIFY",
    records: "≈18,000 postings (leading candidate)",
    features: "title, description, location, company; salary — mostly missing",
    target: "Occupation ↔ skill co-occurrence → empirical demand weights",
    missing: "Salaries largely absent; duplicate postings; HTML fragments in descriptions",
    limits: [
      "Scraped provenance — the license may not cover redistribution → analysis in-house, raw text never shipped",
      "Employer self-reported titles; noisy, inconsistent requirement lists",
      "2023 snapshot with US/India skew",
    ],
    geo: "Mixed — US / India majority",
    role: "Empirical demand weights layered on the ESCO essential-skill floors — e.g., how often real ML-Engineer JDs name Docker versus publications.",
    verdict: "CONDITIONAL",
    note: "If its license fails, ESCO + O*NET weights stand alone. The engine is designed to work without this dataset — that is what a fallback means.",
  },
  {
    id: "D6",
    name: "kaggle-job-postings (2016)",
    source: "Indeed scrape, 2016 · mirrored dataset",
    url: "https://github.com/manojkiraneda/kaggle-job-postings",
    license: "Declared CC0 on the mirror — re-verified against the license file at intake",
    licenseOk: "VERIFY",
    records: "289,797 scraped Indeed postings, 2016",
    features: "Raw job title + description text, nothing structured",
    target: "NLP extractor test bench — known skill mentions buried in unstructured text",
    missing: "No structured skill column: extraction is the task",
    limits: [
      "2016 demand patterns — pre-TensorFlow 2, pre-LLM era",
      "US-centric",
      "Used to test extraction precision/recall only — never for scoring",
    ],
    geo: "United States",
    role: "Stress-test the resume/JD extractor on large, messy, real text; 150 postings hand-labeled as extraction ground truth.",
    verdict: "CONDITIONAL",
    note: "A test bench, not a training oracle. Its age is a feature: drift between 2016 and 2023 demand becomes a documented demo.",
  },
  {
    id: "D7",
    name: "Resume Corpus (962 CVs)",
    source: "Kaggle — “Updated Resume Dataset”, 24 job categories",
    url: "https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset",
    license: "Listed as MIT — verified at download; PII scrub mandatory either way",
    licenseOk: "VERIFY",
    records: "962 text resumes across 24 categories",
    features: "Resume text + category label (e.g., “Data Science”, “Java Developer”)",
    target: "Extractor development: section parsing, skill extraction, category mapping",
    missing: "The missing data is the formatting: PDF-to-text artifacts, inconsistent sections, broken bullets",
    limits: [
      "Small; categories ≠ our 12 tech careers — mapped through a documented rule table",
      "PII scrubbing is a hard precondition before any processing",
      "Quality varies widely — realistic, and deliberately so",
    ],
    geo: "Mixed — India-majority",
    role: "Develop and evaluate the resume NLP extractor; declared fallback = self-authored test resumes with known ground truth.",
    verdict: "CONDITIONAL",
    note: "The graceful-failure requirement (F-07) is tested here: extraction reports show misses, never hide them.",
  },
  {
    id: "D8",
    name: "LinkedIn-Scraped Corpora",
    source: "Various GitHub / Kaggle mirrors",
    url: "—",
    license: "Unclear — scraping violates LinkedIn ToS",
    licenseOk: "FAIL",
    records: "Large (100k+ rows in some mirrors)",
    features: "Scraped profiles and postings",
    target: "—",
    missing: "—",
    limits: ["Terms-of-service violation", "No defensible license chain", "Consent of data subjects unknown"],
    geo: "—",
    role: "Rejected on legal grounds despite convenience. Convenience is not a license.",
    verdict: "REJECT",
    note: "D5/D6 cover the empirical demand need legally. This row exists so the decision is on record.",
  },
  {
    id: "D9",
    name: "Lightcast / Burning Glass",
    source: "Commercial labor-market analytics",
    url: "—",
    license: "Proprietary — commercial license, no academic redistribution",
    licenseOk: "FAIL",
    records: "Millions of postings (aggregated)",
    features: "Normalized skills, demand counts",
    target: "—",
    missing: "—",
    limits: ["Cost-prohibitive", "Cannot be shipped, re-derived or shown in the deliverable"],
    geo: "Global",
    role: "Cited in the report as the industrial gold standard this project cannot legally use — and the ESCO + O*NET + Kaggle stack is documented as the defensible alternative.",
    verdict: "REJECT",
    note: "Naming what we cannot have is part of an honest dataset chapter.",
  },
  {
    id: "D10",
    name: "Synthetic Student Cohort",
    source: "Self-authored · src/data/synthesize.py",
    url: "—",
    license: "Original work — the generation script itself is the deliverable",
    licenseOk: "OK",
    records: "1,200 feature vectors × 18 features · fixed seed · checksummed manifest",
    features: "12 skill levels (truncated normal, archetype-conditioned) + studytime, absences, project counts calibrated to UCI SP summary statistics",
    target: "None — unsupervised development only",
    missing: "By design: no labels, no identities, no demographics",
    limits: [
      "Calibration ≠ representation — no distributional claims about real students are made from it",
      "Never a source of supervised metrics or personality claims",
      "Every figure that touches it carries a SYNTHETIC stamp",
    ],
    geo: "N/A",
    role: "K-Means / elbow / silhouette development ground, and the persona-visualization substrate until real cohort data exists — it may never; that is on record.",
    verdict: "BUILD",
    note: "Rule 13 in action: the closest scientifically valid alternative to data that does not exist, labeled instead of papered over.",
  },
];

/* ---------- Phase 2 · the honesty contract ---------- */
export const PROXY_POLICY = {
  learns: [
    "Coarse occupation family from education + work features (Adult corpus)",
    "Skill–occupation co-occurrence frequencies (job-posting corpora, if licensed)",
    "The structure of career-requirement vectors (ESCO essential + O*NET importance)",
  ],
  notLearns: [
    "Which career a specific student will end up in — no dataset anywhere shows that",
    "Employability, hiring probability, or future salary",
    "Psychological “fit” or aptitude — excluded by design (ethics E-3)",
  ],
  instead: [
    "Compatibility = a documented hybrid: model probability × weighted skill coverage against requirement vectors",
    "Every score ships with fold variance, data-completeness confidence and limitation text",
    "The model card names the proxy target in one sentence a supervisor can repeat in the viva",
  ],
};

export const SYNTH_PROTOCOL = [
  { k: "Purpose", v: "Algorithm development for clustering and persona visualization only. Never a source of supervised metrics, never a “real population”." },
  { k: "Size", v: "n = 1,200 vectors × 18 features. Fixed seed; configs/cohort_manifest.json records schema, seed and checksums." },
  { k: "Calibration", v: "Behavioral features drawn to match UCI Student Performance summary statistics; skill levels as truncated normals around documented archetype centers (AI/Data, Software, Research, Generalist)." },
  { k: "Boundaries", v: "No labels, no demographics, no identities. The live twin's persona is computed against these centroids and labeled “reference cohort” — never “your type”." },
  { k: "Reproducibility", v: "src/data/synthesize.py + manifest under version control; one command regenerates bit-identical data." },
];

/* ---------- Phase 2 · schema matching ---------- */
export const SCHEMA_SOURCES = ["UCI SP", "ADULT", "ESCO", "O*NET", "KAGGLE JD"];
export const SCHEMA_ARTIFACTS = ["career_requirements", "skills.json", "career_map.csv"];

export const SCHEMA_STEPS = [
  { n: "S1", name: "Canonical vocabulary", body: "ESCO's 13.8k skills are trimmed to a curated ≈40-skill tech subset; the alias table is built (SQL / MySQL / PostgreSQL → sql; React.js / ReactJS → react). Alias work is the unglamorous workhorse that makes NLP matching honest instead of lucky." },
  { n: "S2", name: "Career taxonomy map", body: "The 12 target careers are mapped to ESCO occupation URIs + ISCO-08 codes in career_map.csv — one row per career, each mapping sourced and reviewable." },
  { n: "S3", name: "Weight vectors", body: "Start: ESCO essential relations as a 0.8 weight floor. Refine: O*NET importance ratings, min–max scaled per occupation. Adjust: job-posting mention frequencies — applied only if D5 passes its license check." },
  { n: "S4", name: "Adult → family rules", body: "UCI occupation strings map to coarse career families through a documented one-to-one rule table (e.g., Prof-specialty → professional/technical pool). No fuzzy guessing; unmapped rows are excluded and counted." },
  { n: "S5", name: "Integration artifacts", body: "career_requirements (career_id, skill_id, weight, target_level, prereq_skill_id), skills.json (canonical + aliases), career_map.csv — checksummed, version-controlled, referenced by every engine downstream." },
  { n: "S6", name: "Cross-source validation", body: "Checklist rule: ESCO and O*NET must agree on ≥ 7 of the top-10 weighted skills for at least 8 of the 12 careers. Failures become logged curation tasks, not silent compromises." },
];

export const P2_DELIVERABLES = [
  { f: "data/external/{uci-sp, adult, esco, onet}/", what: "Raw files, unmodified; checksums recorded at intake" },
  { f: "data/processed/registry.json", what: "Per-file manifest: source, license, row count, checksum, download date" },
  { f: "DATASETS.md", what: "The ten dataset cards above, expanded with intake logs and license evidence" },
  { f: "career_map.csv · skills.json", what: "The taxonomy and vocabulary artifacts produced by S1–S2" },
  { f: "src/data/validate.py", what: "Intake validation: completeness asserts, license flags, PII scan on the resume corpus" },
  { f: "src/data/synthesize.py · configs/cohort_manifest.json", what: "Synthetic cohort generator and its manifest (D10)" },
];

export const P2_EXIT =
  "Gate G-2 passes when every candidate source is either licensed-and-documented or excluded-and-explained, the proxy-label sentence is written, and the schema plan has a validation checklist. No model sees a row before then.";

/* ============================================================
   PHASE 3 · Exploratory Data Analysis — the EDA contract
   Every column disposition is pre-committed here, before the
   data is loaded. The notebook executes; this revision approves.
   ============================================================ */

export const EDA_INTRO =
  "The data is registered but not yet loaded — so this revision contains no EDA numbers, and it refuses to invent them. What it does instead is harder: pre-commit every analytical decision before the notebook runs. Six work packages, a full 33-attribute ledger with a verdict on every column, the leakage case closed in writing, and the balance protocol signed. Whatever the data shows at load time, nothing will enter or leave the model quietly.";

export const EDA_WORKPACKAGES = [
  { id: "AP-1", name: "Attribute inventory", input: "Loaded CSV + dataset README", output: "reports/ap1_inventory.md — type, range and role of all 33 attributes", acceptance: "All 33 attributes accounted for; zero silent column drops" },
  { id: "AP-2", name: "Missingness audit", input: "Inventory frame", output: "Missingness table + per-gap decision log", acceptance: "Every gap gets an explicit decision — drop, impute, or flag. None silently" },
  { id: "AP-3", name: "Distribution analysis", input: "Modeling subset (14 KEEP attributes)", output: "Histograms, ordinal-scale tables, binary imbalances", acceptance: "Ordinal 1–5 scales never treated as interval without a written note; skew documented" },
  { id: "AP-4", name: "Class balance analysis", input: "Target fail = (G3 < 10), per subject", output: "Balance table + stratified-split plan", acceptance: "Ratio measured per subject file (mat / por) and logged; minority protocol ready" },
  { id: "AP-5", name: "Correlation analysis", input: "Modeling subset + G3", output: "Spearman matrix; VIF on the ordinal cluster (studytime / freetime / goout)", acceptance: "No feature pair above |0.85| without a documented keep/drop decision" },
  { id: "AP-6", name: "Sensitive-attribute audit", input: "Full attribute set vs E-3 exclusion log", output: "Exclusion audit — 16 EXCLUDE attributes, each with a reason", acceptance: "No excluded attribute reaches any feature pipeline — asserted by a test" },
];

export type AttrDecision = "KEEP" | "EXCLUDE" | "LEAK" | "TARGET";
export type AttrGroup = "SCHOOL" | "FAMILY" | "STUDY" | "DEMOGRAPHIC" | "ACHIEVEMENT";

export interface UciAttr {
  name: string;
  type: "BIN" | "ORD" | "NUM" | "NOM";
  range: string;
  group: AttrGroup;
  decision: AttrDecision;
  note: string;
}

/* Transcribed from the UCI Student Performance data dictionary.
   Dispositions are the pre-committed EDA contract — verified at load time. */
export const UCI_ATTRIBUTES: UciAttr[] = [
  { name: "school", type: "BIN", range: "GP / MS", group: "SCHOOL", decision: "KEEP", note: "Which school — a control variable, never an identity" },
  { name: "sex", type: "BIN", range: "F / M", group: "DEMOGRAPHIC", decision: "EXCLUDE", note: "E-3: sensitive attribute — description only" },
  { name: "age", type: "NUM", range: "15 – 22", group: "DEMOGRAPHIC", decision: "EXCLUDE", note: "E-3: sensitive attribute — description only" },
  { name: "address", type: "BIN", range: "urban / rural", group: "DEMOGRAPHIC", decision: "EXCLUDE", note: "Residential context — described, not scored" },
  { name: "famsize", type: "BIN", range: "≤3 / >3", group: "FAMILY", decision: "EXCLUDE", note: "Family structure — described, not scored" },
  { name: "Pstatus", type: "BIN", range: "together / apart", group: "FAMILY", decision: "EXCLUDE", note: "Family situation — sensitive context" },
  { name: "Medu", type: "ORD", range: "0 – 4", group: "FAMILY", decision: "EXCLUDE", note: "Socioeconomic proxy — bias risk" },
  { name: "Fedu", type: "ORD", range: "0 – 4", group: "FAMILY", decision: "EXCLUDE", note: "Socioeconomic proxy — bias risk" },
  { name: "Mjob", type: "NOM", range: "5 classes", group: "FAMILY", decision: "EXCLUDE", note: "Socioeconomic proxy — bias risk" },
  { name: "Fjob", type: "NOM", range: "5 classes", group: "FAMILY", decision: "EXCLUDE", note: "Socioeconomic proxy — bias risk" },
  { name: "reason", type: "NOM", range: "4 classes", group: "SCHOOL", decision: "KEEP", note: "Why this school — a legitimate motivation signal" },
  { name: "guardian", type: "NOM", range: "3 classes", group: "FAMILY", decision: "EXCLUDE", note: "Family structure — described, not scored" },
  { name: "traveltime", type: "ORD", range: "1 – 4", group: "SCHOOL", decision: "KEEP", note: "Commute cost — legitimate study-context feature" },
  { name: "studytime", type: "ORD", range: "1 – 4", group: "STUDY", decision: "KEEP", note: "Core behavioral feature of the twin" },
  { name: "failures", type: "NUM", range: "0 – 3+", group: "ACHIEVEMENT", decision: "KEEP", note: "Previous years' failures — predictive, not current-year leakage" },
  { name: "schoolsup", type: "BIN", range: "yes / no", group: "SCHOOL", decision: "KEEP", note: "Educational support — context feature" },
  { name: "famsup", type: "BIN", range: "yes / no", group: "FAMILY", decision: "KEEP", note: "Family study support — a support mechanism, not sensitive" },
  { name: "paid", type: "BIN", range: "yes / no", group: "SCHOOL", decision: "KEEP", note: "Extra paid classes — resource feature" },
  { name: "activities", type: "BIN", range: "yes / no", group: "STUDY", decision: "KEEP", note: "Extracurriculars — behavioral feature" },
  { name: "nursery", type: "BIN", range: "yes / no", group: "FAMILY", decision: "EXCLUDE", note: "Early-childhood socioeconomic proxy" },
  { name: "higher", type: "BIN", range: "yes / no", group: "STUDY", decision: "KEEP", note: "Higher-education aspiration — strong legitimate signal" },
  { name: "internet", type: "BIN", range: "yes / no", group: "FAMILY", decision: "KEEP", note: "Resource access — kept; flagged for supervisor review at G-3" },
  { name: "romantic", type: "BIN", range: "yes / no", group: "DEMOGRAPHIC", decision: "EXCLUDE", note: "Personal life — never a model input" },
  { name: "famrel", type: "ORD", range: "1 – 5", group: "FAMILY", decision: "EXCLUDE", note: "Family dynamics — sensitive context" },
  { name: "freetime", type: "ORD", range: "1 – 5", group: "STUDY", decision: "KEEP", note: "Free time after school — behavioral feature" },
  { name: "goout", type: "ORD", range: "1 – 5", group: "STUDY", decision: "KEEP", note: "Social activity — behavioral feature" },
  { name: "Dalc", type: "ORD", range: "1 – 5", group: "STUDY", decision: "EXCLUDE", note: "Alcohol use — health behavior, sensitive" },
  { name: "Walc", type: "ORD", range: "1 – 5", group: "STUDY", decision: "EXCLUDE", note: "Alcohol use — health behavior, sensitive" },
  { name: "health", type: "ORD", range: "1 – 5", group: "STUDY", decision: "EXCLUDE", note: "Health — sensitive attribute" },
  { name: "absences", type: "NUM", range: "0 – 93", group: "SCHOOL", decision: "KEEP", note: "Core behavioral feature — the prime early-warning candidate" },
  { name: "G1", type: "NUM", range: "0 – 20", group: "ACHIEVEMENT", decision: "LEAK", note: "First-period grade — the target measured earlier. See §22" },
  { name: "G2", type: "NUM", range: "0 – 20", group: "ACHIEVEMENT", decision: "LEAK", note: "Second-period grade — the target measured earlier. See §22" },
  { name: "G3", type: "NUM", range: "0 – 20", group: "ACHIEVEMENT", decision: "TARGET", note: "Final grade — the outcome. Never a feature" },
];

export const MISSINGNESS_NOTE =
  "The source paper documents this dataset as arriving without missing cells. That is a claim, not evidence — AP-2 re-verifies it at load time. Any gap found then receives an explicit decision: drop, impute, or flag. Silent deletion is the one unforgivable sin of this phase, and the ledger above exists so a supervisor can check every disposition.";

export const LEAKAGE = {
  claim:
    "G3 is the outcome the dataset records. G1 and G2 are earlier recordings of nearly the same quantity — the source paper documents them as strongly correlated with G3. A model that uses them to “predict” failure is grading an exam with the exam in its pocket.",
  modelA: {
    name: "Model A — with G1 + G2",
    steps: ["14 behavioral features", "+ G1, G2", "classifier", "near-ceiling metrics"],
    verdict:
      "Trivially accurate, useless for decisions. By the time G2 exists the student already knows how the year is going — the system has nothing left to advise, only to echo.",
    flag: "LEAKAGE — rejected as primary",
  },
  modelB: {
    name: "Model B — behavioral features only",
    steps: ["14 KEEP features", "classifier", "honest, lower metrics"],
    verdict:
      "Answers the question this project actually asks: can early, observable behavior — attendance, study time, support structures, aspiration — indicate risk before the year is over?",
    flag: "PRIMARY MODEL",
  },
  sensitivity:
    "G1 and G2 are not deleted. They enter a documented sensitivity analysis — how much does grade history add on top of behavior? The delta is reported as information about the data, never as the headline model.",
};

export const BALANCE_PROTOCOL = {
  target: "fail := (G3 < 10)   // 0–20 scale · the pass criterion documented with the dataset · applied per subject file (mat / por)",
  splits: [
    { name: "TRAIN", share: 60, color: "#6be1ff", note: "Model fitting, with stratified 5-fold CV inside — never outside" },
    { name: "CV", share: 20, color: "#ffc266", note: "Model selection between candidates — touched in loops only" },
    { name: "TEST", share: 20, color: "#ff8b8b", note: "Touched exactly once, after every choice is frozen" },
  ],
  responses: [
    "Measure the pass/fail ratio per subject file — mat and por are different student populations and will be reported separately.",
    "If the minority class falls below 25%: log it, then run class_weight = 'balanced' as a documented sensitivity analysis — never as a silent fix.",
    "Stratify every split and every fold on the target, so the ratio survives partitioning.",
    "Report the measured ratios in the EDA report. An imbalanced target is a finding to state, not an embarrassment to smooth over.",
  ],
};

export const EDA_EXIT =
  "14 features in · 16 documented exclusions · 2 leakage-flagged · 1 target. Every column of the primary dataset has a disposition, in writing, before load. The notebook executes this contract; it does not renegotiate it.";

/* ============================================================
   PHASE 4 · Preprocessing — the code, written before the data
   Preprocessing is the one stage that can be fully specified and
   tested without a single row loaded. This revision ships the real
   ColumnTransformer, the fit-discipline rules, the leakage checklist
   as executable tests, and the validator that guards twin writes.
   ============================================================ */

export const P4_INTRO =
  "Preprocessing is where leakage is either prevented or smuggled in — and it is the one stage that can be written, reviewed and tested before a single row is loaded. So this revision does exactly that: the ColumnTransformer composition is final code, not a sketch; the fit-discipline is a rule that a test enforces; and the leakage checklist from §22 is now executable. When the notebook finally runs, it wires this module to data — it does not redesign it.";

/* ---------- the actual ColumnTransformer ---------- */
export const P4_TRANSFORMER_CODE = `from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder, StandardScaler
from sklearn.impute import SimpleImputer

# The 14 KEEP columns from the §21 ledger — nothing else enters.
BINARY  = ["school", "schoolsup", "famsup", "paid",
           "activities", "higher", "internet"]
NOMINAL = ["reason"]                                  # 4 classes
ORDINAL = ["traveltime", "studytime",
           "freetime", "goout"]
NUMERIC = ["failures", "absences"]

preprocessor = ColumnTransformer(
    transformers=[
        ("bin", OneHotEncoder(drop="first",
                              handle_unknown="ignore"), BINARY),
        ("nom", OneHotEncoder(drop="first",
                              handle_unknown="ignore"), NOMINAL),
        ("ord", OrdinalEncoder(categories=[[1, 2, 3, 4],
                                           [1, 2, 3, 4],
                                           [1, 2, 3, 4, 5],
                                           [1, 2, 3, 4, 5]]), ORDINAL),
        ("num", Pipeline([
            ("imp", SimpleImputer(strategy="median")),
            ("sc",  StandardScaler()),
        ]), NUMERIC),
    ],
    remainder="drop",   # <- the 16 EXCLUDE, 2 LEAK and 1 TARGET
)                       #    never reach a model. Enforced, not hoped.`;

/* ---------- interactive transformer tree ---------- */
export interface TxStep { code: string; why: string }
export interface TxColumn { name: string; type: string; range: string; why: string }
export interface TxGroup {
  id: string;
  name: string;
  transformer: string;
  accent: string;
  columns: TxColumn[];
  chain: TxStep[];
  note: string;
}

export const P4_GROUPS: TxGroup[] = [
  {
    id: "bin",
    name: "Binary flags",
    transformer: 'OneHotEncoder(drop="first", handle_unknown="ignore")',
    accent: "#6be1ff",
    columns: [
      { name: "school", type: "BIN", range: "GP / MS", why: "Which school — a control variable for cohort effects." },
      { name: "schoolsup", type: "BIN", range: "yes / no", why: "Extra educational support — a resource signal." },
      { name: "famsup", type: "BIN", range: "yes / no", why: "Family study support — a support mechanism, not sensitive." },
      { name: "paid", type: "BIN", range: "yes / no", why: "Extra paid classes — a resource feature." },
      { name: "activities", type: "BIN", range: "yes / no", why: "Extracurriculars — behavioral engagement." },
      { name: "higher", type: "BIN", range: "yes / no", why: "Higher-education aspiration — a strong legitimate signal." },
      { name: "internet", type: "BIN", range: "yes / no", why: "Resource access — kept, flagged for supervisor review at G-3." },
    ],
    chain: [
      { code: "OneHotEncoder", why: "Nominal binary values become indicator columns." },
      { code: 'drop="first"', why: "Drops one column per feature to avoid the dummy-variable trap (perfect collinearity)." },
      { code: 'handle_unknown="ignore"', why: "Unseen categories at predict time encode as all-zero instead of crashing the twin." },
    ],
    note: "7 features → 7 one-hot columns. Because each is already binary, one-hotting is effectively a 0/1 re-encoding; drop='first' keeps the design matrix full-rank.",
  },
  {
    id: "nom",
    name: "Nominal category",
    transformer: 'OneHotEncoder(drop="first", handle_unknown="ignore")',
    accent: "#7ce7a5",
    columns: [
      { name: "reason", type: "NOM", range: "course / home / reputation / other", why: "Why the student chose this school — a motivation signal." },
    ],
    chain: [
      { code: "OneHotEncoder", why: "4 unordered classes → 4 indicator columns." },
      { code: 'drop="first"', why: "Leaves 3 columns; the dropped one is the implicit baseline." },
      { code: 'handle_unknown="ignore"', why: "Graceful on any future or malformed value." },
    ],
    note: "1 feature → 3 one-hot columns. Ordinal encoding would be wrong here: 'course' is not quantitatively greater than 'home'.",
  },
  {
    id: "ord",
    name: "Ordinal scales",
    transformer: "OrdinalEncoder(categories=[[1,2,3,4],[1,2,3,4],[1,2,3,4,5],[1,2,3,4,5]])",
    accent: "#ffc266",
    columns: [
      { name: "traveltime", type: "ORD", range: "1 – 4", why: "Commute cost — study-context feature." },
      { name: "studytime", type: "ORD", range: "1 – 4", why: "Weekly study time — a core twin behavioral feature." },
      { name: "freetime", type: "ORD", range: "1 – 5", why: "Free time after school — behavioral feature." },
      { name: "goout", type: "ORD", range: "1 – 5", why: "Social activity — behavioral feature." },
    ],
    chain: [
      { code: "OrdinalEncoder", why: "Preserves the inherent order (1 < 2 < 3 < 4 < 5)." },
      { code: "fixed categories", why: "Categories pinned to the documented scales so the encoding cannot drift if a value is missing." },
      { code: "interval caveat", why: "Treated as ordered-numeric for trees; the EDA report notes the intervals are not proven equal." },
    ],
    note: "4 features → 4 ordered-numeric columns. One-hotting would discard the order; treating as raw continuous would overclaim equal spacing. Trees are robust to either, which is why the caveat is a note, not a blocker.",
  },
  {
    id: "num",
    name: "Numeric counts",
    transformer: "Pipeline([SimpleImputer(median), StandardScaler])",
    accent: "#9db8ff",
    columns: [
      { name: "failures", type: "NUM", range: "0 – 3+", why: "Previous years' failures — predictive, not current-year leakage." },
      { name: "absences", type: "NUM", range: "0 – 93", why: "Attendance — the prime early-warning behavioral feature." },
    ],
    chain: [
      { code: "SimpleImputer(median)", why: "Median is robust to the skew in absences (a few students at 90+)." },
      { code: "StandardScaler", why: "Puts failures (0–3) and absences (0–93) on comparable scale for linear models and distance-based ones." },
      { code: "log1p(absences)", why: "Flagged as a sensitivity-analysis variant, given the right skew — reported, not silently swapped." },
    ],
    note: "2 features → 2 scaled columns. The imputer is fit on the training fold only (see §26); the scaler uses that fold's mean/std.",
  },
];

export const P4_TARGET_CODE = `# Target — computed from G3 alone. G1, G2, G3 are then dropped
# from the feature frame. The §22 leakage log is the authority.
y = (df["G3"] < 10).astype(int)          # fail := G3 < 10
X = df.drop(columns=["G1", "G2", "G3"])  # outcome never a feature
X = X[KEEP_14]                            # the signed §21 ledger`;

/* ---------- fit discipline ---------- */
export const P4_FIT = {
  rule: "Fit on the training fold. Transform everything with those fold statistics. Never refit on validation or test.",
  points: [
    { title: "Imputer & scaler are part of the pipeline", body: "They sit inside the same Pipeline as the model, so cross-validation refits them on each fold's training split. Their statistics never see held-out rows." },
    { title: "CV refits per fold", body: "In stratified 5-fold CV the preprocessor is fit 5 times — once per fold — each on that fold's training portion only. Mean/std/medians are therefore fold-local." },
    { title: "Test is touched once", body: "The held-out 20% is transformed exactly once, using the final pipeline fit on the full training set, after every modeling choice is frozen." },
    { title: "Artifacts are pinned", body: "The fitted preprocessor + model ship as joblib with a manifest: training-data hash, CV metrics, timestamp and version. The prediction log references them." },
  ],
  cvFlow: ["TRAIN fold", "fit preprocessor", "fit model", "transform VAL", "score"],
};

/* ---------- leakage tests ---------- */
export interface P4Test { id: string; name: string; asserts: string; code: string }

export const P4_TESTS: P4Test[] = [
  {
    id: "T-1",
    name: "target_not_in_features",
    asserts: "G1, G2 and G3 are absent from the feature frame handed to any model.",
    code: `def test_target_not_in_features(X):
    leaked = {"G1", "G2", "G3"} & set(X.columns)
    assert not leaked, f"outcome columns in features: {leaked}"`,
  },
  {
    id: "T-2",
    name: "sensitive_not_in_features",
    asserts: "None of the 16 EXCLUDE columns (§21) appear in the feature frame.",
    code: `EXCLUDE = {"sex", "age", "address", "famsize", "Pstatus", "Medu",
           "Fedu", "Mjob", "Fjob", "guardian", "nursery", "romantic",
           "famrel", "Dalc", "Walc", "health"}

def test_sensitive_not_in_features(X):
    assert not (EXCLUDE & set(X.columns)), "sensitive attribute leaked"`,
  },
  {
    id: "T-3",
    name: "imputer_fit_on_train_only",
    asserts: "Imputer statistics are computed from the training split alone.",
    code: `def test_imputer_fit_on_train_only(X_train, X_test, pipeline):
    pipeline.fit(X_train, y_train)
    imp = pipeline.named_steps["pre"].named_transformers_["num"]
    # statistics_ must reflect X_train only — recompute & compare
    expected = np.nanmedian(X_train[NUMERIC], axis=0)
    np.testing.assert_allclose(imp.named_steps["imp"].statistics_,
                               expected)`,
  },
  {
    id: "T-4",
    name: "cv_is_stratified",
    asserts: "Every CV fold preserves the pass/fail class ratio within tolerance.",
    code: `def test_cv_is_stratified(y, cv):
    overall = y.mean()
    for tr, va in cv.split(X, y):
        assert abs(y[tr].mean() - overall) < 0.03`,
  },
  {
    id: "T-5",
    name: "ordinal_categories_pinned",
    asserts: "Ordinal encoding matches the documented 1–4 / 1–5 scales exactly.",
    code: `def test_ordinal_categories_pinned(pre):
    enc = pre.named_transformers_["ord"]
    assert enc.categories_ == [[1,2,3,4], [1,2,3,4],
                               [1,2,3,4,5], [1,2,3,4,5]]`,
  },
  {
    id: "T-6",
    name: "test_touched_once",
    asserts: "The held-out test set is transformed exactly once, after all choices are frozen.",
    code: `def test_test_touched_once(counter):
    # counter increments on every transform(X_test)
    assert counter.value == 1, "test set used more than once"`,
  },
  {
    id: "T-7",
    name: "twin_writes_validated",
    asserts: "Every write to the Digital Twin passes the §28 validator before it lands.",
    code: `def test_twin_writes_validated(record):
    validate_twin_write(record)   # raises on any rule breach`,
  },
];

/* ---------- twin input validator ---------- */
export interface ValRule { field: string; rule: string; type: string }
export const P4_VALIDATOR_RULES: ValRule[] = [
  { field: "skill.level_0_100", rule: "integer in [0, 100]", type: "range" },
  { field: "skill.canonical_name", rule: "present in skills.json vocabulary", type: "vocab" },
  { field: "skill.source", rule: "one of {self, extracted, verified} — required", type: "enum" },
  { field: "attendance.attended", rule: "0 ≤ attended ≤ total", type: "range" },
  { field: "grade.score", rule: "real in [0, 20]", type: "range" },
  { field: "record.updated_at", rule: "valid ISO timestamp — required", type: "format" },
  { field: "record.student_id", rule: "references an existing student row", type: "fk" },
  { field: "project.difficulty", rule: "integer in [1, 5]", type: "range" },
];

export const P4_VALIDATOR_NOTE =
  "The same validator guards two doors: the training-data intake and the Digital Twin's write path. One rule set, two enforcement points — so the twin can never store a value the models were never allowed to see, and a malformed record fails loudly at the boundary instead of corrupting the timeline.";

/* ---------- artifacts & deliverables ---------- */
export const P4_ARTIFACTS = [
  { f: "preprocessor.joblib", what: "Fitted ColumnTransformer — pinned to a training-data hash" },
  { f: "model.joblib", what: "Selected model fitted inside CV discipline" },
  { f: "manifest.json", what: "Data hash, CV metrics, timestamp, version — referenced by the prediction log" },
  { f: "src/preprocessing/pipeline.py", what: "The ColumnTransformer + target engineering above, as importable code" },
  { f: "src/preprocessing/validate.py", what: "validate_twin_write() — the §28 rule set" },
  { f: "tests/test_preprocessing.py", what: "The seven leakage tests, runnable with one pytest command" },
];

export const P4_EXIT =
  "The preprocessing module is final code with an executable leakage checklist — not a plan. When data arrives, it is wired in unchanged; any deviation requires a documented revision, not an inline edit. That is the whole point of writing it first.";
