"use client";

import type { CSSProperties } from "react";
import { TIERS } from "@/lib/triage";
import type { TierFilter } from "./types";

interface TileConfig {
  key: TierFilter;
  label: string;
  hasDot: boolean;
  color: string;
  sub: string;
}

const TILES: TileConfig[] = [
  { key: "all", label: "All open", hasDot: false, color: "#18181B", sub: "in queue" },
  { key: "hot", label: "Hot", hasDot: true, color: TIERS.hot.color, sub: "act now" },
  { key: "warm", label: "Warm", hasDot: true, color: TIERS.warm.color, sub: "nurture" },
  { key: "cold", label: "Cold", hasDot: true, color: TIERS.cold.color, sub: "low signal" },
];

interface TierTilesProps {
  tier: TierFilter;
  counts: Record<TierFilter, number>;
  onPick: (tier: TierFilter) => void;
}

export function TierTiles({ tier, counts, onPick }: TierTilesProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {TILES.map((c) => {
        const active = tier === c.key;
        const bg = active ? (c.key === "all" ? "#F6F6F7" : TIERS[c.key as Exclude<TierFilter, "all">].tint) : "#FFFFFF";
        const tileStyle: CSSProperties = {
          textAlign: "left",
          cursor: "pointer",
          fontFamily: "inherit",
          padding: "18px 20px",
          borderRadius: 14,
          background: bg,
          border: "1.5px solid " + (active ? c.color : "#E6E6E9"),
          transition: "border-color 0.15s, background 0.15s",
        };
        return (
          <button
            key={c.key}
            onClick={() => onPick(c.key)}
            aria-pressed={active}
            aria-label={`${c.label}: ${counts[c.key]} ${c.sub}`}
            style={tileStyle}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {c.hasDot && (
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }} />
              )}
              <span
                className="nw-mono"
                style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#71717A" }}
              >
                {c.label}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 11 }}>
              <span className="nw-serif" style={{ fontSize: 34, fontWeight: 500, lineHeight: 0.9 }}>
                {counts[c.key]}
              </span>
              <span style={{ fontSize: 11.5, color: "#A1A1AA" }}>{c.sub}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
