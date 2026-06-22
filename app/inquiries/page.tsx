"use client";

import { useMemo, useState } from "react";
import { inquiries } from "@/lib/data";
import { NORTHWIND_NOW, parseDate } from "@/lib/format";
import { scoreInquiry, effectiveStatus, contactedFlag } from "@/lib/triage";
import { useOverrides } from "@/lib/useOverrides";
import type { InquiryStatus } from "@/lib/types";
import { TierTiles } from "@/components/triage/TierTiles";
import { Toolbar } from "@/components/triage/Toolbar";
import { TriageRow } from "@/components/triage/TriageRow";
import { Pager } from "@/components/triage/Pager";
import { ScoringLegend } from "@/components/triage/ScoringLegend";
import { DetailDrawer } from "@/components/triage/DetailDrawer";
import type { ScopedInquiry, SortKey, StatusFilter, TierFilter } from "@/components/triage/types";

const PAGE_SIZE = 8;

export default function InquiriesPage() {
  const { overrides, updateOverride } = useOverrides();

  const [tier, setTier] = useState<TierFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("priority");
  const [triagePage, setTriagePage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState("");

  // Score + effective status for every inquiry, keyed off the live overrides.
  const allScored = useMemo<ScopedInquiry[]>(
    () =>
      inquiries.map((inq) => {
        const ov = overrides[inq.id];
        const st = effectiveStatus(inq, ov);
        return { inq, st, sc: scoreInquiry(inq, st, NORTHWIND_NOW) };
      }),
    [overrides],
  );

  // Header summary numbers.
  const openAll = allScored.filter((x) => x.st !== "closed");
  const attn = openAll.filter((x) => !contactedFlag(x.inq, overrides[x.inq.id])).length;
  const openCount = openAll.length;
  const hotCount = openAll.filter((x) => x.sc.tier === "hot").length;

  // Status-scoped set (feeds the tile counts).
  const scoped = useMemo<ScopedInquiry[]>(() => {
    if (statusFilter === "open") return allScored.filter((x) => x.st !== "closed");
    if (statusFilter === "all") return allScored;
    return allScored.filter((x) => x.st === statusFilter);
  }, [allScored, statusFilter]);

  const counts = useMemo<Record<TierFilter, number>>(() => {
    const c: Record<TierFilter, number> = { all: scoped.length, hot: 0, warm: 0, cold: 0 };
    scoped.forEach((x) => {
      c[x.sc.tier]++;
    });
    return c;
  }, [scoped]);

  // Tier + search + sort applied to the working list.
  const list = useMemo<ScopedInquiry[]>(() => {
    let next = scoped.slice();
    if (tier !== "all") next = next.filter((x) => x.sc.tier === tier);
    const q = query.trim().toLowerCase();
    if (q) {
      next = next.filter((x) =>
        `${x.inq.cafe_name} ${x.inq.contact_name} ${x.inq.region} ${x.inq.message} ${x.inq.channel}`
          .toLowerCase()
          .includes(q),
      );
    }
    if (sort === "priority") next.sort((a, b) => b.sc.total - a.sc.total);
    else if (sort === "newest")
      next.sort((a, b) => parseDate(b.inq.received_date).getTime() - parseDate(a.inq.received_date).getTime());
    else if (sort === "volume")
      next.sort((a, b) => (b.inq.requested_volume_lbs_month || 0) - (a.inq.requested_volume_lbs_month || 0));
    return next;
  }, [scoped, tier, query, sort]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(triagePage, pages - 1);
  const start = page * PAGE_SIZE;
  const pageRows = list.slice(start, start + PAGE_SIZE);

  // ---- handlers ----
  const pickTier = (t: TierFilter) => {
    setTier(t);
    setTriagePage(0);
  };
  const changeStatus = (s: StatusFilter) => {
    setStatusFilter(s);
    setTriagePage(0);
  };
  const changeSort = (s: SortKey) => {
    setSort(s);
    setTriagePage(0);
  };
  const changeQuery = (q: string) => {
    setQuery(q);
    setTriagePage(0);
  };
  const openDetail = (id: string) => {
    setSelectedId(id);
    setDraft("");
    setDrafting(false);
  };
  const closeDetail = () => setSelectedId(null);

  const toggleContact = (id: string) => {
    const inq = inquiries.find((x) => x.id === id);
    if (!inq) return;
    if (contactedFlag(inq, overrides[id])) {
      updateOverride(id, { contactedAt: undefined, status: "qualified" satisfies InquiryStatus });
    } else {
      updateOverride(id, {
        contactedAt: new Date().toISOString(),
        status: "contacted" satisfies InquiryStatus,
      });
    }
  };

  const assign = (id: string, name: string) => {
    updateOverride(id, { assignee: name || undefined });
  };

  const draftReply = async () => {
    if (!selectedId) return;
    setDrafting(true);
    setDraft("");
    try {
      const res = await fetch("/api/draft-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId: selectedId }),
      });
      const data: { draft?: string } = await res.json();
      setDraft(data.draft ?? "");
    } catch {
      // Leave the draft empty on failure; operator can retry.
    } finally {
      setDrafting(false);
    }
  };

  const selected = selectedId ? allScored.find((x) => x.inq.id === selectedId) ?? null : null;

  return (
    <>
      <header
        style={{
          flex: "none",
          padding: "24px 36px 20px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div>
          <div
            className="nw-mono"
            style={{
              fontSize: 10.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#1A7F5A",
              marginBottom: 9,
            }}
          >
            Pipeline
          </div>
          <h1
            className="nw-serif"
            style={{ margin: 0, fontSize: 31, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.05 }}
          >
            Inquiry triage
          </h1>
          <div style={{ fontSize: 13.5, color: "#71717A", marginTop: 7 }}>
            {attn} open {attn === 1 ? "inquiry" : "inquiries"} awaiting first contact.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            background: "#FFFFFF",
            border: "1px solid #E4E4E7",
            borderRadius: 9,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1A7F5A" }} />
          <span className="nw-mono" style={{ fontSize: 11, color: "#52525B", letterSpacing: "0.03em" }}>
            {hotCount} hot · {openCount} open
          </span>
        </div>
      </header>

      <div className="nw-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 36px 56px" }}>
        <div style={{ animation: "nw-fade 0.35s ease" }}>
          <TierTiles tier={tier} counts={counts} onPick={pickTier} />

          <Toolbar
            rowCount={list.length}
            query={query}
            statusFilter={statusFilter}
            sort={sort}
            onQuery={changeQuery}
            onStatus={changeStatus}
            onSort={changeSort}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pageRows.map((x) => {
              const ov = overrides[x.inq.id];
              return (
                <TriageRow
                  key={x.inq.id}
                  item={x}
                  contacted={contactedFlag(x.inq, ov)}
                  assignee={ov?.assignee ?? ""}
                  onOpen={() => openDetail(x.inq.id)}
                  onToggle={() => toggleContact(x.inq.id)}
                />
              );
            })}
            {list.length === 0 && (
              <div
                style={{
                  padding: "56px 20px",
                  textAlign: "center",
                  background: "#FFFFFF",
                  border: "1px solid #E4E4E7",
                  borderRadius: 13,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: "#71717A" }}>Nothing in this view</div>
                <div style={{ fontSize: 13, color: "#A1A1AA", marginTop: 6 }}>
                  Try a different stage or clear your search.
                </div>
              </div>
            )}
          </div>

          <Pager total={list.length} page={page} pages={pages} start={start} size={PAGE_SIZE} onGo={setTriagePage} />

          <ScoringLegend />
        </div>
      </div>

      {selected && (
        <DetailDrawer
          inq={selected.inq}
          sc={selected.sc}
          contacted={contactedFlag(selected.inq, overrides[selected.inq.id])}
          assignee={overrides[selected.inq.id]?.assignee ?? ""}
          drafting={drafting}
          draft={draft}
          onClose={closeDetail}
          onToggle={() => toggleContact(selected.inq.id)}
          onAssign={(name) => assign(selected.inq.id, name)}
          onDraft={draftReply}
          onDraftChange={setDraft}
        />
      )}
    </>
  );
}
