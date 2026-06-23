"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { TIERS } from "@/lib/triage";
import { cap, cleanText, fmtNum, relDate } from "@/lib/format";
import { contactBtnStyle } from "./contactButton";
import type { ScopedInquiry } from "./types";

interface TriageRowProps {
  item: ScopedInquiry;
  contacted: boolean;
  assignee: string;
  onOpen: () => void;
  onToggle: () => void;
}

export function TriageRow({ item, contacted, assignee, onOpen, onToggle }: TriageRowProps) {
  const { inq, sc } = item;
  const tcfg = TIERS[sc.tier];
  const assigneeShort = assignee.split(" ")[0];

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggle();
  };

  // Only act on the row itself, not when Enter/Space is pressed on an inner
  // control (e.g. the contact button), so the drawer doesn't also open.
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open inquiry from ${inq.cafe_name}`}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      className="nw-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        rowGap: 14,
        flexWrap: "wrap",
        background: "#FFFFFF",
        borderRadius: 13,
        padding: "17px 22px",
      }}
    >
      {/* score block */}
      <div style={{ flex: "none", width: 120 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: tcfg.color, flex: "none" }} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: tcfg.color,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {tcfg.label}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 6 }}>
          <span className="nw-serif" style={{ fontSize: 22, fontWeight: 600 }}>
            {sc.total}
          </span>
          <span className="nw-mono" style={{ fontSize: 9.5, color: "#A1A1AA" }}>
            /100
          </span>
        </div>
      </div>

      {/* middle */}
      <div style={{ flex: 1, minWidth: 180, padding: "0 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {inq.cafe_name}
          </span>
          {assignee && (
            <span
              className="nw-mono"
              style={{
                fontSize: 10,
                color: "#1A7F5A",
                background: "rgba(26,127,90,0.10)",
                padding: "2px 7px",
                borderRadius: 5,
                whiteSpace: "nowrap",
              }}
            >
              {assigneeShort}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#52525B",
            marginTop: 4,
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {cleanText(inq.message)}
        </div>
      </div>

      {/* region block */}
      <div style={{ flex: "none", width: 130 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{inq.region}</div>
        <div className="nw-mono" style={{ fontSize: 10, color: "#A1A1AA", marginTop: 3 }}>
          {cap(inq.channel)} · {relDate(sc.days)}
        </div>
      </div>

      {/* volume block */}
      <div style={{ flex: "none", width: 84, textAlign: "right" }}>
        <span className="nw-serif" style={{ fontSize: 18, fontWeight: 500 }}>
          {fmtNum(inq.requested_volume_lbs_month || 0)}
        </span>
        <div className="nw-mono" style={{ fontSize: 9, color: "#A1A1AA", marginTop: 1 }}>
          LBS/MO
        </div>
      </div>

      {/* action */}
      <div style={{ flex: "none", width: 148, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleToggle} style={contactBtnStyle(contacted)}>
          {contacted ? "✓ Contacted" : "Mark contacted"}
        </button>
      </div>
    </div>
  );
}
