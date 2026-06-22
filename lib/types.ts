// Shared domain types for the Northwind command center.
// These mirror the shapes of the mock data files in data/.

export type Region =
  | "Pacific Northwest"
  | "Bay Area"
  | "Mountain West"
  | "Southwest";

export type InquiryChannel =
  | "website"
  | "referral"
  | "trade show"
  | "cold inbound"
  | "instagram";

export type InquiryStatus = "new" | "contacted" | "qualified" | "closed";

export interface Inquiry {
  id: string;
  cafe_name: string;
  contact_name: string;
  email: string;
  region: Region;
  channel: InquiryChannel;
  requested_volume_lbs_month: number;
  message: string;
  received_date: string; // YYYY-MM-DD
  status: InquiryStatus;
}

export interface Sale {
  date: string; // YYYY-MM-DD
  region: Region;
  sku: string;
  product: string;
  units_lbs: number;
  revenue: number;
}

export type AccountStatus = "active" | "paused";

export interface Account {
  id: string;
  name: string;
  region: Region;
  monthly_volume_lbs: number;
  customer_since: string; // YYYY-MM-DD
  status: AccountStatus;
}

export type Priority = "hot" | "warm" | "cold";

// Operator-applied state that persists across reloads (localStorage).
// We never mutate the source JSON; overrides layer on top of it.
export interface InquiryOverride {
  status?: InquiryStatus;
  assignee?: string;
  contactedAt?: string; // ISO timestamp
}

export type InquiryOverrides = Record<string, InquiryOverride>;
