/* ============================================================
   DT-CIS · Phase 1 System Design — Document Data
   All content below is the deliverable itself: honest, scoped,
   and defensible. No datasets, metrics, or claims are fabricated.
   ============================================================ */

export const DOC_META = {
  code: "DT-CIS",
  docNo: "DT-CIS-SD-001",
  rev: "REV A",
  sheet: "01 / 01",
  phase: "PHASE 1 — SYSTEM DESIGN",
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
  { n: 1, stage: "Foundations", name: "System Design", weeks: "now", deliverable: "This document: problem, objectives, features, architecture, schema, stack, risks, ethics.", exit: "Supervisor approval ← YOU ARE HERE" },
  { n: 2, stage: "Foundations", name: "Data", weeks: "1 wk", deliverable: "Dataset cards (source, license, records, features, limits); schema-matching plan.", exit: "All licenses verified or dataset excluded" },
  { n: 3, stage: "Foundations", name: "EDA", weeks: "0.5 wk", deliverable: "Distributions, missingness, class balance, correlation report.", exit: "No silent column drops; report reviewed" },
  { n: 4, stage: "Foundations", name: "Preprocessing", weeks: "0.5 wk", deliverable: "Reusable pipelines (impute, scale, encode) fitted inside CV only.", exit: "Leakage checklist signed off" },
  { n: 5, stage: "Models", name: "Baseline models", weeks: "0.5 wk", deliverable: "LogReg + RF reference bars with full metrics.", exit: "Baselines reproducible from one command" },
  { n: 6, stage: "Models", name: "Advanced ML", weeks: "1 wk", deliverable: "GB / XGBoost? / SVM / MLP comparison; nested CV for tuning.", exit: "Winner chosen by evidence table" },
  { n: 7, stage: "Models", name: "Student clustering", weeks: "1 wk", deliverable: "K-Means personas, elbow + silhouette, PCA map.", exit: "k justified; labels descriptive only" },
  { n: 8, stage: "Intelligence", name: "Career recommendation", weeks: "1 wk", deliverable: "Hybrid compatibility engine + methodology doc.", exit: "Unit tests on fixed profiles pass" },
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
