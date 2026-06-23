"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { accounts } from "@/lib/data";
import { fmtNum, cap, NORTHWIND_NOW, parseDate } from "@/lib/format";

const ACCENT = "#1A7F5A";

// months between customer_since and NORTHWIND_NOW -> "{y}y {m}mo · since {Mon 'YY}"
function tenure(since: string): string {
  const now = parseDate(NORTHWIND_NOW);
  const d = parseDate(since);
  let mo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (mo < 0) mo = 0;
  const y = Math.floor(mo / 12);
  const m = mo % 12;
  const t = y && m ? `${y}y ${m}mo` : y ? `${y}y` : `${m}mo`;
  return t + " · since " + d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function pagerNum(active: boolean): CSSProperties {
  return {
    minWidth: "34px",
    height: "34px",
    padding: "0 6px",
    borderRadius: "9px",
    border: active ? "none" : "1px solid #E6E6E9",
    background: active ? "#18181B" : "#FFFFFF",
    color: active ? "#FAFAFA" : "#52525B",
    cursor: "pointer",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function pagerArrow(disabled: boolean): CSSProperties {
  return {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    border: "1px solid #E6E6E9",
    background: "#FFFFFF",
    color: disabled ? "#D4D4D8" : "#52525B",
    cursor: disabled ? "default" : "pointer",
    fontSize: "16px",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

interface Pager {
  show: boolean;
  rangeLabel: string;
  pages: { n: number; onClick: () => void; style: CSSProperties }[];
  onPrev: () => void;
  onNext: () => void;
  prevStyle: CSSProperties;
  nextStyle: CSSProperties;
}

function buildPager(
  total: number,
  page: number,
  pages: number,
  start: number,
  size: number,
  go: (i: number) => void,
): Pager {
  const from = total ? start + 1 : 0;
  const to = Math.min(start + size, total);
  const nums = [];
  for (let i = 0; i < pages; i++) {
    nums.push({ n: i + 1, onClick: () => go(i), style: pagerNum(i === page) });
  }
  return {
    show: pages > 1,
    rangeLabel: from + "-" + to + " of " + total,
    pages: nums,
    onPrev: () => go(Math.max(0, page - 1)),
    onNext: () => go(Math.min(pages - 1, page + 1)),
    prevStyle: pagerArrow(page === 0),
    nextStyle: pagerArrow(page === pages - 1),
  };
}

type AccStatus = "all" | "active" | "paused";

export function AccountsClient() {
  const [accStatus, setAccStatus] = useState<AccStatus>("all");
  const [accPage, setAccPage] = useState(0);

  const activeAcc = accounts.filter((a) => a.status === "active");
  const pausedAcc = accounts.filter((a) => a.status === "paused");
  const contracted = activeAcc.reduce((s, a) => s + (a.monthly_volume_lbs || 0), 0);
  const avgVol = accounts.length
    ? Math.round(accounts.reduce((s, a) => s + (a.monthly_volume_lbs || 0), 0) / accounts.length)
    : 0;

  // ----- header -----
  const headerSub = `${activeAcc.length} active accounts · ${fmtNum(contracted)} lbs/mo contracted`;
  const headerStat = `${activeAcc.length} active · ${pausedAcc.length} paused`;

  // ----- ledger band -----
  const ledgerCell = (last: boolean): CSSProperties => ({
    flex: 1,
    padding: "16px 24px",
    borderRight: last ? "none" : "1px solid #F1F1F3",
  });
  const accountLedger = [
    {
      label: "Active accounts",
      value: String(activeAcc.length),
      sub: "of " + accounts.length + " total",
      color: "#18181B",
      cellStyle: ledgerCell(false),
    },
    {
      label: "Contracted volume",
      value: fmtNum(contracted),
      sub: "lbs / month",
      color: ACCENT,
      cellStyle: ledgerCell(false),
    },
    {
      label: "Paused",
      value: String(pausedAcc.length),
      sub: pausedAcc.length ? "needs review" : "all healthy",
      color: pausedAcc.length ? "#DD8B0B" : "#18181B",
      cellStyle: ledgerCell(false),
    },
    {
      label: "Avg. account size",
      value: fmtNum(avgVol),
      sub: "lbs / month",
      color: "#18181B",
      cellStyle: ledgerCell(true),
    },
  ];

  // ----- region rollup -----
  const accByRegion: Record<string, number> = {};
  activeAcc.forEach((a) => {
    accByRegion[a.region] = (accByRegion[a.region] || 0) + (a.monthly_volume_lbs || 0);
  });
  const accRegArr = Object.keys(accByRegion)
    .map((k) => ({ name: k, v: accByRegion[k] }))
    .sort((a, b) => b.v - a.v);
  const accRegMax = accRegArr[0] ? accRegArr[0].v : 1;
  const accountRegions = accRegArr.map((r) => ({
    name: r.name,
    revLabel: fmtNum(r.v),
    barStyle: {
      width: (r.v / accRegMax) * 100 + "%",
      height: "100%",
      background: ACCENT,
      borderRadius: "4px",
    } as CSSProperties,
  }));

  // ----- chips -----
  const af = accStatus;
  const accChips = (
    [
      { key: "all" as const, label: "All", count: accounts.length },
      { key: "active" as const, label: "Active", count: activeAcc.length },
      { key: "paused" as const, label: "Paused", count: pausedAcc.length },
    ]
  ).map((c) => {
    const on = af === c.key;
    return {
      key: c.key,
      label: c.label,
      count: c.count,
      onClick: () => {
        setAccStatus(c.key);
        setAccPage(0);
      },
      style: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "8px 14px",
        borderRadius: "8px",
        border: "1px solid " + (on ? "#18181B" : "#DEDEE1"),
        background: on ? "#18181B" : "#FFFFFF",
        color: on ? "#FAFAFA" : "#3F3F46",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: "13px",
        fontWeight: 500,
      } as CSSProperties,
      countStyle: {
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "11px",
        color: on ? "rgba(250,250,250,0.6)" : "#A1A1AA",
      } as CSSProperties,
    };
  });

  // ----- directory -----
  let accList = accounts.slice();
  if (af !== "all") accList = accList.filter((a) => a.status === af);
  accList.sort((a, b) => (b.monthly_volume_lbs || 0) - (a.monthly_volume_lbs || 0));
  const APS = 9;
  const aPages = Math.max(1, Math.ceil(accList.length / APS));
  const aPage = Math.min(accPage, aPages - 1);
  const aStart = aPage * APS;
  const accountsEmpty = accList.length === 0;
  const accPager = buildPager(accList.length, aPage, aPages, aStart, APS, setAccPage);

  const accVolMax = Math.max.apply(
    null,
    accounts.map((a) => a.monthly_volume_lbs || 0).concat([1]),
  );
  const accountCards = accList.slice(aStart, aStart + APS).map((a) => {
    const isActive = a.status === "active";
    return {
      id: a.id,
      name: a.name,
      idLabel: a.id.toUpperCase(),
      region: a.region,
      statusLabel: cap(a.status),
      statusStyle: {
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "10px",
        fontWeight: 500,
        padding: "3px 8px",
        borderRadius: "6px",
        whiteSpace: "nowrap",
        flex: "none",
        color: isActive ? "#1A7F5A" : "#DD8B0B",
        background: isActive ? "rgba(26,127,90,0.10)" : "rgba(221,139,11,0.12)",
      } as CSSProperties,
      volNum: fmtNum(a.monthly_volume_lbs || 0),
      tenure: tenure(a.customer_since),
      barStyle: {
        width: ((a.monthly_volume_lbs || 0) / accVolMax) * 100 + "%",
        height: "100%",
        background: isActive ? ACCENT : "#D4D4D8",
        borderRadius: "3px",
      } as CSSProperties,
    };
  });

  return (
    <>
      {/* HEADER */}
      <header
        style={{
          flex: "none",
          padding: "24px 36px 20px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div>
          <div
            className="nw-mono"
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#1A7F5A",
              marginBottom: "9px",
            }}
          >
            Book of business
          </div>
          <h1
            className="nw-serif"
            style={{
              margin: 0,
              fontSize: "31px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Wholesale accounts
          </h1>
          <div style={{ fontSize: "13.5px", color: "#71717A", marginTop: "7px" }}>{headerSub}</div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 14px",
            background: "#FFFFFF",
            border: "1px solid #E4E4E7",
            borderRadius: "9px",
          }}
        >
          <span
            style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#1A7F5A" }}
          ></span>
          <span
            className="nw-mono"
            style={{ fontSize: "11px", color: "#52525B", letterSpacing: "0.03em" }}
          >
            {headerStat}
          </span>
        </div>
      </header>

      {/* SCROLL */}
      <div
        className="nw-scroll"
        style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 36px 56px" }}
      >
        <div style={{ animation: "nw-fade 0.35s ease" }}>
          {/* ledger band */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E4E4E7",
              borderRadius: "14px",
              padding: "6px 0",
              display: "flex",
              alignItems: "stretch",
            }}
          >
            {accountLedger.map((l) => (
              <div key={l.label} style={l.cellStyle}>
                <div
                  className="nw-mono"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#9A9AA2",
                  }}
                >
                  {l.label}
                </div>
                <div
                  className="nw-serif"
                  style={{
                    fontSize: "30px",
                    fontWeight: 500,
                    marginTop: "9px",
                    letterSpacing: "-0.01em",
                    color: l.color,
                  }}
                >
                  {l.value}
                </div>
                <div style={{ fontSize: "11.5px", color: "#A1A1AA", marginTop: "4px" }}>{l.sub}</div>
              </div>
            ))}
          </div>

          {/* region rollup */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E4E4E7",
              borderRadius: "14px",
              padding: "22px 26px",
              marginTop: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <h3
                className="nw-serif"
                style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}
              >
                Contracted volume by region
              </h3>
              <span
                className="nw-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#A1A1AA",
                }}
              >
                active · lbs / mo
              </span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {accountRegions.map((r) => (
                <div key={r.name} style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      marginBottom: "7px",
                    }}
                  >
                    <span style={{ fontSize: "12.5px", fontWeight: 500 }}>{r.name}</span>
                    <span
                      className="nw-mono"
                      style={{ fontSize: "11px", color: "#71717A" }}
                    >
                      {r.revLabel}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "#F1F1F3",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div style={r.barStyle}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* chips */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "20px 0 14px" }}>
            {accChips.map((chip) => (
              <button
                key={chip.key}
                onClick={chip.onClick}
                aria-pressed={af === chip.key}
                style={chip.style}
              >
                {chip.label}
                <span style={chip.countStyle}>{chip.count}</span>
              </button>
            ))}
          </div>

          {/* card directory */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            {accountCards.map((c) => (
              <div
                key={c.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E6E6E9",
                  borderRadius: "13px",
                  padding: "20px 22px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.name}
                    </div>
                    <div
                      className="nw-mono"
                      style={{ fontSize: "10px", color: "#A1A1AA", marginTop: "3px" }}
                    >
                      {c.idLabel} · {c.region}
                    </div>
                  </div>
                  <span style={c.statusStyle}>{c.statusLabel}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    marginTop: "18px",
                  }}
                >
                  <div>
                    <span className="nw-serif" style={{ fontSize: "26px", fontWeight: 500 }}>
                      {c.volNum}
                    </span>
                    <span
                      className="nw-mono"
                      style={{ fontSize: "10px", color: "#A1A1AA", marginLeft: "4px" }}
                    >
                      lbs/mo
                    </span>
                  </div>
                  <div
                    className="nw-mono"
                    style={{ fontSize: "10px", color: "#A1A1AA", textAlign: "right" }}
                  >
                    {c.tenure}
                  </div>
                </div>
                <div
                  style={{
                    height: "5px",
                    background: "#F1F1F3",
                    borderRadius: "3px",
                    overflow: "hidden",
                    marginTop: "12px",
                  }}
                >
                  <div style={c.barStyle}></div>
                </div>
              </div>
            ))}
          </div>

          {accPager.show && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "22px",
              }}
            >
              <span className="nw-mono" style={{ fontSize: "11px", color: "#A1A1AA" }}>
                {accPager.rangeLabel}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <button
                  onClick={accPager.onPrev}
                  disabled={aPage === 0}
                  aria-label="Previous page"
                  style={accPager.prevStyle}
                >
                  ‹
                </button>
                {accPager.pages.map((pg) => (
                  <button key={pg.n} onClick={pg.onClick} style={pg.style}>
                    {pg.n}
                  </button>
                ))}
                <button
                  onClick={accPager.onNext}
                  disabled={aPage === aPages - 1}
                  aria-label="Next page"
                  style={accPager.nextStyle}
                >
                  ›
                </button>
              </div>
            </div>
          )}

          {accountsEmpty && (
            <div
              style={{
                padding: "48px 20px",
                textAlign: "center",
                fontSize: "13px",
                color: "#A1A1AA",
              }}
            >
              No accounts in this view.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
