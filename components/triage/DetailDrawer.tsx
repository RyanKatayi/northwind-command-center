"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Inquiry } from "@/lib/types";
import type { ScoreResult } from "@/lib/triage";
import { TIERS, TEAM } from "@/lib/triage";
import { cap, cleanText, fmtNum, formatDate, relDate } from "@/lib/format";
import { contactBtnStyle } from "./contactButton";

interface DetailDrawerProps {
  inq: Inquiry;
  sc: ScoreResult;
  contacted: boolean;
  assignee: string;
  drafting: boolean;
  draft: string;
  onClose: () => void;
  onToggle: () => void;
  onAssign: (name: string) => void;
  onDraft: () => void;
  onDraftChange: (v: string) => void;
}

const factTile = (label: string, value: string) => (
  <div style={{ background: "#FAFAFA", border: "1px solid #EAEAEC", borderRadius: 10, padding: "13px 15px" }}>
    <div
      className="nw-mono"
      style={{ fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A1A1AA" }}
    >
      {label}
    </div>
    <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 6 }}>{value}</div>
  </div>
);

export function DetailDrawer({
  inq,
  sc,
  contacted,
  assignee,
  drafting,
  draft,
  onClose,
  onToggle,
  onAssign,
  onDraft,
  onDraftChange,
}: DetailDrawerProps) {
  const tcfg = TIERS[sc.tier];
  const closeRef = useRef<HTMLButtonElement>(null);

  // Accessible-dialog behavior: focus the close button on open, and let Escape
  // dismiss the drawer (not just the overlay click or the close button).
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tierBadgeStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "5px 11px",
    borderRadius: 7,
    background: tcfg.tint,
    color: tcfg.color,
    fontSize: 11.5,
    fontWeight: 600,
  };

  const fullContactBtn: CSSProperties = {
    ...contactBtnStyle(contacted),
    width: "100%",
    padding: "11px 14px",
    fontSize: 13,
  };

  const draftBtnLabel = drafting ? "Drafting…" : draft ? "Regenerate" : "Draft with AI";

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, background: "rgba(22,22,23,0.32)", zIndex: 40, animation: "nw-fade 0.2s ease" }}
      />
      <div
        className="nw-scroll"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-cafe-name"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 478,
          maxWidth: "92vw",
          background: "#FFFFFF",
          zIndex: 41,
          overflowY: "auto",
          boxShadow: "-26px 0 70px rgba(22,22,23,0.16)",
          animation: "nw-drawer-in 0.28s cubic-bezier(0.2,0.8,0.2,1)",
        }}
      >
        <div style={{ padding: "26px 32px 44px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <span style={tierBadgeStyle}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: tcfg.color }} />
              {tcfg.label} · Score {sc.total}
            </span>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              style={{
                border: "none",
                background: "#F1F1F3",
                width: 30,
                height: 30,
                borderRadius: 8,
                cursor: "pointer",
                color: "#71717A",
                fontSize: 16,
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          <div
            className="nw-mono"
            style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1A7F5A" }}
          >
            Inbound inquiry
          </div>
          <h2
            id="drawer-cafe-name"
            className="nw-serif"
            style={{ margin: "9px 0 0", fontSize: 27, fontWeight: 600, letterSpacing: "-0.015em" }}
          >
            {inq.cafe_name}
          </h2>
          <div style={{ fontSize: 13.5, color: "#71717A", marginTop: 7 }}>
            {inq.contact_name} · <span style={{ color: "#8B8B92" }}>{inq.email}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginTop: 24 }}>
            {factTile("Region", inq.region)}
            {factTile("Channel", cap(inq.channel))}
            {factTile("Requested volume", `${fmtNum(inq.requested_volume_lbs_month || 0)} lbs/mo`)}
            {factTile("Received", `${formatDate(inq.received_date)} · ${relDate(sc.days)}`)}
          </div>

          <div
            style={{
              marginTop: 22,
              padding: "18px 20px",
              background: "#FAFAFA",
              border: "1px solid #EAEAEC",
              borderRadius: 11,
            }}
          >
            <div
              className="nw-mono"
              style={{
                fontSize: 9.5,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#A1A1AA",
                marginBottom: 9,
              }}
            >
              Message
            </div>
            <div className="nw-serif" style={{ fontSize: 16, lineHeight: 1.55, color: "#3F3F46" }}>
              {cleanText(inq.message)}
            </div>
          </div>

          <div style={{ marginTop: 26 }}>
            <div
              className="nw-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#9A9AA2",
                marginBottom: 15,
              }}
            >
              Why this score
            </div>
            {sc.factors.map((f) => (
              <div key={f.label} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{f.label}</span>
                  <span style={{ fontSize: 12, color: "#8B8B92" }}>
                    {f.detail}{" "}
                    <span className="nw-mono" style={{ color: "#18181B", marginLeft: 5 }}>
                      {f.pts}/{f.max}
                    </span>
                  </span>
                </div>
                <div style={{ height: 6, background: "#F1F1F3", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${(f.pts / f.max) * 100}%`,
                      height: "100%",
                      background: "#1A7F5A",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid #EAEAEC" }}>
            <div
              className="nw-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#9A9AA2",
                marginBottom: 14,
              }}
            >
              Actions
            </div>
            <button onClick={onToggle} style={fullContactBtn}>
              {contacted ? "✓ Contacted · tap to undo" : "Mark contacted"}
            </button>

            <div style={{ marginTop: 14 }}>
              <label style={{ fontSize: 12.5, color: "#71717A", display: "block", marginBottom: 7 }}>
                Assign owner
              </label>
              <select
                value={assignee}
                onChange={(e) => onAssign(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 13.5,
                  fontFamily: "inherit",
                  border: "1px solid #DEDEE1",
                  borderRadius: 9,
                  background: "#FFFFFF",
                  color: "#18181B",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">Unassigned</option>
                {TEAM.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                <label style={{ fontSize: 12.5, color: "#71717A" }}>Draft a reply</label>
                <button
                  onClick={onDraft}
                  disabled={drafting}
                  style={{
                    border: "1px solid #18181B",
                    background: "#18181B",
                    color: "#FAFAFA",
                    fontFamily: "inherit",
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "7px 13px",
                    borderRadius: 8,
                    cursor: drafting ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  {drafting && (
                    <span
                      style={{
                        width: 11,
                        height: 11,
                        border: "2px solid rgba(250,250,250,0.4)",
                        borderTopColor: "#FAFAFA",
                        borderRadius: "50%",
                        animation: "nw-spin 0.8s linear infinite",
                      }}
                    />
                  )}
                  {draftBtnLabel}
                </button>
              </div>
              {draft && (
                <textarea
                  value={draft}
                  onChange={(e) => onDraftChange(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 172,
                    padding: "14px 15px",
                    fontSize: 13.5,
                    fontFamily: "'Instrument Sans', sans-serif",
                    lineHeight: 1.6,
                    border: "1px solid #DEDEE1",
                    borderRadius: 10,
                    background: "#FAFAFA",
                    color: "#3F3F46",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
