import { NextResponse } from "next/server";
import { getInquiryById } from "@/lib/data";
import type { Inquiry } from "@/lib/types";

// The Anthropic SDK needs Node, not the edge runtime.
export const runtime = "nodejs";

// Current Claude model, fast and cheap, plenty for a short wholesale reply.
const MODEL = "claude-haiku-4-5-20251001";

export async function POST(req: Request) {
  let inquiryId: string | undefined;
  try {
    const body = await req.json();
    inquiryId = body?.inquiryId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!inquiryId) {
    return NextResponse.json({ error: "Missing inquiryId" }, { status: 400 });
  }

  const inquiry = getInquiryById(inquiryId);
  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  // No key, or the model call fails -> deterministic template draft. The
  // feature must work end-to-end with zero config.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ draft: templateDraft(inquiry), source: "template" });
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system:
        "You are a wholesale sales rep at Northwind Coffee, a specialty roaster selling to cafés. " +
        "Write a short, warm, professional reply (90-130 words) to this inbound wholesale inquiry. " +
        "Reference their specifics naturally. Do not invent prices. Sign as 'The Northwind Wholesale Team'. " +
        "Reply with the email body only.",
      messages: [
        {
          role: "user",
          content:
            `Café: ${inquiry.cafe_name} (${inquiry.region})\n` +
            `Contact: ${inquiry.contact_name}\n` +
            `Requested volume: ${inquiry.requested_volume_lbs_month} lbs/month\n` +
            `Channel: ${inquiry.channel}\n` +
            `Message: "${inquiry.message}"`,
        },
      ],
    });

    const text = message.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();

    if (!text) {
      return NextResponse.json({ draft: templateDraft(inquiry), source: "template" });
    }
    return NextResponse.json({ draft: text, source: "ai" });
  } catch (err) {
    // Network/key/model error -> fall back, never 500 on the operator. Log it so
    // a bad or expired key is debuggable in server logs without changing the
    // response contract (a silent template fallback otherwise hides the cause).
    console.error("draft-reply: model call failed, using template draft", err);
    return NextResponse.json({ draft: templateDraft(inquiry), source: "template" });
  }
}

function templateDraft(inquiry: Inquiry): string {
  const first = inquiry.contact_name.split(" ")[0] || "there";
  return (
    `Hi ${first},\n\n` +
    `Thanks for reaching out to Northwind Coffee. We'd love to support ${inquiry.cafe_name}. ` +
    `Based on your note, ${inquiry.requested_volume_lbs_month} lbs/month sits comfortably within our ` +
    `wholesale range, and we can build a program around it.\n\n` +
    `I've put together current wholesale pricing and lead times for your region. If it's helpful, I can ` +
    `send a sample box of our House Espresso and a single origin this week, and grab 15 minutes to dial ` +
    `in the details.\n\n` +
    `What does your timeline look like?\n\n` +
    `Warmly,\nThe Northwind Wholesale Team`
  );
}
