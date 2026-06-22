"use client";

import { sales, inquiries } from "@/lib/data";
import {
  fmtMoney,
  fmtNum,
  parseDate,
  formatDate,
  daysBetween,
  NORTHWIND_NOW,
} from "@/lib/format";
import { scoreInquiry, effectiveStatus } from "@/lib/triage";
import { useOverrides } from "@/lib/useOverrides";

const ACCENT = "#1A7F5A";
const DARK_ACCENT = "#4FD9A0";

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function pad2(n: number): string {
  return (n < 10 ? "0" : "") + n;
}

export default function OverviewPage() {
  const { overrides } = useOverrides();

  // ===== Sales aggregations (windowed to the trailing 90 days) =====
  // Find the latest sale, then only aggregate the last 90 days so the
  // "last 90 days" headline stays accurate even if the dataset grows past it.
  let maxT = -Infinity;
  for (const s of sales) {
    const t = parseDate(s.date).getTime();
    if (t > maxT) maxT = t;
  }
  const maxD = new Date(maxT);
  const windowStartT = addDays(maxD, -89).getTime();
  const windowed = sales.filter((s) => parseDate(s.date).getTime() >= windowStartT);

  let totalRev = 0;
  let totalLbs = 0;
  let minT = Infinity;
  const byRegion: Record<string, number> = {};
  const byProduct: Record<string, number> = {};
  const byProductLbs: Record<string, number> = {};
  for (const s of windowed) {
    totalRev += s.revenue;
    totalLbs += s.units_lbs;
    byRegion[s.region] = (byRegion[s.region] || 0) + s.revenue;
    byProduct[s.product] = (byProduct[s.product] || 0) + s.revenue;
    byProductLbs[s.product] = (byProductLbs[s.product] || 0) + s.units_lbs;
    const t = parseDate(s.date).getTime();
    if (t < minT) minT = t;
  }
  const minD = new Date(minT);

  // Trailing-30 vs prior-30 by revenue, windows relative to max sale date.
  const a0 = addDays(maxD, -29).getTime();
  const b0 = addDays(maxD, -59).getTime();
  const b1 = addDays(maxD, -30).getTime();
  let recRev = 0;
  let prevRev = 0;
  for (const s of sales) {
    const t = parseDate(s.date).getTime();
    if (t >= a0) {
      recRev += s.revenue;
    } else if (t >= b0 && t <= b1) {
      prevRev += s.revenue;
    }
  }
  const deltaRev = prevRev ? ((recRev - prevRev) / prevRev) * 100 : 0;
  const deltaUp = deltaRev >= 0;

  // ===== Inquiry KPIs (override-aware) =====
  const openAll = inquiries.filter(
    (i) => effectiveStatus(i, overrides[i.id]) !== "closed",
  );
  const openCount = openAll.length;
  const pipelineLbs = openAll.reduce(
    (a, i) => a + (i.requested_volume_lbs_month || 0),
    0,
  );
  const last7 = inquiries.filter(
    (i) => daysBetween(NORTHWIND_NOW, i.received_date) <= 7,
  ).length;
  const hotOpen = openAll.filter(
    (i) =>
      scoreInquiry(i, effectiveStatus(i, overrides[i.id]), NORTHWIND_NOW)
        .tier === "hot",
  ).length;

  // ===== Weekly spark buckets (min -> max sale date, 7-day buckets) =====
  const totalDays = daysBetween(
    maxD.toISOString().slice(0, 10),
    minD.toISOString().slice(0, 10),
  );
  const nb = Math.ceil((totalDays + 1) / 7);
  const buckets: { start: Date; s: number; e: number; rev: number }[] = [];
  for (let i = 0; i < nb; i++) {
    const start = addDays(minD, i * 7);
    const end = addDays(start, 6);
    buckets.push({
      start,
      s: start.getTime(),
      e: end.getTime() + 86399000,
      rev: 0,
    });
  }
  for (const s of sales) {
    const t = parseDate(s.date).getTime();
    for (const b of buckets) {
      if (t >= b.s && t <= b.e) {
        b.rev += s.revenue;
        break;
      }
    }
  }
  const maxWeek = Math.max(1, ...buckets.map((b) => b.rev));
  const fmtMD = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const sparkStart = fmtMD(buckets[0].start).toUpperCase();
  const sparkEnd = fmtMD(buckets[buckets.length - 1].start).toUpperCase();

  // ===== League tables =====
  const regionsArr = Object.keys(byRegion)
    .map((k) => ({ name: k, rev: byRegion[k] }))
    .sort((a, b) => b.rev - a.rev);
  const maxRegionRev = regionsArr[0] ? regionsArr[0].rev : 1;

  const productsArr = Object.keys(byProduct)
    .map((k) => ({ name: k, rev: byProduct[k], lbs: byProductLbs[k] }))
    .sort((a, b) => b.rev - a.rev);

  const secondaryKpis = [
    { label: "Volume shipped", value: fmtNum(totalLbs) + " lbs", sub: "across all SKUs" },
    { label: "Open inquiries", value: String(openCount), sub: last7 + " new this week" },
    { label: "Pipeline volume", value: fmtNum(pipelineLbs) + " lbs", sub: "requested / month" },
    { label: "Hot leads", value: String(hotOpen), sub: "need action now" },
  ];

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
            Command center
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
            Good morning
          </h1>
          <div style={{ fontSize: "13.5px", color: "#71717A", marginTop: "7px" }}>
            Here&rsquo;s how the wholesale book looks across all regions.
          </div>
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
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#1A7F5A",
            }}
          />
          <span
            className="nw-mono"
            style={{ fontSize: "11px", color: "#52525B", letterSpacing: "0.03em" }}
          >
            Updated {formatDate(NORTHWIND_NOW)}
          </span>
        </div>
      </header>

      {/* SCROLL */}
      <div
        className="nw-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "8px 36px 56px",
        }}
      >
        <div style={{ animation: "nw-fade 0.35s ease" }}>
          {/* INK HERO */}
          <div
            style={{
              background: "#161617",
              borderRadius: "18px",
              padding: "34px 40px",
              display: "flex",
              gap: "44px",
              color: "#FAFAFA",
            }}
          >
            <div
              style={{
                flex: "1.15",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                className="nw-mono"
                style={{
                  fontSize: "10.5px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#9A9AA2",
                }}
              >
                Net revenue &middot; last 90 days
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "14px",
                  marginTop: "14px",
                }}
              >
                <span
                  className="nw-serif"
                  style={{
                    fontSize: "60px",
                    fontWeight: 500,
                    lineHeight: 0.9,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {fmtMoney(totalRev)}
                </span>
                <span
                  className="nw-mono"
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: deltaUp ? "#6FE3AE" : "#F0A0A0",
                    background: deltaUp
                      ? "rgba(95,207,158,0.15)"
                      : "rgba(240,140,140,0.15)",
                    padding: "3px 9px",
                    borderRadius: "7px",
                    marginBottom: "8px",
                  }}
                >
                  {(deltaUp ? "↑ " : "↓ ") + Math.abs(deltaRev).toFixed(1) + "%"}
                </span>
              </div>
              <div style={{ fontSize: "12.5px", color: "#8B8B92", marginTop: "11px" }}>
                {"vs. prior 30 days · " + fmtNum(totalLbs) + " lbs shipped"}
              </div>

              <div style={{ marginTop: "auto", paddingTop: "28px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "4px",
                    height: "52px",
                  }}
                >
                  {buckets.map((b, i) => {
                    const pct = (b.rev / maxWeek) * 100;
                    const isPeak = b.rev === maxWeek;
                    const lbl = b.start.getMonth() + 1 + "/" + b.start.getDate();
                    return (
                      <div
                        key={i}
                        title={"Week of " + lbl + " · " + fmtMoney(b.rev)}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          height: "100%",
                        }}
                      >
                        <div
                          style={{
                            height: pct + "%",
                            minHeight: "3px",
                            background: isPeak
                              ? DARK_ACCENT
                              : "rgba(255,255,255,0.20)",
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div
                  className="nw-mono"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "9.5px",
                    color: "#5B5B63",
                    marginTop: "8px",
                    letterSpacing: "0.04em",
                  }}
                >
                  <span>{sparkStart}</span>
                  <span>WEEKLY REVENUE</span>
                  <span>{sparkEnd}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: "11px",
                overflow: "hidden",
              }}
            >
              {secondaryKpis.map((kpi, i) => (
                <div key={i} style={{ background: "#161617", padding: "18px 18px 16px" }}>
                  <div
                    className="nw-mono"
                    style={{
                      fontSize: "9.5px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#9A9AA2",
                    }}
                  >
                    {kpi.label}
                  </div>
                  <div
                    className="nw-serif"
                    style={{
                      fontSize: "27px",
                      fontWeight: 500,
                      color: "#FAFAFA",
                      marginTop: "9px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {kpi.value}
                  </div>
                  <div style={{ fontSize: "11px", color: "#8B8B92", marginTop: "5px" }}>
                    {kpi.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEAGUE TABLES */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginTop: "24px",
            }}
          >
            {/* Regions */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E4E4E7",
                borderRadius: "14px",
                padding: "24px 26px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <h2
                  className="nw-serif"
                  style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}
                >
                  Regions
                </h2>
                <span
                  className="nw-mono"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#A1A1AA",
                  }}
                >
                  90-day revenue
                </span>
              </div>
              {regionsArr.map((r, i) => (
                <div
                  key={r.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "13px 0",
                    borderTop: "1px solid #F1F1F3",
                  }}
                >
                  <span
                    className="nw-mono"
                    style={{
                      fontSize: "11px",
                      color: "#A1A1AA",
                      width: "18px",
                      flex: "none",
                    }}
                  >
                    {pad2(i + 1)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        marginBottom: "7px",
                      }}
                    >
                      <span style={{ fontSize: "14px", fontWeight: 500 }}>{r.name}</span>
                      <span
                        className="nw-serif"
                        style={{ fontSize: "18px", fontWeight: 600 }}
                      >
                        {fmtMoney(r.rev)}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          flex: 1,
                          height: "5px",
                          background: "#F1F1F3",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: (r.rev / maxRegionRev) * 100 + "%",
                            height: "100%",
                            background: ACCENT,
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                      <span
                        className="nw-mono"
                        style={{
                          fontSize: "10.5px",
                          color: "#A1A1AA",
                          width: "30px",
                          textAlign: "right",
                        }}
                      >
                        {((r.rev / totalRev) * 100).toFixed(0) + "%"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Products */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E4E4E7",
                borderRadius: "14px",
                padding: "24px 26px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <h2
                  className="nw-serif"
                  style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}
                >
                  Products
                </h2>
                <span
                  className="nw-mono"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#A1A1AA",
                  }}
                >
                  Revenue &middot; volume
                </span>
              </div>
              {productsArr.map((p, i) => (
                <div
                  key={p.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "11px 0",
                    borderTop: "1px solid #F1F1F3",
                  }}
                >
                  <span
                    className="nw-mono"
                    style={{
                      fontSize: "11px",
                      color: "#A1A1AA",
                      width: "18px",
                      flex: "none",
                    }}
                  >
                    {pad2(i + 1)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "14px", fontWeight: 500 }}>{p.name}</span>
                      <span
                        className="nw-serif"
                        style={{ fontSize: "18px", fontWeight: 600 }}
                      >
                        {fmtMoney(p.rev)}
                      </span>
                    </div>
                    <div
                      className="nw-mono"
                      style={{ fontSize: "10.5px", color: "#A1A1AA", marginTop: "4px" }}
                    >
                      {fmtNum(p.lbs) + " lbs sold"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
