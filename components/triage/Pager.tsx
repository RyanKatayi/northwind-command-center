"use client";

import type { CSSProperties } from "react";

function pagerNum(active: boolean): CSSProperties {
  return {
    minWidth: 34,
    height: 34,
    padding: "0 6px",
    borderRadius: 9,
    border: active ? "none" : "1px solid #E6E6E9",
    background: active ? "#18181B" : "#FFFFFF",
    color: active ? "#FAFAFA" : "#52525B",
    cursor: "pointer",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function pagerArrow(disabled: boolean): CSSProperties {
  return {
    width: 34,
    height: 34,
    borderRadius: 9,
    border: "1px solid #E6E6E9",
    background: "#FFFFFF",
    color: disabled ? "#D4D4D8" : "#52525B",
    cursor: disabled ? "default" : "pointer",
    fontSize: 16,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

interface PagerProps {
  total: number;
  page: number;
  pages: number;
  start: number;
  size: number;
  onGo: (p: number) => void;
}

export function Pager({ total, page, pages, start, size, onGo }: PagerProps) {
  if (pages <= 1) return null;
  const from = total ? start + 1 : 0;
  const to = Math.min(start + size, total);
  const nums = Array.from({ length: pages }, (_, i) => i);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
      <span className="nw-mono" style={{ fontSize: 11, color: "#A1A1AA" }}>
        {from}-{to} of {total}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <button onClick={() => onGo(Math.max(0, page - 1))} style={pagerArrow(page === 0)}>
          ‹
        </button>
        {nums.map((i) => (
          <button key={i} onClick={() => onGo(i)} style={pagerNum(i === page)}>
            {i + 1}
          </button>
        ))}
        <button onClick={() => onGo(Math.min(pages - 1, page + 1))} style={pagerArrow(page === pages - 1)}>
          ›
        </button>
      </div>
    </div>
  );
}
