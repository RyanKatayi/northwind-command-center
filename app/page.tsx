import type { Metadata } from "next";
import { OverviewClient } from "@/components/overview/OverviewClient";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewPage() {
  return <OverviewClient />;
}
