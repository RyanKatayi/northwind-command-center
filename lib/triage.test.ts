import { describe, it, expect } from "vitest";
import { scoreInquiry, contactedFlag, effectiveStatus, TIERS } from "./triage";
import { NORTHWIND_NOW } from "./format";
import type { Inquiry, InquiryStatus } from "./types";

function inq(over: Partial<Inquiry> = {}): Inquiry {
  return {
    id: "inq_test",
    cafe_name: "Test Cafe",
    contact_name: "Pat Doe",
    email: "pat@test.com",
    region: "Southwest",
    channel: "website",
    requested_volume_lbs_month: 100,
    message: "",
    received_date: NORTHWIND_NOW,
    status: "new",
    ...over,
  };
}

describe("scoreInquiry", () => {
  it("scores a big, fresh, urgent referral as hot", () => {
    const r = scoreInquiry(
      inq({
        requested_volume_lbs_month: 340,
        channel: "referral",
        message: "We need to switch suppliers asap.",
        received_date: NORTHWIND_NOW,
      }),
      "qualified",
      NORTHWIND_NOW,
    );
    expect(r.total).toBe(100); // 35 + 25 + 15 + 15 + 10
    expect(r.tier).toBe("hot");
  });

  it("scores a tiny, stale, low-intent cold inbound as cold", () => {
    const r = scoreInquiry(
      inq({
        requested_volume_lbs_month: 20,
        channel: "cold inbound",
        message: "Just exploring options for now.",
        received_date: "2026-04-01",
        status: "closed",
      }),
      "closed",
      NORTHWIND_NOW,
    );
    expect(r.total).toBeLessThan(46);
    expect(r.tier).toBe("cold");
  });

  it("applies the documented tier thresholds", () => {
    // total 68 -> hot, 46 -> warm boundary
    const hot = scoreInquiry(inq({ requested_volume_lbs_month: 999 }), "qualified", NORTHWIND_NOW);
    expect(hot.total).toBeGreaterThanOrEqual(68);
    expect(hot.tier).toBe("hot");
  });

  it("keeps every factor within its cap and sums factors to the total", () => {
    const r = scoreInquiry(inq({ requested_volume_lbs_month: 5000 }), "new", NORTHWIND_NOW);
    for (const f of r.factors) {
      expect(f.pts).toBeLessThanOrEqual(f.max);
      expect(f.pts).toBeGreaterThanOrEqual(0);
    }
    const sum = r.factors.reduce((a, f) => a + f.pts, 0);
    expect(sum).toBe(r.total);
  });

  it("never returns a tier outside the known set", () => {
    const r = scoreInquiry(inq(), "new", NORTHWIND_NOW);
    expect(Object.keys(TIERS)).toContain(r.tier);
  });
});

describe("operator state helpers", () => {
  it("reads the override status over the source status", () => {
    const base = inq({ status: "new" });
    expect(effectiveStatus(base)).toBe("new");
    expect(effectiveStatus(base, { status: "qualified" as InquiryStatus })).toBe("qualified");
  });

  it("treats a contactedAt stamp or a contacted status as contacted", () => {
    const base = inq({ status: "new" });
    expect(contactedFlag(base)).toBe(false);
    expect(contactedFlag(base, { contactedAt: "2026-06-20T00:00:00Z" })).toBe(true);
    expect(contactedFlag(base, { status: "contacted" })).toBe(true);
  });
});
