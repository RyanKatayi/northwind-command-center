import type { Inquiry, InquiryChannel, InquiryOverride, InquiryStatus, Priority } from "./types";
import { cap, daysBetween } from "./format";

/**
 * Lead scoring.
 *
 * Total out of 100, from five weighted signals an operator cares about:
 *   Volume 35, Message intent 25, Channel 15, Recency 15, Pipeline stage 10.
 * Tiers: hot >= 68, warm >= 46, else cold.
 */

export interface ScoreFactor {
  label: string;
  detail: string;
  pts: number;
  max: number;
}

export interface ScoreResult {
  total: number;
  tier: Priority;
  factors: ScoreFactor[];
  days: number;
}

const CHANNEL_PTS: Record<InquiryChannel, number> = {
  referral: 15,
  "trade show": 12,
  website: 9,
  instagram: 7,
  "cold inbound": 4,
};

const STAGE_PTS: Record<InquiryStatus, number> = {
  qualified: 10,
  new: 6,
  contacted: 3,
  closed: 0,
};

const HIGH_INTENT = [
  "asap",
  "switch",
  "discontinued",
  "opening in",
  "launch",
  "by next month",
  "quality has dropped",
  "replacement",
];
const LOW_INTENT = ["just exploring", "not in a rush"];
const MED_INTENT = [
  "pricing",
  "lead time",
  "samples",
  "volume discount",
  "reliable",
  "consistent",
  "second location",
  "grow with us",
  "minimum order",
  "carry it",
];

export function effectiveStatus(inq: Inquiry, override?: InquiryOverride): InquiryStatus {
  return override?.status ?? inq.status;
}

export function isContacted(override?: InquiryOverride): boolean {
  return !!override?.contactedAt;
}

export function contactedFlag(inq: Inquiry, override?: InquiryOverride): boolean {
  return isContacted(override) || effectiveStatus(inq, override) === "contacted";
}

export function scoreInquiry(inq: Inquiry, status: InquiryStatus, now: string): ScoreResult {
  const vol = inq.requested_volume_lbs_month || 0;
  const volPts = Math.min(35, Math.round((vol / 340) * 35));

  const m = (inq.message || "").toLowerCase();
  let intentPts = 12;
  let intentLabel = "Standard interest";
  if (HIGH_INTENT.some((k) => m.includes(k))) {
    intentPts = 25;
    intentLabel = "Urgent / switching";
  } else if (LOW_INTENT.some((k) => m.includes(k))) {
    intentPts = 5;
    intentLabel = "Low urgency";
  } else if (MED_INTENT.some((k) => m.includes(k))) {
    intentPts = 16;
    intentLabel = "Active buying signals";
  }

  const chPts = CHANNEL_PTS[inq.channel] ?? 6;

  const days = Math.max(0, daysBetween(now, inq.received_date));
  let recPts = 3;
  if (days <= 7) recPts = 15;
  else if (days <= 14) recPts = 11;
  else if (days <= 30) recPts = 7;

  const stPts = STAGE_PTS[status] ?? 5;

  const total = volPts + intentPts + chPts + recPts + stPts;
  const tier: Priority = total >= 68 ? "hot" : total >= 46 ? "warm" : "cold";

  const factors: ScoreFactor[] = [
    { label: "Requested volume", detail: `${vol} lbs/mo`, pts: volPts, max: 35 },
    { label: "Message intent", detail: intentLabel, pts: intentPts, max: 25 },
    { label: "Channel quality", detail: cap(inq.channel), pts: chPts, max: 15 },
    { label: "Recency", detail: `${days}d ago`, pts: recPts, max: 15 },
    { label: "Pipeline stage", detail: cap(status), pts: stPts, max: 10 },
  ];

  return { total, tier, factors, days };
}

export const TIERS: Record<Priority, { label: string; color: string; tint: string }> = {
  hot: { label: "Hot", color: "#CF3A3A", tint: "rgba(207,58,58,0.10)" },
  warm: { label: "Warm", color: "#DD8B0B", tint: "rgba(221,139,11,0.12)" },
  cold: { label: "Cold", color: "#8B8B92", tint: "rgba(113,113,122,0.12)" },
};

export const TEAM = ["Priya Nair", "Marco Reyes", "Sam Lindqvist"];
