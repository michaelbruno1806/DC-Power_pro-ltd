const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  fileName: string;
  mimeType: string;
  fileBase64: string; // raw base64, no data URL prefix
  period: string;
  company?: { name?: string; brn?: string; tan?: string; ern?: string };
  totals: Record<string, number>;
  employees: Array<{ name: string; nic?: string | null; gross: number; paye: number; csg: number; nsf: number; prgf: number }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "AI is not configured on this project." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Payload;
    if (!body?.fileBase64 || !body?.mimeType) {
      return new Response(JSON.stringify({ error: "No filing notice was uploaded." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isImage = body.mimeType.startsWith("image/");
    const dataUrl = `data:${body.mimeType};base64,${body.fileBase64}`;

    const payrollContext = [
      `Company: ${body.company?.name ?? "—"} (BRN ${body.company?.brn ?? "—"}, TAN ${body.company?.tan ?? "—"}, ERN ${body.company?.ern ?? "—"})`,
      `Payroll period: ${body.period}`,
      `Totals from our payroll run (MUR):`,
      ...Object.entries(body.totals).map(([k, v]) => `  - ${k}: ${Number(v).toFixed(2)}`),
      `Employee count: ${body.employees.length}`,
      `Per-employee figures (name | NIC | gross | PAYE | CSG | NSF | PRGF):`,
      ...body.employees.slice(0, 200).map(
        (e) =>
          `  ${e.name} | ${e.nic ?? "—"} | ${e.gross.toFixed(2)} | ${e.paye.toFixed(2)} | ${e.csg.toFixed(2)} | ${e.nsf.toFixed(2)} | ${e.prgf.toFixed(2)}`,
      ),
    ].join("\n");

    const instructions = `You are a Mauritian payroll compliance assistant. The user uploads a Mauritius Revenue Authority (MRA) notice, assessment, or acknowledgement of a monthly return. Compare every figure you can read in the document against the payroll run figures supplied below.

Mauritius statutory rules in force for this system: PAYE at 15% on chargeable emoluments above the annual exemption of Rs 390,000; CSG/NSF employee 1.5% capped at Rs 375 per month; PRGF 3% employee and 6% employer; HRDC training levy 1.5%.

Write the answer as markdown with these sections:
## Summary
One short paragraph: does the notice agree with our payroll run?
## Figures compared
A markdown table with columns: Item | MRA notice | Our payroll | Difference. Write "not stated" where the notice does not show a figure.
## Discrepancies explained
For each difference, a bullet giving the likely cause (late joiner, unpaid leave, cap applied, exempt employee, rounding, wrong period, penalty or interest added, etc.).
## What to do next
Concrete steps for the payroll administrator, including the filing deadline if the notice mentions one.

Only state figures you actually read in the document. If the document is unreadable or is not an MRA document, say so plainly and stop.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        reasoning: { effort: "medium", summary: "auto" },
        include: ["reasoning.encrypted_content"],
        store: false,
        instructions,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: `Here is the MRA notice (${body.fileName}) and our payroll data.\n\n${payrollContext}` },
              isImage
                ? { type: "input_image", image_url: dataUrl }
                : { type: "input_file", filename: body.fileName, file_data: dataUrl },
            ],
          },
        ],
      }),
    });

    if (!res.ok || !res.body) {
      const detail = await res.text();
      console.error("AI gateway error", res.status, detail);
      const message =
        res.status === 402
          ? "AI credits are exhausted for this workspace. Add credits to continue."
          : res.status === 429
            ? "The AI service is busy right now. Please try again in a moment."
            : "The AI service could not analyse this notice.";
      return new Response(JSON.stringify({ error: message }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Consume the SSE stream server-side and return the final analysis.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    let reasoning = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (!raw || raw === "[DONE]") continue;
        try {
          const evt = JSON.parse(raw);
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") text += evt.delta;
          else if (evt.type === "response.reasoning_summary_text.delta" && typeof evt.delta === "string") reasoning += evt.delta;
          else if (evt.type === "response.completed" && !text && typeof evt.response?.output_text === "string") {
            text = evt.response.output_text;
          }
        } catch (_) {
          // ignore keep-alives / partial frames
        }
      }
    }

    return new Response(JSON.stringify({ analysis: text.trim(), reasoning: reasoning.trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-mra-notice failed", err);
    return new Response(JSON.stringify({ error: "Something went wrong while analysing the notice." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
