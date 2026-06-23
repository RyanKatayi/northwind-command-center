import type { CSSProperties } from "react";

const ACCENT = "#1A7F5A";

// Shared "Mark contacted" / "✓ Contacted" button styling (rows + drawer).
export function contactBtnStyle(contacted: boolean): CSSProperties {
  return contacted
    ? {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        justifyContent: "center",
        border: "1px solid #D4D4D8",
        background: "#F1F1F3",
        color: "#71717A",
        borderRadius: 8,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }
    : {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        justifyContent: "center",
        border: "1px solid " + ACCENT,
        background: ACCENT,
        color: "#FFFFFF",
        borderRadius: 8,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      };
}
