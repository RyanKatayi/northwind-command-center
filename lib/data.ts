import inquiriesJson from "@/data/inquiries.json";
import salesJson from "@/data/sales.json";
import accountsJson from "@/data/accounts.json";
import type { Account, Inquiry, Sale } from "./types";

// The files in data/ are the read-only source. We import them as typed arrays
// and never write back to them; operator state lives in localStorage instead.
export const inquiries = inquiriesJson as Inquiry[];
export const sales = salesJson as Sale[];
export const accounts = accountsJson as Account[];

export function getInquiryById(id: string): Inquiry | undefined {
  return inquiries.find((i) => i.id === id);
}
