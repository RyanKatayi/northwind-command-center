"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { inquiries } from "@/lib/data";
import { useOverrides } from "@/lib/useOverrides";
import { contactedFlag, effectiveStatus } from "@/lib/triage";

const DARK_ACCENT = "#4FD9A0";

const ICONS = {
  overview: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1.6" />
      <rect x="9" y="1" width="6" height="6" rx="1.6" />
      <rect x="1" y="9" width="6" height="6" rx="1.6" />
      <rect x="9" y="9" width="6" height="6" rx="1.6" />
    </svg>
  ),
  triage: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="2.2" cy="3.4" r="1.6" />
      <rect x="6" y="2.4" width="9" height="2" rx="1" />
      <circle cx="2.2" cy="8" r="1.6" />
      <rect x="6" y="7" width="9" height="2" rx="1" />
      <circle cx="2.2" cy="12.6" r="1.6" />
      <rect x="6" y="11.6" width="9" height="2" rx="1" />
    </svg>
  ),
  accounts: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="8" width="3.2" height="7" rx="1" />
      <rect x="6.4" y="4" width="3.2" height="11" rx="1" />
      <rect x="11.8" y="1" width="3.2" height="14" rx="1" />
    </svg>
  ),
};

const NAV = [
  { key: "overview", href: "/", label: "Overview" },
  { key: "triage", href: "/inquiries", label: "Triage" },
  { key: "accounts", href: "/accounts", label: "Accounts" },
] as const;

function navStyle(active: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: "10px 12px",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13.5,
    fontWeight: active ? 600 : 500,
    background: active ? "rgba(255,255,255,0.08)" : "transparent",
    color: active ? "#FAFAFA" : "#A1A1AA",
    transition: "background 0.15s, color 0.15s",
    textDecoration: "none",
  };
}

export function Sidebar() {
  const pathname = usePathname();
  const { overrides, hydrated } = useOverrides();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  // Open inquiries awaiting first contact.
  const attn = hydrated
    ? inquiries.filter((i) => {
        const ov = overrides[i.id];
        return effectiveStatus(i, ov) !== "closed" && !contactedFlag(i, ov);
      }).length
    : 0;

  return (
    <aside
      style={{
        width: 250,
        flex: "none",
        background: "#161617",
        display: "flex",
        flexDirection: "column",
        padding: "26px 20px 22px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "2px 4px 26px" }}>
        <div
          className="nw-serif"
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "linear-gradient(150deg,#1F9D6E,#13724F)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 19,
          }}
        >
          N
        </div>
        <div style={{ lineHeight: 1.1 }}>
          <div
            className="nw-serif"
            style={{ fontWeight: 600, fontSize: 17, color: "#FAFAFA", letterSpacing: "-0.01em" }}
          >
            Northwind
          </div>
          <div
            className="nw-mono"
            style={{
              fontSize: 9,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#6E6E76",
              marginTop: 3,
              whiteSpace: "nowrap",
            }}
          >
            Operations OS
          </div>
        </div>
      </div>

      <div
        className="nw-mono"
        style={{
          fontSize: 9.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#5B5B63",
          padding: "0 8px 11px",
        }}
      >
        Workspace
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              style={navStyle(active)}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: active ? DARK_ACCENT : "#6E6E76",
                  flex: "none",
                }}
              >
                {ICONS[item.key]}
              </span>
              <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
              {item.key === "triage" && attn > 0 && (
                <span
                  className="nw-mono"
                  aria-label={`${attn} awaiting first contact`}
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#FFB4B4",
                    background: "rgba(207,58,58,0.22)",
                    padding: "1px 7px",
                    borderRadius: 6,
                  }}
                >
                  {attn}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 4px 0" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1F9D6E", flex: "none" }} />
          <span
            className="nw-mono"
            style={{
              fontSize: 9.5,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#6E6E76",
            }}
          >
            Wholesale workspace
          </span>
        </div>
      </div>
    </aside>
  );
}
