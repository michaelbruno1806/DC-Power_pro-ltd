import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Upload, FileText, X, Loader2 } from "lucide-react";

const MAX_BYTES = 8 * 1024 * 1024;

interface Props {
  period: string;
  company: { name?: string; brn?: string; tan?: string; ern?: string } | null;
  totals: Record<string, number>;
  employees: Array<{ name: string; nic?: string | null; gross: number; paye: number; csg: number; nsf: number; prgf: number }>;
  disabled?: boolean;
}

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** Minimal renderer for the markdown the analysis returns (headings, bullets, tables, bold). */
const Analysis = ({ text }: { text: string }) => {
  const lines = text.split("\n");
  const blocks: JSX.Element[] = [];
  let i = 0;

  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, idx) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={idx} className="text-foreground">{part.slice(2, -2)}</strong>
      ) : (
        <span key={idx}>{part}</span>
      ),
    );

  while (i < lines.length) {
    const line = lines[i];

    if (/^#{1,4}\s/.test(line)) {
      blocks.push(
        <h4 key={i} className="text-sm font-semibold text-foreground mt-5 first:mt-0 uppercase tracking-[0.08em]">
          {line.replace(/^#{1,4}\s/, "")}
        </h4>,
      );
      i++;
      continue;
    }

    if (line.trim().startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...bodyRows] = rows;
      blocks.push(
        <div key={`t${i}`} className="overflow-x-auto mt-3">
          <table className="w-full text-xs min-w-[520px]">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                {head?.map((h, k) => (
                  <th key={k} className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-[0.1em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((r, k) => (
                <tr key={k} className="border-b border-border/40">
                  {r.map((c, j) => (
                    <td key={j} className="px-3 py-2 text-muted-foreground tabular-nums">{inline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^\s*([-*]|\d+\.)\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s/, ""));
        i++;
      }
      blocks.push(
        <ul key={`l${i}`} className="mt-2 space-y-1.5 list-disc pl-5">
          {items.map((it, k) => (
            <li key={k} className="text-sm text-muted-foreground leading-relaxed">{inline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (line.trim()) {
      blocks.push(
        <p key={i} className="text-sm text-muted-foreground leading-relaxed mt-2">{inline(line)}</p>,
      );
    }
    i++;
  }

  return <div>{blocks}</div>;
};

const MraNoticeAnalyzer = ({ period, company, totals, employees, disabled }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const pick = (f: File | null) => {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      toast.error("That file is larger than 8 MB. Please upload a smaller scan.");
      return;
    }
    setFile(f);
    setAnalysis(null);
  };

  const analyse = async () => {
    if (!file) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const fileBase64 = await toBase64(file);
      const { data, error } = await supabase.functions.invoke("analyze-mra-notice", {
        body: {
          fileName: file.name,
          mimeType: file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
          fileBase64,
          period,
          company: company ?? {},
          totals,
          employees,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) {
        toast.error((data as any).error);
        return;
      }
      const text = (data as any)?.analysis?.trim();
      if (!text) {
        toast.error("No explanation came back. Try a clearer scan of the notice.");
        return;
      }
      setAnalysis(text);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Could not analyse the notice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-foreground">Check an MRA notice against this payroll</div>
            <div className="text-xs text-muted-foreground mt-1">
              Upload the notice, assessment or acknowledgement you received (PDF or photo) and get a plain-language
              explanation of any difference from your {period} figures.
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
          />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => inputRef.current?.click()} disabled={loading}>
            <Upload className="h-3.5 w-3.5" /> {file ? "Change file" : "Upload notice"}
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}
            disabled={!file || loading || disabled}
            onClick={analyse}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {loading ? "Analysing…" : "Explain discrepancies"}
          </Button>
        </div>
      </div>

      {file && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground border border-border/60 rounded-lg px-3 py-2">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span className="truncate">{file.name}</span>
          <span className="tabular-nums">({(file.size / 1024).toFixed(0)} KB)</span>
          <button
            className="ml-auto hover:text-foreground"
            onClick={() => { setFile(null); setAnalysis(null); if (inputRef.current) inputRef.current.value = ""; }}
            aria-label="Remove file"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {loading && (
        <div className="mt-4 text-xs text-muted-foreground">
          Reading the notice and comparing it with your payroll run — this can take up to a minute.
        </div>
      )}

      {analysis && (
        <div className="mt-5 pt-5 border-t border-border/60">
          <Analysis text={analysis} />
          <p className="text-[11px] text-muted-foreground/70 mt-5">
            AI-generated guidance. Always confirm figures against the notice before paying or amending a return.
          </p>
        </div>
      )}
    </GlassCard>
  );
};

export default MraNoticeAnalyzer;
