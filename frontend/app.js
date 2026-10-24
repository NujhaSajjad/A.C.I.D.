/* A.C.I.D. — Case Intelligence frontend logic */
const API = "";

// ---------- SVG icons ----------
const ICONS = {
  acid: '<path d="M12 2.8 4.3 7.2v9.6L12 21.2l7.7-4.4V7.2L12 2.8Z"/><path d="m8 10 4-2.2 4 2.2v4l-4 2.2L8 14v-4Z"/><path d="M12 7.8V3M8 10 4.3 7.7M16 10l3.7-2.3M8 14l-3.7 2.3M16 14l3.7 2.3M12 16.2V21"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.2 4.2"/>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8Z"/><path d="M10 21h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  spark: '<path d="m12 2 1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>',
  scan: '<path d="M8 3H4a1 1 0 0 0-1 1v4M16 3h4a1 1 0 0 1 1 1v4M8 21H4a1 1 0 0 1-1-1v-4M16 21h4a1 1 0 0 0 1-1v-4"/><circle cx="12" cy="12" r="3"/><path d="M12 7v2M12 15v2M7 12h2M15 12h2"/>',
  archive: '<path d="M4 7h16v13H4zM3 3h18v4H3z"/><path d="M9 11h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  brain: '<path d="M9.5 4.5A3 3 0 0 0 4.7 7a3.5 3.5 0 0 0-1.2 6.7A3.5 3.5 0 0 0 8 18.5c.5 1.5 1.8 2.5 4 2.5V3c-1 0-1.8.5-2.5 1.5ZM14.5 4.5A3 3 0 0 1 19.3 7a3.5 3.5 0 0 1 1.2 6.7 3.5 3.5 0 0 1-4.5 4.8c-.5 1.5-1.8 2.5-4 2.5V3c1 0 1.8.5 2.5 1.5Z"/><path d="M8 9h4M16 9h-4M7.5 14H12M16.5 14H12"/>',
  graph: '<circle cx="5" cy="12" r="2.5"/><circle cx="17" cy="5" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="m7.2 10.8 7.6-4.6M7.3 13l9.3 4.2M17.4 7.5l1.2 8"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.6 2.6-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V21h-3.6v-.2A2 2 0 0 0 9 19a2 2 0 0 0-2.2.4l-.1.1-2.6-2.6.1-.1a2 2 0 0 0 .4-2.2A2 2 0 0 0 2.8 13H3V9.4h-.2A2 2 0 0 0 4.6 8a2 2 0 0 0-.4-2.2l-.1-.1 2.6-2.6.1.1A2 2 0 0 0 9 3.6 2 2 0 0 0 10.2 2h3.6A2 2 0 0 0 15 3.6a2 2 0 0 0 2.2-.4l.1-.1 2.6 2.6-.1.1a2 2 0 0 0-.4 2.2 2 2 0 0 0 1.8 1.2h.2V13h-.2a2 2 0 0 0-1.8 2Z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.4 2.4 0 1 1 3.5 2.1c-.8.4-1.2.9-1.2 1.9M12 17h.01"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
  shield: '<path d="M12 3 5 6v5c0 4.7 2.8 8.2 7 10 4.2-1.8 7-5.3 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 12h6M9 16h6"/>',
  eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
  link: '<path d="m10 13.5 4-4"/><path d="M7.5 16.5 5 19a3.5 3.5 0 1 1-5-5l3-3a3.5 3.5 0 0 1 5 0M16.5 7.5 19 5a3.5 3.5 0 1 1 5 5l-3 3a3.5 3.5 0 0 1-5 0"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/>',
  send: '<path d="m3 3 19 9-19 9 4-9-4-9Z"/><path d="M7 12h15"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
};

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}

// Inject icons into all [data-icon] placeholders
document.querySelectorAll("[data-icon]").forEach((el) => {
  el.innerHTML = icon(el.dataset.icon);
});

// ---------- State ----------
let currentCaseId = null;
let currentView = "analysis";
let cases = [];

// ---------- API ----------
async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try { msg = (await res.json()).detail || msg; } catch {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

// ---------- Helpers ----------
function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function showView(view) {
  currentView = view;
  document.querySelectorAll(".workspace").forEach((s) => (s.style.display = "none"));
  document.getElementById(`view-${view}`).style.display = "block";
  document.querySelectorAll(".module-card").forEach((c) => c.classList.remove("active"));
  const card = document.querySelector(`.module-card[data-view="${view}"]`);
  if (card) card.classList.add("active");
  if (view === "analysis") loadAnalysis();
  if (view === "evidence") loadEvidenceView();
  if (view === "timeline") loadTimeline();
  if (view === "connections") loadConnections();
  if (view === "acid") loadAcid();
}

// ---------- Cases ----------
async function loadCases() {
  cases = await api("/api/cases");
  const list = document.getElementById("case-list");
  list.innerHTML = "";
  document.getElementById("case-count").textContent = String(cases.length).padStart(2, "0");
  for (const c of cases) {
    const li = document.createElement("button");
    li.className = "case-card" + (c.id === currentCaseId ? " selected" : "");
    li.innerHTML = `
      <span class="case-top"><span>Case #${c.id}</span><span class="status-dot active">Active</span></span>
      <strong>${esc(c.title)}</strong>
      <span class="case-time">Last activity · recently</span>`;
    li.onclick = () => selectCase(c.id);
    list.appendChild(li);
  }
}

async function selectCase(id) {
  currentCaseId = id;
  const c = await api(`/api/cases/${id}`);
  document.getElementById("case-id-label").textContent = `Case #${c.id}`;
  document.getElementById("case-title").innerHTML = esc(c.title).replace(/\s(\w+)$/, " <em>$1</em>");
  document.getElementById("case-desc").textContent = c.description || "";
  document.getElementById("case-opened").textContent = `Opened ${c.created_at ? c.created_at.split(" ")[0] : "recently"}`;
  await loadCases();
  await refreshMetrics();
  showView(currentView);
}

async function refreshMetrics() {
  if (!currentCaseId) return;
  const ev = await api(`/api/cases/${currentCaseId}/evidence`);
  document.getElementById("metric-evidence").textContent = String(ev.length).padStart(2, "0");
  try {
    const a = await api(`/api/cases/${currentCaseId}/analysis`);
    document.getElementById("metric-conflicts").textContent = String(a.contradictions.length).padStart(2, "0");
    document.getElementById("metric-leads").textContent = String(a.hypotheses.length).padStart(2, "0");
  } catch {
    document.getElementById("metric-conflicts").textContent = "00";
    document.getElementById("metric-leads").textContent = "00";
  }
}

function showNewCaseDialog() {
  const title = prompt("Case title:");
  if (!title) return;
  const description = prompt("Case description (optional):") || "";
  api("/api/cases", { method: "POST", body: JSON.stringify({ title, description }) })
    .then((c) => { currentCaseId = c.id; loadCases(); selectCase(c.id); })
    .catch((e) => alert(e.message));
}

// ---------- Investigation overlay ----------
const processSteps = ["Evidence indexed", "Entities extracted", "Timeline reconstructed", "Relationships mapped", "Contradictions detected", "Hypotheses generated"];

function renderProcessSteps(done) {
  document.getElementById("process-steps").innerHTML = processSteps.map((s, i) => `
    <div class="${i < done ? "done" : ""}"><i>${i < done ? "✓" : "·"}</i><span>${s}</span></div>`).join("");
}

async function runInvestigation() {
  const overlay = document.getElementById("investigation-overlay");
  overlay.classList.remove("hidden");
  const core = document.getElementById("overlay-core");
  core.classList.add("thinking");
  document.getElementById("overlay-reveal").classList.add("hidden");
  document.getElementById("overlay-kicker").textContent = "Autonomous case processing";
  document.getElementById("overlay-title").textContent = "A.C.I.D. Initializing";
  document.getElementById("overlay-desc").textContent = "Mapping every signal. Testing every statement.";

  let progress = 0;
  const timer = setInterval(() => {
    progress = Math.min(100, progress + 2);
    document.getElementById("overlay-progress").style.width = progress + "%";
    document.getElementById("overlay-percent").textContent = progress;
    renderProcessSteps(Math.floor((progress / 100) * processSteps.length));
    if (progress >= 100) {
      clearInterval(timer);
      core.classList.remove("thinking");
      document.getElementById("overlay-kicker").textContent = "Analysis complete";
      document.getElementById("overlay-title").textContent = "New Leads Found";
      document.getElementById("overlay-desc").textContent = "The evidence graph has revealed new investigative paths.";
      document.getElementById("overlay-reveal").classList.remove("hidden");
    }
  }, 45);

  try {
    await api(`/api/cases/${currentCaseId}/investigate`, { method: "POST" });
    await refreshMetrics();
  } catch (e) {
    clearInterval(timer);
    alert(e.message);
  }
}

// ---------- Analysis view ----------
async function loadAnalysis() {
  const root = document.getElementById("view-analysis");
  let a;
  try {
    a = await api(`/api/cases/${currentCaseId}/analysis`);
  } catch {
    root.innerHTML = `<div class="workspace-head"><div><span class="kicker">No investigation yet</span><h2>Run an investigation</h2><p>Add evidence and click "Run investigation" to begin.</p></div></div>`;
    return;
  }

  const findings = a.contradictions.map((c) => ({
    level: c.severity === "high" ? "High" : "Medium",
    title: c.description,
    confidence: c.severity === "high" ? "91%" : "84%",
    refs: [`E-${String(c.evidence_a_id).padStart(3, "0")}`, `E-${String(c.evidence_b_id).padStart(3, "0")}`],
  }));

  const hypotheses = a.hypotheses.map((h) => `
    <div class="hypothesis">
      <i class="${h.status === "supported" ? "supported" : h.status === "contradicted" ? "contradicted" : "uncertain"}"></i>
      <span><small>${h.status}</small><strong>${esc(h.statement)}</strong></span>
      <b>${h.confidence === "high" ? "86%" : h.confidence === "medium" ? "64%" : "42%"}</b>
    </div>`).join("");

  const unknowns = a.unknowns.map((u) => `
    <div class="missing-row">
      <span class="question-mark">?</span>
      <span><strong>${esc(u.question)}</strong><small>Required · ${esc(u.missing_evidence_needed || "Additional evidence")}</small></span>
      <button aria-label="Investigate"><span class="icon" data-icon="arrow"></span></button>
    </div>`).join("");

  root.innerHTML = `
    <div class="workspace-head">
      <div>
        <span class="kicker">Cross-reference complete</span>
        <h2>AI Case Analysis</h2>
        <p>${esc(a.summary)}</p>
      </div>
      <div class="analysis-score">
        <div><strong>${Math.min(99, 60 + a.facts.length * 3)}</strong><span>%</span></div>
        <p>Case clarity<br><b>+${a.facts.length * 2}% today</b></p>
      </div>
    </div>
    <div class="analysis-layout">
      <div class="panel findings-panel">
        <div class="panel-head">
          <div>
            <span class="panel-icon">${icon("spark")}</span>
            <span><strong>Key findings</strong><small>${findings.length} significant connections detected</small></span>
          </div>
          <button>View all ${icon("arrow")}</button>
        </div>
        <div class="finding-list">
          ${findings.map((f, i) => `
            <button class="finding" data-finding="${i}">
              <span class="severity ${f.level.toLowerCase()}">${f.level}</span>
              <span class="finding-content">
                <strong>${esc(f.title)}</strong>
                <span class="evidence-chips">${f.refs.map((r) => `<i>${r}</i>`).join("")}</span>
              </span>
              <span class="confidence"><small>Confidence</small><strong>${f.confidence}</strong></span>
              ${icon("chevron")}
            </button>`).join("")}
        </div>
      </div>
      <div class="panel contradiction-panel">
        <div class="panel-head">
          <div>
            <span class="panel-icon alert">${icon("scan")}</span>
            <span><strong>Priority contradiction</strong><small>Requires investigator review</small></span>
          </div>
          <span class="live-tag">High priority</span>
        </div>
        <div class="contradiction-copy">
          <h3>${a.contradictions[0] ? esc(a.contradictions[0].description) : "No contradictions detected yet."}</h3>
          ${a.contradictions[0] ? `<p>Evidence items E-${String(a.contradictions[0].evidence_a_id).padStart(3, "0")} and E-${String(a.contradictions[0].evidence_b_id).padStart(3, "0")} conflict with each other.</p>` : ""}
        </div>
        <div class="panel-actions">
          <button id="view-evidence-btn">${icon("eye")} View evidence</button>
          <button id="view-timeline-btn">${icon("clock")} View on timeline</button>
        </div>
      </div>
    </div>
    <div class="lower-grid">
      <div class="panel hypothesis-panel">
        <div class="panel-head">
          <div>
            <span class="panel-icon">${icon("brain")}</span>
            <span><strong>Active hypotheses</strong><small>AI-generated reasoning paths</small></span>
          </div>
          <span class="ghost-count">${String(a.hypotheses.length).padStart(2, "0")}</span>
        </div>
        ${hypotheses}
      </div>
      <div class="panel missing-panel">
        <div class="panel-head">
          <div>
            <span class="panel-icon">${icon("help")}</span>
            <span><strong>Unknown &amp; missing</strong><small>Investigation checklist</small></span>
          </div>
          <span class="ghost-count">${String(a.unknowns.length).padStart(2, "0")}</span>
        </div>
        ${unknowns}
      </div>
    </div>`;

  document.getElementById("view-evidence-btn")?.addEventListener("click", () => showView("evidence"));
  document.getElementById("view-timeline-btn")?.addEventListener("click", () => showView("timeline"));
}

// ---------- Evidence view ----------
async function loadEvidenceView() {
  const root = document.getElementById("view-evidence");
  const items = await api(`/api/cases/${currentCaseId}/evidence`);
  const filters = ["All", "witness", "chat", "email", "log", "cctv", "document", "timestamp"];
  const typeLabels = { witness: "Witness statement", chat: "Chat messages", email: "Email", log: "Access log", cctv: "CCTV", document: "Document", timestamp: "Timestamp" };

  root.innerHTML = `
    <div class="workspace-head">
      <div>
        <span class="kicker">Evidence repository · ${items.length} records</span>
        <h2>Evidence Intelligence</h2>
        <p>Collected material, cross-references and AI interpretation.</p>
      </div>
      <button class="secondary-action" id="add-evidence-btn">${icon("plus")} Add evidence</button>
    </div>
    <div class="filter-bar" id="filter-bar">
      ${filters.map((f) => `<button class="${f === "All" ? "active" : ""}" data-filter="${f}">${f === "All" ? "All" : typeLabels[f]}</button>`).join("")}
    </div>
    <div class="evidence-grid" id="evidence-grid"></div>`;

  const grid = document.getElementById("evidence-grid");
  function renderGrid(filter) {
    const filtered = filter === "All" ? items : items.filter((e) => e.type === filter);
    grid.innerHTML = filtered.length ? filtered.map((e) => `
      <article class="evidence-card">
        <div class="evidence-card-top">
          <span class="evidence-id">E-${String(e.id).padStart(3, "0")}</span>
          <span class="evidence-type">${icon(e.type === "cctv" ? "eye" : e.type === "log" ? "shield" : "file")} ${typeLabels[e.type] || e.type}</span>
          <button class="ev-del" data-id="${e.id}" aria-label="Delete">${icon("close")}</button>
        </div>
        <div class="evidence-meta">
          <span>Source <b>${esc(e.source_label || "Unknown")}</b></span>
          <span>Added <b>${e.created_at ? e.created_at.split(" ")[0] : ""}</b></span>
        </div>
        <blockquote>${esc(e.text)}</blockquote>
        <div class="ai-crosscheck">${icon("scan")}<span><small>AI cross-check</small><strong>Evidence indexed</strong></span></div>
        <div class="relations"><span>Related</span><i>${esc(e.source_label || "Unknown")}</i><i>E-${String(e.id).padStart(3, "0")}</i></div>
        <div class="evidence-actions">
          <button>${icon("eye")} View evidence</button>
          <button>${icon("link")} Connections</button>
        </div>
      </article>`).join("") : `<div class="evidence-empty">${icon("archive")}<strong>No evidence indexed</strong><p>Add evidence to begin the investigation.</p></div>`;

    grid.querySelectorAll(".ev-del").forEach((btn) => {
      btn.onclick = async () => {
        await api(`/api/evidence/${btn.dataset.id}`, { method: "DELETE" });
        loadEvidenceView();
      };
    });
  }
  renderGrid("All");

  document.getElementById("filter-bar").querySelectorAll("button").forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll("#filter-bar button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderGrid(btn.dataset.filter);
    };
  });

  document.getElementById("add-evidence-btn").onclick = () => {
    const type = prompt("Evidence type (witness/chat/email/log/cctv/document/timestamp):", "witness");
    if (!type) return;
    const source = prompt("Source (optional):") || "";
    const text = prompt("Evidence text:");
    if (!text) return;
    api(`/api/cases/${currentCaseId}/evidence`, { method: "POST", body: JSON.stringify({ type, source_label: source, text }) })
      .then(() => loadEvidenceView())
      .catch((e) => alert(e.message));
  };
}

// ---------- Timeline view ----------
async function loadTimeline() {
  const root = document.getElementById("view-timeline");
  let a;
  try {
    a = await api(`/api/cases/${currentCaseId}/analysis`);
  } catch {
    root.innerHTML = `<div class="workspace-head"><div><span class="kicker">No timeline yet</span><h2>Run an investigation</h2><p>The timeline will be reconstructed from evidence.</p></div></div>`;
    return;
  }

  const events = a.timeline_events;
  const conflictRefs = new Set(a.contradictions.flatMap((c) => [c.evidence_a_id, c.evidence_b_id]));

  root.innerHTML = `
    <div class="workspace-head">
      <div>
        <span class="kicker">Reconstructed sequence</span>
        <h2>Investigation Timeline</h2>
        <p>Events linked by timestamp, location and supporting evidence.</p>
      </div>
      <div class="legend">
        <span><i class="purple"></i> Key event</span>
        <span><i class="red"></i> Conflict</span>
        <span><i class="dashed"></i> Unknown</span>
      </div>
    </div>
    <div class="timeline-panel">
      <div class="timeline-scale"><span>Start</span><span></span><span></span><span>End</span></div>
      <div class="timeline-line">
        <div class="unknown-window"><span>${a.unknowns.length} unknowns</span></div>
        ${events.map((e, i) => {
          const isConflict = e.source_evidence_ids.some((id) => conflictRefs.has(id));
          const top = 8 + (i * 83) / Math.max(events.length - 1, 1);
          return `<button class="timeline-event ${isConflict ? "conflict" : ""}" data-tl="${i}" style="left:${top}%">
            <i></i>
            <div><time>${esc(e.timestamp_label)}</time><strong>${esc(e.event_description)}</strong><span>ev ${e.source_evidence_ids.join(", ")}</span></div>
          </button>`;
        }).join("")}
      </div>
      <div class="timeline-detail" id="timeline-detail"></div>
    </div>`;

  const detail = document.getElementById("timeline-detail");
  function showDetail(i) {
    const e = events[i];
    detail.innerHTML = `
      <div class="detail-time">${esc(e.timestamp_label)}<span>Event</span></div>
      <div>
        <span class="kicker">Selected event · ev ${e.source_evidence_ids.join(", ")}</span>
        <h3>${esc(e.event_description)}</h3>
        <p>This event is part of the reconstructed timeline, linked to evidence items ${e.source_evidence_ids.map((id) => "E-" + String(id).padStart(3, "0")).join(", ")}.</p>
      </div>
      <button class="secondary-action">Open evidence ${icon("arrow")}</button>`;
  }
  root.querySelectorAll(".timeline-event").forEach((btn) => {
    btn.onclick = () => {
      root.querySelectorAll(".timeline-event").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      showDetail(parseInt(btn.dataset.tl));
    };
  });
  if (events.length) showDetail(0);
}

// ---------- Connections view ----------
async function loadConnections() {
  const root = document.getElementById("view-connections");
  const ev = await api(`/api/cases/${currentCaseId}/evidence`);
  const people = [...new Set(ev.map((e) => e.source_label).filter(Boolean))].slice(0, 5);
  const nodes = [
    ...people.map((p, i) => ({ name: p, kind: "Person", x: 20 + i * 15, y: 30 + (i % 2) * 20 })),
    { name: "Case Evidence", kind: "Evidence", x: 50, y: 60 },
    { name: "Timeline", kind: "Event", x: 75, y: 35 },
  ];

  root.innerHTML = `
    <div class="workspace-head">
      <div>
        <span class="kicker">Knowledge model · ${nodes.length} entities</span>
        <h2>Connection Graph</h2>
        <p>Explore the relationships between people, places, events and evidence.</p>
      </div>
      <div class="graph-tools">
        <button>${icon("search")} Find node</button>
        <button>Reset view</button>
      </div>
    </div>
    <div class="graph-shell">
      <div class="graph-canvas">
        <svg class="connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M${nodes.map((n) => `${n.x} ${n.y}`).join(" L")}" />
          <path class="pulse-path" d="M${nodes[0].x} ${nodes[0].y} L${nodes[1] ? nodes[1].x : nodes[0].x} ${nodes[1] ? nodes[1].y : nodes[0].y}" />
        </svg>
        <div class="graph-grid"></div>
        ${nodes.map((n, i) => `
          <button class="graph-node ${n.kind.toLowerCase()} ${i === 0 ? "selected" : ""}" data-node="${i}" style="left:${n.x}%;top:${n.y}%">
            <span>${icon(n.kind === "Person" ? "brain" : n.kind === "Location" ? "scan" : n.kind === "Device" ? "archive" : "file")}</span>
            <strong>${esc(n.name)}</strong>
            <small>${n.kind}</small>
          </button>`).join("")}
      </div>
      <aside class="relation-panel">
        <span class="kicker">Selected entity</span>
        <div class="relation-avatar">${icon("brain")}</div>
        <h3 id="relation-name">${esc(nodes[0].name)}</h3>
        <p>Person of interest</p>
        <div class="relation-stats">
          <div><strong>${ev.length}</strong><span>Evidence</span></div>
          <div><strong>${nodes.length}</strong><span>Connections</span></div>
        </div>
        <h4>Known relationships</h4>
        ${ev.slice(0, 3).map((e) => `
          <div class="relation-row">
            <span class="mini-node">${icon("file")}</span>
            <span><strong>${esc(e.source_label || "Evidence")}</strong><small>${e.created_at ? e.created_at.split(" ")[0] : ""} · E-${String(e.id).padStart(3, "0")}</small></span>
          </div>`).join("")}
        <button class="run-button compact">
          <span><strong>Analyze entity</strong><small>Find hidden connections</small></span>
          ${icon("arrow")}
        </button>
      </aside>
    </div>`;

  root.querySelectorAll(".graph-node").forEach((btn) => {
    btn.onclick = () => {
      root.querySelectorAll(".graph-node").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      document.getElementById("relation-name").textContent = nodes[parseInt(btn.dataset.node)].name;
    };
  });
}

// ---------- A.C.I.D. chat view ----------
async function loadAcid() {
  const root = document.getElementById("view-acid");
  root.innerHTML = `
    <div class="acid-view">
      <div class="acid-ambient"></div>
      <div class="acid-visual">
        <span class="acid-label">Autonomous reasoning core</span>
        <div class="acid-core" id="acid-core">
          <div class="orbit orbit-one"><i></i><i></i><i></i></div>
          <div class="orbit orbit-two"><i></i><i></i></div>
          <div class="core-glow"></div>
          <div class="detective-portrait">
            <img src="/static/acid-detective.png" alt="A.C.I.D. detective" onerror="this.style.display='none'" />
            <div class="portrait-vignette"></div>
          </div>
          <div class="scan-line"></div>
        </div>
        <div class="acid-status" id="acid-status"><i></i><span id="acid-status-text">A.C.I.D. online</span></div>
      </div>
      <div class="acid-console">
        <span class="kicker">AI investigation intelligence</span>
        <h2>Follow the evidence.<br><em>Uncover the truth.</em></h2>
        <div class="acid-messages" id="acid-messages"></div>
        <div class="prompt-list">
          ${["Who is the strongest lead?", "Show contradictions", "What evidence is missing?", "What should I investigate next?"].map((p) => `
            <button data-prompt="${esc(p)}">${esc(p)} ${icon("arrow")}</button>`).join("")}
        </div>
        <form class="chat-input" id="chat-form">
          ${icon("spark")}
          <input id="chat-input" type="text" placeholder="Ask A.C.I.D. about this case..." autocomplete="off" />
          <button type="button" aria-label="Use microphone">${icon("mic")}</button>
          <button type="submit" class="send" aria-label="Send message">${icon("send")}</button>
        </form>
        <div class="console-meta">
          <span><i></i> Encrypted session</span>
          <span id="evidence-context">Evidence in context</span>
        </div>
      </div>
    </div>`;

  try {
    const ev = await api(`/api/cases/${currentCaseId}/evidence`);
    document.getElementById("evidence-context").textContent = `${ev.length} evidence items in context`;
  } catch {}

  const messagesEl = document.getElementById("acid-messages");
  function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = `acid-msg ${role}`;
    div.innerHTML = `<span class="acid-msg-icon">${icon(role === "user" ? "chevron" : "acid")}</span><p>${esc(text)}</p>`;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function askAcid(question) {
    const statusEl = document.getElementById("acid-status");
    const statusText = document.getElementById("acid-status-text");
    const core = document.getElementById("acid-core");
    addMessage("user", question);
    core.classList.add("thinking");
    statusEl.classList.add("processing");
    statusText.textContent = "Analyzing evidence...";
    try {
      const { answer } = await api(`/api/cases/${currentCaseId}/chat`, {
        method: "POST",
        body: JSON.stringify({ message: question }),
      });
      addMessage("detective", answer);
    } catch (e) {
      addMessage("detective", `Error: ${e.message}`);
    } finally {
      core.classList.remove("thinking");
      statusEl.classList.remove("processing");
      statusText.textContent = "A.C.I.D. online";
    }
  }

  root.querySelectorAll("[data-prompt]").forEach((btn) => {
    btn.onclick = () => askAcid(btn.dataset.prompt);
  });
  document.getElementById("chat-form").onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    askAcid(q);
  };
}

// ---------- Module selector ----------
function renderModules() {
  const mods = [
    { id: "analysis", label: "Analysis", icon: "scan", desc: "Find contradictions, anomalies and patterns." },
    { id: "evidence", label: "Evidence", icon: "archive", desc: "Review and connect collected evidence." },
    { id: "timeline", label: "Timeline", icon: "clock", desc: "Reconstruct events and identify gaps." },
    { id: "acid", label: "A.C.I.D.", icon: "brain", desc: "Interrogate the AI detective." },
  ];
  document.getElementById("modules").innerHTML = mods.map((m) => `
    <button class="module-card ${m.id === currentView ? "active" : ""} ${m.id === "acid" ? "acid-module" : ""}" data-view="${m.id}">
      <span class="module-icon">${icon(m.icon)}</span>
      <span class="module-copy"><strong>${m.label}</strong><small>${m.desc}</small></span>
    </button>`).join("");
  document.querySelectorAll(".module-card").forEach((c) => {
    c.onclick = () => showView(c.dataset.view);
  });
}

// ---------- Sidebar / mobile ----------
document.getElementById("new-case-btn").onclick = showNewCaseDialog;
document.getElementById("new-case-btn-2").onclick = showNewCaseDialog;
document.getElementById("investigate-btn").onclick = runInvestigation;
document.getElementById("overlay-close").onclick = () => document.getElementById("investigation-overlay").classList.add("hidden");
document.getElementById("overlay-reveal").onclick = () => {
  document.getElementById("investigation-overlay").classList.add("hidden");
  showView("analysis");
};
document.getElementById("mobile-menu").onclick = () => document.getElementById("sidebar").classList.add("sidebar-open");
document.getElementById("sidebar-close").onclick = () => document.getElementById("sidebar").classList.remove("sidebar-open");
document.getElementById("sidebar-scrim").onclick = () => document.getElementById("sidebar").classList.remove("sidebar-open");
document.getElementById("graph-link").onclick = () => showView("connections");
document.getElementById("brand-icon").innerHTML = icon("acid");

// ---------- Init ----------
(async function init() {
  renderModules();
  await loadCases();
  if (cases.length) {
    await selectCase(cases[0].id);
  }
})();
