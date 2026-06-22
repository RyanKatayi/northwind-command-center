"use client";

const WEIGHTS: { label: string; pts: string }[] = [
  { label: "Volume", pts: "35" },
  { label: "Intent", pts: "25" },
  { label: "Channel", pts: "15" },
  { label: "Recency", pts: "15" },
  { label: "Stage", pts: "10" },
];

const TIER_KEYS: { label: string; color: string }[] = [
  { label: "Hot 68+", color: "#CF3A3A" },
  { label: "Warm 46 to 67", color: "#DD8B0B" },
  { label: "Cold under 46", color: "#8B8B92" },
];

export function ScoringLegend() {
  return (
    <div
      style={{
        marginTop: 26,
        background: "#FFFFFF",
        border: "1px solid #E6E6E9",
        borderRadius: 13,
        padding: "18px 22px",
        display: "flex",
        alignItems: "center",
        gap: 30,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          className="nw-mono"
          style={{
            fontSize: 9.5,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#A1A1AA",
            marginBottom: 10,
          }}
        >
          How priority is scored
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {WEIGHTS.map((w) => (
            <span
              key={w.label}
              className="nw-mono"
              style={{ fontSize: 11, color: "#52525B", background: "#F4F4F5", padding: "4px 10px", borderRadius: 7 }}
            >
              {w.label} <span style={{ color: "#18181B", fontWeight: 500 }}>{w.pts}</span>
            </span>
          ))}
        </div>
      </div>
      <div style={{ width: 1, alignSelf: "stretch", background: "#EDEDEF" }} />
      <div>
        <div
          className="nw-mono"
          style={{
            fontSize: 9.5,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#A1A1AA",
            marginBottom: 10,
          }}
        >
          Tiers
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {TIER_KEYS.map((t) => (
            <span
              key={t.label}
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#3F3F46" }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.color }} />
              {t.label}
            </span>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 130, textAlign: "right", fontSize: 12.5, color: "#A1A1AA" }}>
        Click any inquiry for the full breakdown.
      </div>
    </div>
  );
}
