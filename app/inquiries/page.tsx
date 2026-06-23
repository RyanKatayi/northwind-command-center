import type { Metadata } from "next";
import { TriageClient } from "@/components/triage/TriageClient";

export const metadata: Metadata = { title: "Inquiry Triage" };

export default function InquiriesPage() {
  return <TriageClient />;
}
