import type { Inquiry, InquiryStatus } from "@/lib/types";
import type { ScoreResult } from "@/lib/triage";

export type TierFilter = "all" | "hot" | "warm" | "cold";
export type StatusFilter = InquiryStatus | "open" | "all";
export type SortKey = "priority" | "newest" | "volume";

// An inquiry paired with its computed score + the operator's effective status.
export interface ScopedInquiry {
  inq: Inquiry;
  sc: ScoreResult;
  st: InquiryStatus;
}
