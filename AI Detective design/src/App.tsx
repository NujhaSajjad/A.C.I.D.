import { useEffect, useState, type ReactNode } from "react"
import acidDetectiveImage from "./assets/acid-detective.png"

type View = "analysis" | "evidence" | "timeline" | "connections" | "acid"
type IconName = "acid" | "search" | "bell" | "plus" | "spark" | "scan" | "archive" | "clock" | "brain" | "graph" | "settings" | "help" | "chevron" | "arrow" | "shield" | "file" | "eye" | "link" | "mic" | "send" | "menu" | "close"

const iconPaths: Record<IconName, ReactNode> = {
  acid: (
    <>
      <path d="M12 2.8 4.3 7.2v9.6L12 21.2l7.7-4.4V7.2L12 2.8Z" />
      <path d="m8 10 4-2.2 4 2.2v4l-4 2.2L8 14v-4Z" />
      <path d="M12 7.8V3M8 10 4.3 7.7M16 10l3.7-2.3M8 14l-3.7 2.3M16 14l3.7 2.3M12 16.2V21" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.2 4.2" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8Z" />
      <path d="M10 21h4" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  spark: (
    <>
      <path d="m12 2 1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z" />
      <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
    </>
  ),
  scan: (
    <>
      <path d="M8 3H4a1 1 0 0 0-1 1v4M16 3h4a1 1 0 0 1 1 1v4M8 21H4a1 1 0 0 1-1-1v-4M16 21h4a1 1 0 0 0 1-1v-4" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 7v2M12 15v2M7 12h2M15 12h2" />
    </>
  ),
  archive: (
    <>
      <path d="M4 7h16v13H4zM3 3h18v4H3z" />
      <path d="M9 11h6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  brain: (
    <>
      <path d="M9.5 4.5A3 3 0 0 0 4.7 7a3.5 3.5 0 0 0-1.2 6.7A3.5 3.5 0 0 0 8 18.5c.5 1.5 1.8 2.5 4 2.5V3c-1 0-1.8.5-2.5 1.5ZM14.5 4.5A3 3 0 0 1 19.3 7a3.5 3.5 0 0 1 1.2 6.7 3.5 3.5 0 0 1-4.5 4.8c-.5 1.5-1.8 2.5-4 2.5V3c1 0 1.8.5 2.5 1.5Z" />
      <path d="M8 9h4M16 9h-4M7.5 14H12M16.5 14H12" />
    </>
  ),
  graph: (
    <>
      <circle cx="5" cy="12" r="2.5" />
      <circle cx="17" cy="5" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <path d="m7.2 10.8 7.6-4.6M7.3 13l9.3 4.2M17.4 7.5l1.2 8" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.6 2.6-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V21h-3.6v-.2A2 2 0 0 0 9 19a2 2 0 0 0-2.2.4l-.1.1-2.6-2.6.1-.1a2 2 0 0 0 .4-2.2A2 2 0 0 0 2.8 13H3V9.4h-.2A2 2 0 0 0 4.6 8a2 2 0 0 0-.4-2.2l-.1-.1 2.6-2.6.1.1A2 2 0 0 0 9 3.6 2 2 0 0 0 10.2 2h3.6A2 2 0 0 0 15 3.6a2 2 0 0 0 2.2-.4l.1-.1 2.6 2.6-.1.1a2 2 0 0 0-.4 2.2 2 2 0 0 0 1.8 1.2h.2V13h-.2a2 2 0 0 0-1.8 2Z" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.7 9a2.4 2.4 0 1 1 3.5 2.1c-.8.4-1.2.9-1.2 1.9M12 17h.01" />
    </>
  ),
  chevron: <path d="m9 6 6 6-6 6" />,
  arrow: (
    <>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.7 2.8 8.2 7 10 4.2-1.8 7-5.3 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5M9 12h6M9 16h6" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  link: (
    <>
      <path d="m10 13.5 4-4" />
      <path d="M7.5 16.5 5 19a3.5 3.5 0 1 1-5-5l3-3a3.5 3.5 0 0 1 5 0M16.5 7.5 19 5a3.5 3.5 0 1 1 5 5l-3 3a3.5 3.5 0 0 1-5 0" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
    </>
  ),
  send: (
    <>
      <path d="m3 3 19 9-19 9 4-9-4-9Z" />
      <path d="M7 12h15" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
}

function Icon({ name, size = 20 }: { name: IconName size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  )
}

const cases = [
  {
    id: "002",
    title: "The Missing Research File",
    status: "Active",
    time: "8 min ago",
  },
  {
    id: "001",
    title: "The Stolen Prototype",
    status: "Archived",
    time: "2 days ago",
  },
  {
    id: "000",
    title: "Unauthorized Access",
    status: "Closed",
    time: "5 days ago",
  },
]

const modules: {
  id: View
  label: string
  icon: IconName
  desc: string
  stat: string
  sub: string
}[] = [
  {
    id: "analysis",
    label: "Analysis",
    icon: "scan",
    desc: "Find contradictions, anomalies and patterns.",
    stat: "3 contradictions",
    sub: "2 anomalies",
  },
  {
    id: "evidence",
    label: "Evidence",
    icon: "archive",
    desc: "Review and connect collected evidence.",
    stat: "18 evidence items",
    sub: "6 types",
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: "clock",
    desc: "Reconstruct events and identify gaps.",
    stat: "7 key events",
    sub: "2 timeline gaps",
  },
  {
    id: "acid",
    label: "A.C.I.D.",
    icon: "brain",
    desc: "Interrogate the AI detective.",
    stat: "AI READY",
    sub: "All systems online",
  },
]

function Sidebar({ open, onClose }: { open: boolean onClose: () => void }) {
  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">
          <Icon name="acid" size={24} />
        </div>
        <div>
          <strong>A.C.I.D.</strong>
          <span>Case Intelligence</span>
        </div>
        <button
          className="icon-button mobile-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="side-head">
        <span>Case archive</span>
        <span className="count">03</span>
      </div>
      <button className="side-new">
        <Icon name="plus" size={17} /> New case
      </button>
      <div className="case-list">
        {cases.map((item, index) => (
          <button
            className={`case-card ${index === 0 ? "selected" : ""}`}
            key={item.id}
          >
            <span className="case-top">
              <span>Case {item.id}</span>
              <span className={`status-dot ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
            </span>
            <strong>{item.title}</strong>
            <span className="case-time">Last activity · {item.time}</span>
          </button>
        ))}
      </div>
      <div className="side-spacer" />
      <nav className="side-links">
        <button>
          <Icon name="settings" size={18} /> Settings
        </button>
        <button>
          <Icon name="help" size={18} /> Intelligence help
        </button>
      </nav>
      <div className="investigator">
        <div className="avatar">AK</div>
        <div>
          <strong>Alex Kane</strong>
          <span>Lead investigator</span>
        </div>
        <Icon name="chevron" size={16} />
      </div>
    </aside>
  )
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="topbar">
      <button
        className="icon-button mobile-menu"
        onClick={onMenu}
        aria-label="Open sidebar"
      >
        <Icon name="menu" />
      </button>
      <div className="product">
        <span>Autonomous Crime Investigation & Detection</span>
        <strong>Case intelligence system</strong>
      </div>
      <div className="system-online">
        <i /> System online
      </div>
      <div className="top-actions">
        <button className="icon-button" aria-label="Search">
          <Icon name="search" />
        </button>
        <button className="icon-button notification" aria-label="Notifications">
          <Icon name="bell" />
          <i />
        </button>
        <div className="ai-health">
          <Icon name="shield" size={16} />
          <span>AI integrity</span>
          <strong>99.8%</strong>
        </div>
        <button className="new-case">
          <Icon name="plus" size={17} /> <span>New case</span>
        </button>
      </div>
    </header>
  )
}

function CaseHeader({ onRun }: { onRun: () => void }) {
  return (
    <section className="case-header">
      <div className="case-copy">
        <div className="eyebrow">
          <span>Case 002</span>
          <i /> Active investigation
        </div>
        <h1>
          The Missing
          <br />
          <em>Research File</em>
        </h1>
        <p>
          A confidential university research file disappeared from Lab 204
          between 7:00 PM and 8:30 PM.
        </p>
        <div className="case-tags">
          <span>
            <i className="active-dot" /> Active
          </span>
          <span>
            Priority <b>High</b>
          </span>
          <span>Opened 24 May, 2025</span>
        </div>
      </div>
      <div className="case-actions">
        <div className="metric-grid">
          <div>
            <strong>03</strong>
            <span>
              Persons
              <br />
              of interest
            </span>
          </div>
          <div>
            <strong>18</strong>
            <span>
              Evidence
              <br />
              items
            </span>
          </div>
          <div>
            <strong>07</strong>
            <span>
              Active
              <br />
              leads
            </span>
          </div>
          <div className="danger-metric">
            <strong>02</strong>
            <span>
              Critical
              <br />
              conflicts
            </span>
          </div>
        </div>
        <button className="run-button" onClick={onRun}>
          <span className="run-icon">
            <Icon name="spark" size={24} />
          </span>
          <span>
            <strong>Run investigation</strong>
            <small>Analyze evidence & discover connections</small>
          </span>
          <Icon name="arrow" size={20} />
        </button>
      </div>
    </section>
  )
}

function ModuleSelector({
  view,
  setView,
}: {
  view: View
  setView: (view: View) => void
}) {
  return (
    <div className="module-wrap">
      <div className="section-label">
        <span>Investigation modules</span>
        <button
          onClick={() => setView("connections")}
          className={view === "connections" ? "active-link" : ""}
        >
          <Icon name="graph" size={15} /> Knowledge graph
        </button>
      </div>
      <div className="modules">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => setView(module.id)}
            className={`module-card ${view === module.id ? "active" : ""} ${
              module.id === "acid" ? "acid-module" : ""
            }`}
          >
            <span className="module-icon">
              <Icon name={module.icon} size={18} />
            </span>
            <span className="module-copy">
              <strong>{module.label}</strong>
              <small>{module.stat}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

const findings = [
  {
    level: "High",
    title: "Sarah’s statement conflicts with access records.",
    confidence: "91%",
    refs: ["E-007", "E-008", "E-015"],
  },
  {
    level: "Medium",
    title: "A 27-minute gap exists in Lab 204 CCTV.",
    confidence: "84%",
    refs: ["E-004", "E-011"],
  },
  {
    level: "High",
    title: "The USB was accessed from an unknown device.",
    confidence: "88%",
    refs: ["E-002", "E-018"],
  },
]

function AnalysisView() {
  const [expanded, setExpanded] = useState(0)
  return (
    <section className="workspace view-enter">
      <div className="workspace-head">
        <div>
          <span className="kicker">Cross-reference complete</span>
          <h2>AI Case Analysis</h2>
          <p>
            Evidence has been cross-referenced across 18 items and 7 event
            records.
          </p>
        </div>
        <div className="analysis-score">
          <div>
            <strong>87</strong>
            <span>%</span>
          </div>
          <p>
            Case clarity
            <br />
            <b>+12% today</b>
          </p>
        </div>
      </div>
      <div className="analysis-layout">
        <div className="panel findings-panel">
          <div className="panel-head">
            <div>
              <span className="panel-icon">
                <Icon name="spark" size={18} />
              </span>
              <span>
                <strong>Key findings</strong>
                <small>3 significant connections detected</small>
              </span>
            </div>
            <button>
              View all <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="finding-list">
            {findings.map((finding, index) => (
              <button
                className={`finding ${expanded === index ? "expanded" : ""}`}
                key={finding.title}
                onClick={() => setExpanded(index)}
              >
                <span className={`severity ${finding.level.toLowerCase()}`}>
                  {finding.level}
                </span>
                <span className="finding-content">
                  <strong>{finding.title}</strong>
                  <span className="evidence-chips">
                    {finding.refs.map((ref) => (
                      <i key={ref}>{ref}</i>
                    ))}
                  </span>
                  {expanded === index && (
                    <p>
                      Access telemetry places the same credential inside the
                      restricted zone after the stated departure time.
                    </p>
                  )}
                </span>
                <span className="confidence">
                  <small>Confidence</small>
                  <strong>{finding.confidence}</strong>
                </span>
                <Icon name="chevron" size={16} />
              </button>
            ))}
          </div>
        </div>
        <div className="panel contradiction-panel">
          <div className="panel-head">
            <div>
              <span className="panel-icon alert">
                <Icon name="scan" size={18} />
              </span>
              <span>
                <strong>Priority contradiction</strong>
                <small>Requires investigator review</small>
              </span>
            </div>
            <span className="live-tag">High priority</span>
          </div>
          <div className="contradiction-copy">
            <h3>Sarah’s statement conflicts with university access records.</h3>
            <p>
              She stated that she left the university at <b>18:45</b>. Two
              independent signals place her near Lab 204 later.
            </p>
            <div className="signal">
              <span>University ID</span>
              <strong>19:12</strong>
              <p>Credential used · Lab 204</p>
              <i />
            </div>
            <div className="signal">
              <span>CCTV match</span>
              <strong>19:20</strong>
              <p>Person matching Sarah’s profile</p>
              <i />
            </div>
          </div>
          <div className="panel-actions">
            <button>
              <Icon name="eye" size={16} /> View evidence
            </button>
            <button>
              <Icon name="clock" size={16} /> View on timeline
            </button>
          </div>
        </div>
      </div>
      <div className="lower-grid">
        <div className="panel hypothesis-panel">
          <div className="panel-head">
            <div>
              <span className="panel-icon">
                <Icon name="brain" size={18} />
              </span>
              <span>
                <strong>Active hypotheses</strong>
                <small>AI-generated reasoning paths</small>
              </span>
            </div>
            <span className="ghost-count">03</span>
          </div>
          <div className="hypothesis">
            <i className="supported" />
            <span>
              <small>Supported</small>
              <strong>
                Sarah entered Lab 204 during the disappearance window.
              </strong>
            </span>
            <b>86%</b>
          </div>
          <div className="hypothesis">
            <i className="supported" />
            <span>
              <small>Supported</small>
              <strong>Sarah’s ID was used by its registered owner.</strong>
            </span>
            <b>74%</b>
          </div>
          <div className="hypothesis">
            <i className="uncertain" />
            <span>
              <small>Uncertain</small>
              <strong>
                Hamza left the library during the critical window.
              </strong>
            </span>
            <b>48%</b>
          </div>
        </div>
        <div className="panel missing-panel">
          <div className="panel-head">
            <div>
              <span className="panel-icon">
                <Icon name="help" size={18} />
              </span>
              <span>
                <strong>Unknown & missing</strong>
                <small>Investigation checklist</small>
              </span>
            </div>
            <span className="ghost-count">03</span>
          </div>
          {[
            [
              "What was Sarah’s true activity after 18:45?",
              "Additional CCTV / witness",
            ],
            ["Where was Hamza between 19:18–20:02?", "Library exit logs"],
            ["Who accessed the equipment cabinet?", "Physical access logs"],
          ].map(([question, required], index) => (
            <div className="missing-row" key={question}>
              <span className="question-mark">?</span>
              <span>
                <strong>{question}</strong>
                <small>Required · {required}</small>
              </span>
              <button aria-label={`Investigate question ${index + 1}`}>
                <Icon name="arrow" size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const evidenceItems = [
  {
    id: "E-017",
    type: "Witness statement",
    source: "Sarah Malik",
    time: "19:45",
    text: "“I left the university at 6:45 PM.”",
    flag: "Contradiction detected",
    people: "Sarah",
    place: "Lab 204",
  },
  {
    id: "E-008",
    type: "Access log",
    source: "University ID System",
    time: "19:12",
    text: "Credential S-194 entered restricted Lab 204.",
    flag: "Identity correlation",
    people: "Sarah",
    place: "East Wing",
  },
  {
    id: "E-015",
    type: "CCTV",
    source: "Camera C-04",
    time: "19:20",
    text: "Female subject observed outside Lab 204.",
    flag: "Visual match · 83%",
    people: "Sarah",
    place: "Lab 204",
  },
  {
    id: "E-018",
    type: "Digital evidence",
    source: "USB telemetry",
    time: "19:47",
    text: "Encrypted research file copied to unknown device.",
    flag: "New device detected",
    people: "Unknown",
    place: "Lab 204",
  },
]

function EvidenceView({ setView }: { setView: (view: View) => void }) {
  const filters = [
    "All",
    "Witness",
    "CCTV",
    "Access logs",
    "Documents",
    "Messages",
    "Digital",
  ]
  const [filter, setFilter] = useState("All")
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null)
  const filteredEvidence = evidenceItems.filter((item) => {
    if (filter === "All") return true
    if (filter === "Witness") return item.type === "Witness statement"
    if (filter === "Digital") return item.type === "Digital evidence"
    return item.type === filter || item.type === filter.replace(/s$/, "")
  })
  return (
    <section className="workspace view-enter">
      <div className="workspace-head">
        <div>
          <span className="kicker">Evidence repository · 18 records</span>
          <h2>Evidence Intelligence</h2>
          <p>Collected material, cross-references and AI interpretation.</p>
        </div>
        <button className="secondary-action">
          <Icon name="plus" size={17} /> Add evidence
        </button>
      </div>
      <div className="filter-bar">
        {filters.map((item) => (
          <button
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="evidence-grid">
        {filteredEvidence.map((item, index) => (
          <article className="evidence-card" key={item.id}>
            <div className="evidence-card-top">
              <span className="evidence-id">{item.id}</span>
              <span className="evidence-type">
                <Icon
                  name={
                    item.type === "CCTV"
                      ? "eye"
                      : item.type === "Access log"
                        ? "shield"
                        : "file"
                  }
                  size={15}
                />
                {item.type}
              </span>
              <button
                onClick={() =>
                  setExpandedEvidence(
                    expandedEvidence === item.id ? null : item.id,
                  )
                }
                aria-label="Open evidence"
              >
                <Icon name="chevron" size={16} />
              </button>
            </div>
            <div className="evidence-meta">
              <span>
                Source <b>{item.source}</b>
              </span>
              <span>
                Timestamp <b>{item.time}</b>
              </span>
            </div>
            <blockquote>{item.text}</blockquote>
            <div className={`ai-crosscheck ${index === 0 ? "warning" : ""}`}>
              <Icon name="scan" size={17} />
              <span>
                <small>AI cross-check</small>
                <strong>{item.flag}</strong>
              </span>
            </div>
            <div className="relations">
              <span>Related</span>
              <i>{item.people}</i>
              <i>{item.place}</i>
              <i>E-008</i>
            </div>
            {expandedEvidence === item.id && (
              <div className="evidence-detail">
                <span>AI interpretation</span>
                <p>
                  This record is consistent with the recovered system metadata
                  and has been linked to the primary disappearance window.
                </p>
                <div>
                  Integrity verified <b>98%</b>
                </div>
              </div>
            )}
            <div className="evidence-actions">
              <button
                onClick={() =>
                  setExpandedEvidence(
                    expandedEvidence === item.id ? null : item.id,
                  )
                }
              >
                <Icon name="eye" size={15} /> View evidence
              </button>
              <button onClick={() => setView("connections")}>
                <Icon name="link" size={15} /> Connections
              </button>
            </div>
          </article>
        ))}
        {filteredEvidence.length === 0 && (
          <div className="evidence-empty">
            <Icon name="archive" size={26} />
            <strong>No {filter.toLowerCase()} evidence indexed</strong>
            <p>Try another category or add a new evidence record.</p>
          </div>
        )}
      </div>
    </section>
  )
}

const timelineEvents = [
  {
    time: "18:45",
    title: "Sarah claims she leaves",
    type: "claim",
    ref: "E-017",
  },
  {
    time: "19:12",
    title: "Sarah’s ID enters Lab 204",
    type: "conflict",
    ref: "E-008",
  },
  {
    time: "19:20",
    title: "Possible visual match",
    type: "conflict",
    ref: "E-015",
  },
  {
    time: "19:47",
    title: "USB disappearance detected",
    type: "key",
    ref: "E-018",
  },
  {
    time: "20:02",
    title: "Hamza’s account active",
    type: "claim",
    ref: "E-012",
  },
]

function TimelineView() {
  const [selected, setSelected] = useState(3)
  return (
    <section className="workspace view-enter">
      <div className="workspace-head">
        <div>
          <span className="kicker">Reconstructed sequence · 18:00–21:00</span>
          <h2>Investigation Timeline</h2>
          <p>Events linked by timestamp, location and supporting evidence.</p>
        </div>
        <div className="legend">
          <span>
            <i className="purple" /> Key event
          </span>
          <span>
            <i className="red" /> Conflict
          </span>
          <span>
            <i className="dashed" /> Unknown
          </span>
        </div>
      </div>
      <div className="timeline-panel">
        <div className="timeline-scale">
          <span>18:00</span>
          <span>19:00</span>
          <span>20:00</span>
          <span>21:00</span>
        </div>
        <div className="timeline-line">
          <div className="unknown-window">
            <span>27 min unknown</span>
          </div>
          {timelineEvents.map((event, index) => (
            <button
              className={`timeline-event ${event.type} ${
                selected === index ? "selected" : ""
              }`}
              onClick={() => setSelected(index)}
              key={event.time}
            >
              <i />
              <div>
                <time>{event.time}</time>
                <strong>{event.title}</strong>
                <span>{event.ref}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="timeline-detail">
          <div className="detail-time">
            {timelineEvents[selected].time}
            <span>Critical window</span>
          </div>
          <div>
            <span className="kicker">
              Selected event · {timelineEvents[selected].ref}
            </span>
            <h3>{timelineEvents[selected].title}</h3>
            <p>
              A key event within the disappearance window. A.C.I.D. has linked
              this record to 3 other evidence items and one person of interest.
            </p>
          </div>
          <button className="secondary-action">
            Open evidence <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

function ConnectionsView() {
  const [selected, setSelected] = useState("Sarah Malik")
  const nodes = [
    { name: "Sarah Malik", kind: "Person", x: 24, y: 36 },
    { name: "Lab 204", kind: "Location", x: 50, y: 48 },
    { name: "USB Drive", kind: "Device", x: 73, y: 27 },
    { name: "E-017", kind: "Evidence", x: 78, y: 68 },
    { name: "19:12 Entry", kind: "Event", x: 37, y: 76 },
  ]
  return (
    <section className="workspace view-enter">
      <div className="workspace-head">
        <div>
          <span className="kicker">Knowledge model · 42 relationships</span>
          <h2>Connection Graph</h2>
          <p>
            Explore the relationships between people, places, events and
            evidence.
          </p>
        </div>
        <div className="graph-tools">
          <button>
            <Icon name="search" size={16} /> Find node
          </button>
          <button>Reset view</button>
        </div>
      </div>
      <div className="graph-shell">
        <div className="graph-canvas">
          <svg
            className="connections"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M24 36 50 48 73 27M50 48 78 68M24 36 37 76 78 68M37 76 50 48" />
            <path className="pulse-path" d="M24 36 50 48 73 27" />
          </svg>
          <div className="graph-grid" />
          {nodes.map((node) => (
            <button
              onClick={() => setSelected(node.name)}
              className={`graph-node ${
                selected === node.name ? "selected" : ""
              } ${node.kind.toLowerCase()}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              key={node.name}
            >
              <span>
                <Icon
                  name={
                    node.kind === "Person"
                      ? "brain"
                      : node.kind === "Location"
                        ? "scan"
                        : node.kind === "Device"
                          ? "archive"
                          : "file"
                  }
                  size={20}
                />
              </span>
              <strong>{node.name}</strong>
              <small>{node.kind}</small>
            </button>
          ))}
        </div>
        <aside className="relation-panel">
          <span className="kicker">Selected entity</span>
          <div className="relation-avatar">
            <Icon name="brain" size={28} />
          </div>
          <h3>{selected}</h3>
          <p>Person of interest · University researcher</p>
          <div className="relation-stats">
            <div>
              <strong>06</strong>
              <span>Connections</span>
            </div>
            <div>
              <strong>04</strong>
              <span>Evidence</span>
            </div>
          </div>
          <h4>Known relationships</h4>
          <div className="relation-row">
            <span className="mini-node location">
              <Icon name="scan" size={15} />
            </span>
            <span>
              <strong>Accessed Lab 204</strong>
              <small>19:12 · E-008</small>
            </span>
          </div>
          <div className="relation-row">
            <span className="mini-node">
              <Icon name="file" size={15} />
            </span>
            <span>
              <strong>Made statement</strong>
              <small>19:45 · E-017</small>
            </span>
          </div>
          <button className="run-button compact">
            <span>
              <strong>Analyze entity</strong>
              <small>Find hidden connections</small>
            </span>
            <Icon name="arrow" size={17} />
          </button>
        </aside>
      </div>
    </section>
  )
}

function AcidCore({ thinking = false }: { thinking?: boolean }) {
  return (
    <div
      className={`acid-core ${thinking ? "thinking" : ""}`}
      aria-label="A.C.I.D. artificial intelligence core"
    >
      <div className="orbit orbit-one">
        <i />
        <i />
        <i />
      </div>
      <div className="orbit orbit-two">
        <i />
        <i />
      </div>
      <div className="core-glow" />
      <div className="detective-portrait">
        <img
          src={acidDetectiveImage}
          alt="Purple cybernetic A.C.I.D. detective"
        />
        <div className="portrait-vignette" />
      </div>
      <div className="scan-line" />
    </div>
  )
}

function AcidView() {
  const [message, setMessage] = useState("")
  const [thinking, setThinking] = useState(false)
  const ask = (prompt: string) => {
    setMessage(prompt)
    setThinking(true)
    window.setTimeout(() => setThinking(false), 1800)
  }
  return (
    <section className="acid-view view-enter">
      <div className="acid-ambient" />
      <div className="acid-visual">
        <span className="acid-label">Autonomous reasoning core</span>
        <AcidCore thinking={thinking} />
        <div className={`acid-status ${thinking ? "processing" : ""}`}>
          <i />
          {thinking ? "Analyzing evidence..." : "A.C.I.D. online"}
        </div>
      </div>
      <div className="acid-console">
        <span className="kicker">AI investigation intelligence</span>
        <h2>
          Follow the evidence.
          <br />
          <em>Uncover the truth.</em>
        </h2>
        <div className="acid-message">
          <span>
            <Icon name="acid" size={20} />
          </span>
          <p>
            {thinking
              ? "Cross-referencing your question with the evidence graph and reconstructed timeline…"
              : "I found 3 significant connections across the evidence. Would you like me to explain the strongest lead?"}
          </p>
        </div>
        <div className="prompt-list">
          {[
            "Who is the strongest lead?",
            "Show contradictions",
            "What evidence is missing?",
            "What should I investigate next?",
          ].map((prompt) => (
            <button onClick={() => ask(prompt)} key={prompt}>
              {prompt}
              <Icon name="arrow" size={15} />
            </button>
          ))}
        </div>
        <form
          className="chat-input"
          onSubmit={(event) => {
            event.preventDefault()
            if (message) ask(message)
          }}
        >
          <Icon name="spark" size={19} />
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask A.C.I.D. about this case..."
            aria-label="Ask A.C.I.D."
          />
          <button type="button" aria-label="Use microphone">
            <Icon name="mic" size={19} />
          </button>
          <button type="submit" className="send" aria-label="Send message">
            <Icon name="send" size={18} />
          </button>
        </form>
        <div className="console-meta">
          <span>
            <i /> Encrypted session
          </span>
          <span>18 evidence items in context</span>
        </div>
      </div>
    </section>
  )
}

const processSteps = [
  "Evidence indexed",
  "Entities extracted",
  "Timeline reconstructed",
  "Relationships mapped",
  "Contradictions detected",
  "Hypotheses generated",
]

function InvestigationOverlay({ onClose }: { onClose: () => void }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(
      () => setProgress((value) => (value >= 100 ? 100 : value + 2)),
      45,
    )
    return () => window.clearInterval(timer)
  }, [])
  const doneSteps = Math.floor((progress / 100) * processSteps.length)
  return (
    <div className="investigation-overlay">
      <div className="investigation-modal">
        <button
          className="icon-button modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="close" />
        </button>
        <div className="processing-core">
          <AcidCore thinking={progress < 100} />
        </div>
        <div className="processing-info">
          <span className="kicker">
            {progress < 100
              ? "Autonomous case processing"
              : "Analysis complete"}
          </span>
          <h2>
            {progress < 100 ? "A.C.I.D. Initializing" : "3 New Leads Found"}
          </h2>
          <p>
            {progress < 100
              ? "Mapping every signal. Testing every statement."
              : "The evidence graph has revealed new investigative paths."}
          </p>
          <div className="progress-bar">
            <i style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-number">
            {progress}
            <span>%</span>
          </div>
          <div className="process-steps">
            {processSteps.map((step, index) => (
              <div className={index < doneSteps ? "done" : ""} key={step}>
                <i>{index < doneSteps ? "✓" : "·"}</i>
                <span>{step}</span>
              </div>
            ))}
          </div>
          {progress === 100 && (
            <button className="run-button reveal" onClick={onClose}>
              <span>
                <strong>Reveal findings</strong>
                <small>Open updated case intelligence</small>
              </span>
              <Icon name="arrow" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>("analysis")
  const [sidebar, setSidebar] = useState(false)
  const [investigating, setInvestigating] = useState(false)
  return (
    <div className="app-shell">
      <Sidebar open={sidebar} onClose={() => setSidebar(false)} />
      {sidebar && (
        <button
          className="sidebar-scrim"
          onClick={() => setSidebar(false)}
          aria-label="Close sidebar"
        />
      )}
      <div className="app-main">
        <Topbar onMenu={() => setSidebar(true)} />
        <main>
          <CaseHeader onRun={() => setInvestigating(true)} />
          <ModuleSelector view={view} setView={setView} />
          {view === "analysis" && <AnalysisView />}
          {view === "evidence" && <EvidenceView setView={setView} />}
          {view === "timeline" && <TimelineView />}
          {view === "connections" && <ConnectionsView />}
          {view === "acid" && <AcidView />}
        </main>
      </div>
      {investigating && (
        <InvestigationOverlay onClose={() => setInvestigating(false)} />
      )}
    </div>
  )
}
