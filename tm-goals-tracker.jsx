import { useState, useEffect, useCallback } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STORAGE_KEY = "tm-goals-2026-v2";

const GOALS = [70, 60, 60, 55, 110, null, null, null, null, null, null, null];
const ACTUALS = [54, 53, 66, 68, null, null, null, null, null, null, null, null];

const defaultData = () => MONTHS.map((m, i) => ({
  month: m,
  goal: GOALS[i],
  actual: ACTUALS[i],
}));

const C = {
  pink:       "#F72585",
  blue:       "#4361EE",
  purple:     "#A2158D",
  teal:       "#4D0A99",
  cyan:       "#4CC9F0",
  salmon:     "#FFA5A3",
  pinkLight:  "#F877B1",
  pinkMid:    "#BA5683",
  blueDark:   "#0B2183",
  blueMid:    "#4361EE",
  blueLight:  "#2E3B73",
  purpleLight:"#D27BF4",
  purpleMid:  "#A616DF",
  magenta:    "#CF1BB4",
  bg:         "#FFFFFF",
  cardBg:     "#F8F7FC",
  border:     "#E8E4F0",
  borderLight:"#D8D2E8",
  textMuted:  "#8A80A4",
  textDim:    "#C0B8D4",
  text:       "#2D2545",
  white:      "#1A1230",
};

export default function TMGoalsTracker() {
  const [data, setData] = useState(defaultData());
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result?.value) setData(JSON.parse(result.value));
      } catch (e) { console.log("No saved data"); }
      setLoaded(true);
    })();
  }, []);

  const saveData = useCallback(async (newData) => {
    setData(newData);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(newData)); }
    catch (e) { console.error("Save failed:", e); }
  }, []);

  const startEdit = (index, field) => {
    setEditing({ index, field });
    setEditValue(data[index][field] ?? "");
  };

  const commitEdit = () => {
    if (!editing) return;
    const { index, field } = editing;
    const val = editValue.trim() === "" ? null : parseInt(editValue, 10);
    if (editValue.trim() !== "" && isNaN(val)) { setEditing(null); return; }
    const updated = data.map((row, i) => i === index ? { ...row, [field]: val } : row);
    saveData(updated);
    setEditing(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(null);
  };

  const totalGoal = data.reduce((s, r) => s + (r.goal || 0), 0);
  const totalActual = data.reduce((s, r) => s + (r.actual || 0), 0);
  const monthsWithGoals = data.filter(r => r.goal !== null).length;
  const monthsHit = data.filter(r => r.goal && r.actual && r.actual >= r.goal).length;
  const maxVal = Math.max(...data.map(r => Math.max(r.goal || 0, r.actual || 0)), 10);

  if (!loaded) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: "'Roobert', 'DM Sans', sans-serif",
      padding: "32px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <link href="https://api.fontshare.com/v2/css?f[]=sentient@2,1,501,500,701,700,201,200,301,300&display=swap" rel="stylesheet" />
      <link href="https://db.onlinewebfonts.com/c/6228016f2b172c06410f3a2356d33f6c?family=Roobert-Regular" rel="stylesheet" />
      <link href="https://db.onlinewebfonts.com/c/fdd7abd88b9d820ffbf7108209dba1ce?family=Roobert+Medium" rel="stylesheet" />
      <link href="https://db.onlinewebfonts.com/c/d6ae884b0a2f1a5346717fc160db2d28?family=Roobert" rel="stylesheet" />

      <div style={{
        position: "fixed", top: -200, right: -200, width: 500, height: 500,
        background: `radial-gradient(circle, ${C.purple}0A 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: -200, left: -100, width: 400, height: 400,
        background: `radial-gradient(circle, ${C.blue}08 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto 36px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <h1 style={{
            fontFamily: "'Sentient', Georgia, serif",
            fontSize: 36, fontWeight: 700, margin: 0,
            fontStyle: "italic",
            letterSpacing: "-0.5px",
            background: `linear-gradient(135deg, ${C.pink}, ${C.cyan})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            TM Goals
          </h1>
          <span style={{
            fontFamily: "'Sentient', Georgia, serif",
            fontSize: 16, color: C.blueMid, fontWeight: 400,
            fontStyle: "italic",
          }}>2026</span>
        </div>
        <p style={{
          fontSize: 13, color: C.textMuted,
          margin: "4px 0 0", letterSpacing: "0.5px",
        }}>
          Units / Transactions — click any cell to edit
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{
        maxWidth: 900, margin: "0 auto 32px",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
      }}>
        {[
          { label: "Total Goal", value: totalGoal, color: C.cyan, glow: C.cyan },
          { label: "Total Actual", value: totalActual, color: C.pinkLight, glow: C.pink },
          { label: "Months Set", value: `${monthsWithGoals}/12`, color: C.purpleLight, glow: C.purpleMid },
          { label: "Goals Hit", value: `${monthsHit}/${monthsWithGoals || 0}`, color: C.blue, glow: C.blue },
        ].map((card, i) => (
          <div key={i} style={{
            background: `linear-gradient(135deg, ${C.cardBg} 0%, ${C.bg} 100%)`,
            border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "18px 14px",
            textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -20, right: -20, width: 60, height: 60,
              background: `radial-gradient(circle, ${card.glow}18 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />
            <div style={{
              fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif",
              fontSize: 26, fontWeight: 700,
              color: card.color, lineHeight: 1.2,
            }}>{card.value}</div>
            <div style={{
              fontSize: 10, color: C.textMuted,
              marginTop: 6, textTransform: "uppercase", letterSpacing: "1.2px",
            }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{
        maxWidth: 900, margin: "0 auto 32px",
        background: `linear-gradient(135deg, ${C.cardBg} 0%, ${C.bg} 100%)`,
        border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "24px 20px 16px",
      }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 16, justifyContent: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textMuted }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: `linear-gradient(135deg, ${C.blue}, ${C.cyan})` }} />
            Goal
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textMuted }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: `linear-gradient(135deg, ${C.pink}, ${C.pinkLight})` }} />
            Actual
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 180 }}>
          {data.map((row, i) => {
            const goalH = row.goal ? (row.goal / maxVal) * 150 : 0;
            const actualH = row.actual ? (row.actual / maxVal) * 150 : 0;
            const isHovered = hoveredBar === i;
            return (
              <div key={i} style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", position: "relative",
              }}
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {isHovered && (row.goal || row.actual) && (
                  <div style={{
                    position: "absolute",
                    bottom: Math.max(goalH, actualH) + 30,
                    background: C.cardBg,
                    border: `1px solid ${C.borderLight}`,
                    borderRadius: 6, padding: "6px 10px",
                    fontSize: 11, whiteSpace: "nowrap", zIndex: 10,
                    color: C.text, fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif",
                  }}>
                    {row.goal !== null && <div>Goal: <span style={{ color: C.cyan }}>{row.goal}</span></div>}
                    {row.actual !== null && <div>Actual: <span style={{ color: row.actual >= (row.goal || 0) ? C.cyan : C.pink }}>{row.actual}</span></div>}
                  </div>
                )}
                <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 150 }}>
                  <div style={{
                    width: 14, height: goalH || 2,
                    background: goalH ? `linear-gradient(180deg, ${C.cyan}, ${C.blue})` : C.border,
                    borderRadius: "3px 3px 0 0",
                    transition: "height 0.4s ease, opacity 0.2s",
                    opacity: isHovered ? 1 : 0.8,
                  }} />
                  <div style={{
                    width: 14, height: actualH || 2,
                    background: actualH
                      ? row.actual >= (row.goal || 0)
                        ? `linear-gradient(180deg, ${C.purpleLight}, ${C.purpleMid})`
                        : `linear-gradient(180deg, ${C.pink}, ${C.purple})`
                      : C.border,
                    borderRadius: "3px 3px 0 0",
                    transition: "height 0.4s ease, opacity 0.2s",
                    opacity: isHovered ? 1 : 0.8,
                  }} />
                </div>
                <div style={{
                  fontSize: 10, marginTop: 6,
                  fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif",
                  fontWeight: isHovered ? 700 : 400,
                  color: isHovered ? C.blueMid : C.textDim,
                  transition: "color 0.2s",
                }}>{row.month}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{
        maxWidth: 900, margin: "0 auto",
        background: `linear-gradient(135deg, ${C.cardBg} 0%, ${C.bg} 100%)`,
        border: `1px solid ${C.border}`,
        borderRadius: 12, overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Month", "Goal", "Actual", "Diff", "Status"].map(h => (
                <th key={h} style={{
                  padding: "14px 16px",
                  textAlign: h === "Month" ? "left" : "center",
                  fontSize: 10, fontWeight: 700, color: C.textDim,
                  textTransform: "uppercase", letterSpacing: "1.5px",
                  fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const diff = (row.goal !== null && row.actual !== null) ? row.actual - row.goal : null;
              const hit = diff !== null && diff >= 0;
              return (
                <tr key={i} style={{
                  borderBottom: `1px solid ${C.border}08`,
                  transition: "background 0.15s", cursor: "default",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = `${C.border}40`}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{
                    padding: "12px 16px", fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif",
                    fontWeight: 500, fontSize: 13, color: C.blueMid,
                  }}>{row.month}</td>

                  {["goal", "actual"].map(field => (
                    <td key={field} style={{ padding: "8px 16px", textAlign: "center" }}>
                      {editing?.index === i && editing?.field === field ? (
                        <input
                          autoFocus type="number" value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={commitEdit} onKeyDown={handleKeyDown}
                          style={{
                            width: 60, background: C.bg,
                            border: `1px solid ${C.blue}`,
                            borderRadius: 4, color: C.white,
                            padding: "4px 8px", textAlign: "center",
                            fontSize: 13, fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif",
                            outline: "none",
                          }}
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(i, field)}
                          style={{
                            display: "inline-block", minWidth: 40,
                            padding: "4px 10px", borderRadius: 4, cursor: "pointer",
                            fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif",
                            fontSize: 13, fontWeight: 500,
                            color: row[field] !== null
                              ? (field === "goal" ? C.cyan : C.pinkLight)
                              : C.textDim,
                            background: row[field] !== null ? "transparent" : C.bg,
                            border: "1px solid transparent",
                            transition: "border-color 0.15s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = C.borderLight}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
                        >
                          {row[field] !== null ? row[field] : "—"}
                        </span>
                      )}
                    </td>
                  ))}

                  <td style={{
                    padding: "12px 16px", textAlign: "center",
                    fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif",
                    fontSize: 13, fontWeight: 500,
                    color: diff === null ? C.textDim : hit ? C.cyan : C.pink,
                  }}>
                    {diff === null ? "—" : `${diff >= 0 ? "+" : ""}${diff}`}
                  </td>

                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {diff === null ? (
                      <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif" }}>—</span>
                    ) : (
                      <span style={{
                        display: "inline-block", padding: "3px 10px",
                        borderRadius: 20, fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.5px", fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif",
                        background: hit ? `${C.cyan}15` : `${C.pink}15`,
                        color: hit ? C.cyan : C.pink,
                        border: `1px solid ${hit ? `${C.cyan}30` : `${C.pink}30`}`,
                      }}>
                        {hit ? "HIT ✓" : "MISS"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${C.border}` }}>
              <td style={{
                padding: "14px 16px", fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif",
                fontWeight: 700, fontSize: 12, color: C.blueMid,
                textTransform: "uppercase", letterSpacing: "1px",
              }}>Total</td>
              <td style={{
                padding: "14px 16px", textAlign: "center",
                fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif",
                fontWeight: 700, fontSize: 14, color: C.cyan,
              }}>{totalGoal}</td>
              <td style={{
                padding: "14px 16px", textAlign: "center",
                fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif",
                fontWeight: 700, fontSize: 14, color: C.pinkLight,
              }}>{totalActual || "—"}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Reset */}
      <div style={{ maxWidth: 900, margin: "24px auto 0", textAlign: "right" }}>
        <button
          onClick={async () => {
            if (confirm("Reset all data to defaults?")) {
              const fresh = defaultData();
              await saveData(fresh);
            }
          }}
          style={{
            background: "none", border: `1px solid ${C.border}`,
            color: C.textDim, padding: "6px 14px", borderRadius: 6,
            fontSize: 11, fontFamily: "'Roobert', 'Roobert-Regular', 'Roobert Medium', sans-serif",
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.pink; e.currentTarget.style.color = C.pink; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}
        >
          Reset All
        </button>
      </div>
    </div>
  );
}
