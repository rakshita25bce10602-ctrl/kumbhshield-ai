import CrowdMap from "./CrowdMap";
import { useEffect , useState } from "react";
import "./App.css";

const initialZones = [
  { id: 1, name: "Sangam Ghat", crowd: 82, people: 8200 },
  { id: 2, name: "Sector 4", crowd: 48, people: 4800 },
  { id: 3, name: "Main Entrance", crowd: 67, people: 6700 },
  { id: 4, name: "Medical Zone", crowd: 24, people: 2400 },
];

const initialIncidents = [
  {
    id: 101,
    type: "Crowd congestion",
    location: "Sangam Ghat",
    severity: "High",
    status: "Responding",
  },
  {
    id: 102,
    type: "Medical assistance",
    location: "Sector 4",
    severity: "Medium",
    status: "Open",
  },
];

function getRisk(value) {
  if (value >= 75) return "High";
  if (value >= 50) return "Medium";
  return "Low";
}

function getResponsePlan(incident) {
  const type = incident.type.toLowerCase();

  if (type.includes("medical")) {
    return {
      team: "Medical Response Team",
      actions: [
        "Notify the designated medical response team.",
        "Confirm the reported location and situation.",
        "Coordinate assistance through trained responders.",
      ],
    };
  }

  if (type.includes("crowd")) {
    return {
      team: "Crowd Management Team",
      actions: [
        "Notify the designated crowd management team.",
        "Verify crowd conditions at the reported location.",
        "Coordinate safe movement with trained personnel.",
      ],
    };
  }

  if (type.includes("missing")) {
    return {
      team: "Security and Help Desk",
      actions: [
        "Notify the designated help desk and security team.",
        "Record the information provided in the report.",
        "Follow the site's established missing-person procedure.",
      ],
    };
  }

  if (type.includes("fire")) {
    return {
      team: "Fire and Safety Team",
      actions: [
        "Notify the designated fire and safety team.",
        "Follow the site's established fire emergency procedure.",
        "Keep people away from the reported hazard when safe to do so.",
      ],
    };
  }

  if (type.includes("blocked exit")) {
    return {
      team: "Safety and Access Team",
      actions: [
        "Notify the designated safety team.",
        "Verify the reported obstruction.",
        "Coordinate safe access restoration with trained personnel.",
      ],
    };
  }

  return {
    team: "Incident Response Team",
    actions: [
      "Notify the designated response team.",
      "Verify the reported situation and location.",
      "Follow the site's established emergency procedure.",
    ],
  };
}
function App() {
  const [zones, setZones] = useState(initialZones);
  const [incidents, setIncidents] = useState(() => {
    try {
    const savedIncidents = localStorage.getItem("kumbhshield_incidents");

    const incidentsToLoad = savedIncidents
      ? JSON.parse(savedIncidents)
      : initialIncidents;

    return incidentsToLoad.map((incident) => ({
      ...incident,
      priorityScore:
        incident.priorityScore ??
        ({ Low: 25, Medium: 60, High: 90 }[incident.severity] ?? 60),
    }));
  } catch (error) {
    console.error("Could not load saved incidents:", error);

    return initialIncidents.map((incident) => ({
      ...incident,
      priorityScore:
        { Low: 25, Medium: 60, High: 90 }[incident.severity] ?? 60,
    }));
  }
});

useEffect(() => {
  try {
    localStorage.setItem(
      "kumbhshield_incidents",
      JSON.stringify(incidents)
    );
  } catch (error) {
    console.error("Could not save incidents:", error);
  }
}, [incidents]);
  const [incidentFilter, setIncidentFilter] = useState("All");
  const openCount = incidents.filter(
  (incident) => incident.status === "Open"
).length;

const respondingCount = incidents.filter(
  (incident) => incident.status === "Responding"
).length;

const resolvedCount = incidents.filter(
  (incident) => incident.status === "Resolved"
).length;
const totalIncidents = incidents.length;

const unresolvedHighPriority = incidents.filter(
  (incident) =>
    incident.severity === "High" &&
    incident.status !== "Resolved"
).length;

const resolutionRate =
  totalIncidents === 0
    ? 0
    : Math.round((resolvedCount / totalIncidents) * 100);

const averagePriorityScore =
  totalIncidents === 0
    ? 0
    : Math.round(
        incidents.reduce(
          (sum, incident) => sum + (incident.priorityScore ?? 0),
          0
        ) / totalIncidents
      );


const emergencyAlerts = incidents.filter(
  (incident) =>
    incident.severity === "High" &&
    incident.status !== "Resolved"
);

  const [form, setForm] = useState({
    type: "Medical assistance",
    location: "Sangam Ghat",
    severity: "Medium",
    description: "",
  });

  const highRisk = zones.filter((z) => getRisk(z.crowd) === "High").length;
  const averageCrowd = Math.round(
    zones.reduce((sum, zone) => sum + zone.crowd, 0) / zones.length
  );
  const crowdAlerts = zones
  .filter((zone) => getRisk(zone.crowd) === "High")
  .map((zone) => ({
    id: zone.id,
    name: zone.name,
    crowd: zone.crowd,
    message: `High crowd risk detected in ${zone.name}`,
  }));

  function simulateCrowdChange() {
    setZones((current) =>
      current.map((zone) => {
        const change = Math.floor(Math.random() * 31) - 15;
        const crowd = Math.max(5, Math.min(100, zone.crowd + change));

        return {
          ...zone,
          crowd,
          people: Math.round(crowd * 100),
        };
      })
    );
  }

  function reportIncident(event) {
    event.preventDefault();

    // Prevent submission if the description is empty
    if (!form.description.trim()) {
      alert("Please enter a description of the incident.");
      return;
    }

    const severityScore = {
      Low: 25,
      Medium: 60,
      High: 90,
    };

    const newIncident = {
      id: Date.now(),
      type: form.type,
      location: form.location,
      severity: form.severity,
      description: form.description.trim(),
      status: "Open",
      priorityScore: severityScore[form.severity] ?? 60,
    };

    setIncidents((current) => [newIncident, ...current]);

    setForm({
      type: "Medical assistance",
      location: "Sangam Ghat",
      severity: "Medium",
      description: "",
    });
  }
  function downloadIncidentReport() {
  const headers = [
    "Incident ID",
    "Type",
    "Location",
    "Severity",
    "Priority Score",
    "Status",
    "Description",
  ];

  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const rows = incidents.map((incident) => [
    incident.id,
    incident.type,
    incident.location,
    incident.severity,
    incident.priorityScore ?? "",
    incident.status,
    incident.description,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "kumbhshield-incident-report.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
  function updateStatus(id) {
    setIncidents((current) =>
      current.map((incident) => {
        if (incident.id !== id) {
          return incident;
        }
        if (incident.status === "Open") {
          return { ...incident, status: "Responding" };
        }
        if (incident.status === "Responding") {
          return { ...incident, status: "Resolved" };
        }
        return incident;
      })
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">K</div>
          <div>
            <h2>KumbhShield</h2>
            <p>AI SAFETY PLATFORM</p>
          </div>
        </div>

        <div className="sidebar-label">MAIN MENU</div>

        <nav className="navigation">
          <a className="nav-item active" href="#overview">▦ Overview</a>
          <a className="nav-item" href="#zones">◉ Crowd monitoring</a>
          <a className="nav-item" href="#incidents">⚑ Incidents</a>
          <a className="nav-item" href="#report">＋ Report emergency</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <div>
            <strong>Demo environment</strong>
            <p>Using simulated data</p>
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div>
            <p className="eyebrow">DISASTER MITIGATION • KUMBH MELA</p>
            <h1>Command Center</h1>
            <p className="subtitle">
              Crowd safety, incident monitoring and emergency coordination.
            </p>
          </div>

          <div className="demo-badge">
            <span /> DEMO MODE
          </div>
        </header>

        <section className="welcome-banner">
          <div>
            <p className="banner-label">PUBLIC SAFETY INTELLIGENCE</p>
            <h2>See risks sooner. Respond smarter.</h2>
            <p>
              Monitor crowd conditions and coordinate responses across
              gathering zones.
            </p>
          </div>
          <div className="banner-symbol">⌁</div>
        </section>

        <section className="metrics-grid">
          <Metric
            label="MONITORED ZONES"
            value={zones.length}
            detail="Sample gathering areas"
            symbol="◉"
          />
          <Metric
            label="AVERAGE CROWD LEVEL"
            value={`${averageCrowd}%`}
            detail="Across monitored zones"
            symbol="▥"
          />
          <Metric
            label="HIGH-RISK ZONES"
            value={highRisk}
            detail="Requires attention"
            symbol="⚠"
          />
          <Metric
            label="ACTIVE INCIDENTS"
            value={incidents.filter((i) => i.status !== "Resolved").length}
            detail="Unresolved demo reports"
            symbol="⚑"
          />
        </section>

        <CrowdMap zones={zones}/>
        <section className="metrics-grid analytics-grid">
          <Metric
            label="TOTAL INCIDENTS"
            value={totalIncidents}
            detail="All reported incidents"
            symbol="▤"
          />
          <Metric
            label="HIGH-PRIORITY OPEN"
            value={unresolvedHighPriority}
            detail="Unresolved high-severity reports"
            symbol="⚠"
          />
          <Metric
            label="RESOLUTION RATE"
            value={`${resolutionRate}%`}
            detail="Incidents marked resolved"
            symbol="✓"
          />
          <Metric
            label="AVERAGE PRIORITY"
            value={`${averagePriorityScore}/100`}
            detail="Average illustrative score"
            symbol="◈"
          />
        </section>


        <section className="content-grid">
          <div className="panel" id="zones">
            <div className="panel-heading">
              <div>
                <h3>Crowd monitoring</h3>
                <p>Illustrative occupancy levels by zone</p>
              </div>
              <button className="secondary-button" onClick={simulateCrowdChange}>
                ↻ Simulate update
              </button>
            </div>

            <div className="zone-list">
              {zones.map((zone) => {
                const risk = getRisk(zone.crowd);

                return (
                  <div className="zone-row" key={zone.id}>
                    <div className="zone-icon">⌖</div>
                    <div className="zone-details">
                      <div className="zone-title">
                        <strong>{zone.name}</strong>
                        <span className={`risk-pill ${risk.toLowerCase()}`}>
                          {risk} risk
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${risk.toLowerCase()}`}
                          style={{ width: `${zone.crowd}%` }}
                        />
                      </div>
                      <p>{zone.people.toLocaleString()} illustrative people</p>
                    </div>
                    <strong className="crowd-value">{zone.crowd}%</strong>
                  </div>
                );
              })}
            </div>

            <p className="data-note">
              Risk categories are illustrative thresholds, not validated
              emergency predictions. Occupancy figures are simulated.
            </p>
          </div>
          <div className="panel" id="crowd-alerts">
  <div className="panel-heading">
    <div>
      <h3>Crowd Risk Alerts</h3>
      <p>Zones requiring attention</p>
    </div>
    <span className="count-badge">{crowdAlerts.length}</span>
  </div>

  {crowdAlerts.length === 0 ? (
    <p className="data-note">
      No high-risk crowd zones detected.
    </p>
  ) : (
    <div className="incident-list">
      {crowdAlerts.map((alert) => (
        <div className="incident-row incident-active" key={alert.id}>
          <div className="incident-marker high">!</div>
          <div className="incident-info">
            <strong>{alert.name}</strong>
            <p>{alert.message}</p>
            <div className="incident-tags">
              <span>High risk</span>
              <span>{alert.crowd}% crowd level</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
  <p className="data-note">
    Alerts use simulated crowd percentages and illustrative thresholds.
    They are not validated emergency predictions.
  </p>
  </div>
<div className="panel" id="emergency-alerts">
  <div className="panel-heading">
    <div>
      <h3>Emergency Alerts</h3>
      <p>High-severity incidents requiring attention</p>
    </div>
    <span className="count-badge">{emergencyAlerts.length}</span>
  </div>

  {emergencyAlerts.length === 0 ? (
    <p className="data-note">
      No active high-severity emergencies reported.
    </p>
  ) : (
    <div className="incident-list">
      {emergencyAlerts.map((incident) => (
        <div className="incident-row incident-active" key={incident.id}>
          <div className="incident-marker high">!</div>

          <div className="incident-info">
            <strong>{incident.type}</strong>
            <p>{incident.location}</p>
            <p>{incident.description}</p>

            <div className="incident-tags">
              <span>Priority: {incident.priorityScore ?? "N/A"}/100</span>
              <span>{incident.status}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  <p className="data-note">
    Alerts are based on incidents reported in this prototype,
    not verified emergency-service notifications.
  </p>
</div>
          <div className="panel" id="incidents">
            <div className="panel-heading">
              <div>
                <h3>Incident response</h3>
                <p>Latest reported incidents</p>
                </div>
                <div className="incident-heading-actions">
                  <span className="count-badge">{incidents.length}</span>
                  <button
                  className="secondary-button"
                  type="button"
                  onClick={downloadIncidentReport}
                  disabled={incidents.length === 0}
                  >
                    ↓ Export CSV
                    </button>
                    </div>
                    </div>
  
            <div className="incident-filters">
              {["All", "Open", "Responding", "Resolved"].map((filter) => (
                <button
                key={filter}
                type="button"
                className={`incident-filter ${
                  incidentFilter === filter ? "active" : ""
                }`}
                onClick={() => setIncidentFilter(filter)}
                >
                  {filter}
                  </button>
                ))}
                </div>
            <div className="incident-summary">
              <div className="incident-summary-card">
                <span>Open</span>
                <strong>{openCount}</strong>
                </div>
                <div className="incident-summary-card">
                  <span>Responding</span>
                  <strong>{respondingCount}</strong>
                  </div>
                  <div className="incident-summary-card">
                    <span>Resolved</span>
                    <strong>{resolvedCount}</strong>
                    </div>
            </div>

            <div className="incident-list">
              {[...incidents]
              .filter(
                (incident) =>
                  incidentFilter === "All" ||
                incident.status === incidentFilter
              )
              .sort((a, b) => {
                const priority = { High: 3, Medium: 2, Low: 1 };
                return priority[b.severity] - priority[a.severity];
              })
              .slice(0, 5)
              .map((incident) => (
                  <div
                    className={`incident-row ${
                      incident.status !== "Resolved" ? "incident-active" : ""
                    }`}
                    key={incident.id}
                  >
                    <div
                      className={`incident-marker ${incident.severity.toLowerCase()}`}
                    >
                      !
                    </div>
                    <div className="incident-info">
                      <strong>{incident.type}</strong>
                      <p>{incident.location}</p>
                      {incident.description && (
                        <p className="incident-description">
                          {incident.description}
                        </p>
                      )}
                      <div className="incident-tags">
                        <span>{incident.severity} priority</span>
                        <span>Score: {incident.priorityScore ?? "N/A"}/100</span>
                        <span>{incident.status}</span>
                        </div>
                       <div className="response-plan">
                        <h4>Response Recommendation</h4>
                        <p>
                          <strong>Recommended team:</strong>{" "}
                          {getResponsePlan(incident).team}
                          </p>
                          <strong>Suggested actions</strong>
                          <ul>
                            {getResponsePlan(incident).actions.map((action, index) => (
                              <li key={index}>{action}</li>
                              ))}
                              </ul>
                              <p className="response-note">
                                Prototype-generated guidance. Verify reports and follow
                                established emergency procedures.
                                </p>
                                </div> 
                                <button
                        className="text-button"
                        onClick={() => updateStatus(incident.id)}
                        title={
                          incident.status === "Resolved"
                            ? "This incident has been resolved"
                            : "Advance incident status"
                        }
                        disabled={incident.status === "Resolved"}
                      >
                        {incident.status === "Resolved" ? "Resolved" : "Update"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        <section className="panel report-panel" id="report">
          <div className="panel-heading">
            <div>
              <h3>Report an emergency</h3>
              <p>Create a demonstration incident for the response team.</p>
            </div>
            <span className="report-symbol">＋</span>
          </div>

          <form onSubmit={reportIncident}>
            <label>
              Incident type
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>Medical assistance</option>
                <option>Crowd congestion</option>
                <option>Missing person</option>
                <option>Fire hazard</option>
                <option>Blocked exit</option>
                <option>Other emergency</option>
              </select>
            </label>

            <label>
              Location / zone
              <select
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              >
                {zones.map((zone) => (
                  <option key={zone.id}>{zone.name}</option>
                ))}
              </select>
            </label>

            <label>
              Priority
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>

            <label className="description-field">
              Description
              <input
                type="text"
                placeholder="Describe the situation (required)"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>

            <button className="primary-button" type="submit">
              Submit incident →
            </button>
          </form>

          <p className="data-note">
            This prototype does not contact real emergency services. For a
            real emergency, contact the appropriate local authorities directly.
          </p>
        </section>

        <footer>
          <span>KumbhShield AI · Student prototype</span>
          <span>Simulated data · Not for operational emergency use</span>
        </footer>
      </main>
    </div>
  );
}

function Metric({ label, value, detail, symbol }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-symbol">{symbol}</span>
      </div>
      <h2>{value}</h2>
      <p>{detail}</p>
    </div>
  );
}

export default App;
