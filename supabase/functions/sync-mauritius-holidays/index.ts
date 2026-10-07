import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const FEED = "https://www.officeholidays.com/ics/mauritius";
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

function parseIcs(text: string) {
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const out: { holiday_date: string; name: string }[] = [];
  for (const block of unfolded.split("BEGIN:VEVENT").slice(1)) {
    const d = block.match(/DTSTART[^:\n]*:(\d{4})(\d{2})(\d{2})/);
    const s = block.match(/SUMMARY[^:\n]*:(.+)/);
    if (!d || !s) continue;
    const name = s[1].trim().replace(/^Mauritius:\s*/i, "").replace(/\\,/g, ",").replace(/\\;/g, ";").slice(0, 100);
    out.push({ holiday_date: `${d[1]}-${d[2]}-${d[3]}`, name });
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Not signed in" }, 401);
    const { companyId } = await req.json().catch(() => ({}));
    if (typeof companyId !== "string" || !/^[0-9a-f-]{36}$/i.test(companyId)) return json({ error: "Invalid company" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return json({ error: "Not signed in" }, 401);

    const res = await fetch(FEED);
    if (!res.ok) return json({ error: `Holiday feed unavailable (${res.status})` }, 502);
    const items = parseIcs(await res.text());
    if (!items.length) return json({ error: "Holiday feed returned no holidays" }, 502);

    // RLS ensures only managers of this company can insert.
    const { data, error } = await supabase
      .from("public_holidays")
      .upsert(items.map((h) => ({ ...h, company_id: companyId, is_recurring: false })), {
        onConflict: "company_id,holiday_date,name",
        ignoreDuplicates: true,
      })
      .select("id");
    if (error) return json({ error: error.message }, 403);
    return json({ fetched: items.length, added: data?.length ?? 0 });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Sync failed" }, 500);
  }
});
