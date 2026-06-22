"use client";

import type { CSSProperties } from "react";
import type { SortKey, StatusFilter } from "./types";

const controlBase: CSSProperties = {
  padding: "9px 12px",
  fontSize: 13,
  fontFamily: "inherit",
  border: "1px solid #DEDEE1",
  borderRadius: 9,
  background: "#FFFFFF",
  color: "#18181B",
  outline: "none",
  cursor: "pointer",
};

interface ToolbarProps {
  rowCount: number;
  query: string;
  statusFilter: StatusFilter;
  sort: SortKey;
  onQuery: (v: string) => void;
  onStatus: (v: StatusFilter) => void;
  onSort: (v: SortKey) => void;
}

export function Toolbar({ rowCount, query, statusFilter, sort, onQuery, onStatus, onSort }: ToolbarProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "22px 0 14px" }}>
      <div style={{ fontSize: 13, color: "#71717A" }}>
        Showing <span style={{ color: "#18181B", fontWeight: 500 }}>{rowCount}</span> inquiries
      </div>
      <div style={{ flex: 1 }} />
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Search café, contact, region…"
        style={{
          width: 230,
          padding: "9px 13px",
          fontSize: 13,
          fontFamily: "inherit",
          border: "1px solid #DEDEE1",
          borderRadius: 9,
          background: "#FFFFFF",
          color: "#18181B",
          outline: "none",
        }}
      />
      <select value={statusFilter} onChange={(e) => onStatus(e.target.value as StatusFilter)} style={controlBase}>
        <option value="open">Open queue</option>
        <option value="new">New</option>
        <option value="qualified">Qualified</option>
        <option value="contacted">Contacted</option>
        <option value="closed">Closed</option>
        <option value="all">All</option>
      </select>
      <select value={sort} onChange={(e) => onSort(e.target.value as SortKey)} style={controlBase}>
        <option value="priority">Sort: Priority</option>
        <option value="newest">Sort: Newest</option>
        <option value="volume">Sort: Volume</option>
      </select>
    </div>
  );
}
