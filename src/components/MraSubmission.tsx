import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Upload, Loader2, CheckCircle2, Clock, FileCheck2, Download, Send, X,
} from "lucide-react";

const MAX_BYTES = 20 * 1024 * 1024;

interface Props {
  companyId: string;
  payrollFileId: string;
  month: number;
  year: number;
  period: string;
  totalPayable: number;
  onFiled?: () => void;
}

interface Submission {
  id: string;
  status: string;
  reference_number: string | null;
  amount_paid: number | null;
  submitted_at: string;
  confirmed_at: string | null;
  notes: string | null;
  return_path: string | null;
  acknowledgement_path: string | null;
}

const MraSubmission = ({ companyId, payrollFileId, month, year, period, totalPayable, onFiled }: Props) => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState(String(Math.round(totalPayable * 100) / 100));
  const [notes, setNotes] = useState("");
  const [returnFile, setReturnFile] = useState<File | null>(null);
  const [ackFile, setAckFile] = useState<File | null>(null);
  const returnInput = useRef<HTMLInputElement>(null);
  const ackInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("mra_submissions")
      .select("*")
      .eq("payroll_file_id", payrollFileId)
      .maybeSingle();
    setSubmission((data as Submission) ?? null);
    if (data) {
      setReference(data.reference_number ?? "");
      setAmount(data.amount_paid != null ? String(data.amount_paid) : String(totalPayable));
      setNotes(data.notes ?? "");
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payrollFileId]);

  const pick = (file: File | null, set: (f: File | null) => void) => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error("File too large", { description: "Maximum size is 20 MB." });
      return;
    }
    set(file);
  };

  const upload = async (file: File, kind: string) => {
    const ext = file.name.split(".").pop() || "pdf";
    const path = `${companyId}/${year}-${String(month).padStart(2, "0")}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("mra-filings").upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
  };

  const download = async (path: string) => {
    const { data, error } = await supabase.storage.from("mra-filings").createSignedUrl(path, 120);
    if (error || !data) {
      toast.error("Could not open the file");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const submit = async () => {
    if (!reference.trim()) {
      toast.error("Add the MRA reference number shown after you submit on the portal.");
      return;
    }
    setSaving(true);
    try {
      const returnPath = returnFile ? await upload(returnFile, "return") : submission?.return_path ?? null;
      const ackPath = ackFile ? await upload(ackFile, "acknowledgement") : submission?.acknowledgement_path ?? null;
      const confirmed = Boolean(ackPath);
      const { data: userRes } = await supabase.auth.getUser();

      const payload = {
        company_id: companyId,
        payroll_file_id: payrollFileId,
        month,
        year,
        status: confirmed ? "confirmed" : "submitted",
        reference_number: reference.trim(),
        amount_paid: amount ? Number(amount) : null,
        notes: notes.trim() || null,
        return_path: returnPath,
        acknowledgement_path: ackPath,
        confirmed_at: confirmed ? new Date().toISOString() : null,
        created_by: userRes?.user?.id ?? null,
        updated_at: new Date().toISOString(),
      };

      const { error } = submission
        ? await supabase.from("mra_submissions").update(payload).eq("id", submission.id)
        : await supabase.from("mra_submissions").insert(payload);
      if (error) throw error;

      if (confirmed) {
        await supabase.from("payroll_files")
          .update({ mra_filed_at: new Date().toISOString() })
          .eq("id", payrollFileId);
      }

      setReturnFile(null);
      setAckFile(null);
      await load();
      onFiled?.();
      toast.success(confirmed ? "Filing confirmed" : "Filing recorded", {
        description: confirmed
          ? `${period} is marked as filed with the MRA.`
          : "Upload the MRA acknowledgement to confirm this filing.",
      });
    } catch (e: any) {
      toast.error("Could not save the filing", { description: e?.message ?? "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const FilePick = ({
    label, hint, file, existing, inputRef, onPick, onClear,
  }: {
    label: string; hint: string; file: File | null; existing: string | null;
    inputRef: React.RefObject<HTMLInputElement>;
    onPick: (f: File | null) => void; onClear: () => void;
  }) => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => inputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" /> {file ? "Replace" : "Choose file"}
        </Button>
        {file ? (
          <span className="text-xs text-foreground flex items-center gap-1.5">
            {file.name}
            <button type="button" onClick={onClear} className="text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </span>
        ) : existing ? (
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => download(existing)}>
            <Download className="h-3.5 w-3.5" /> View stored file
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">{hint}</span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <GlassCard className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading filing status…
      </GlassCard>
    );
  }

  const confirmed = submission?.status === "confirmed";

  return (
    <GlassCard className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <FileCheck2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-medium text-foreground">MRA Submission Record — {period}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Files are stored privately for your company only. Submission to the MRA happens on their e-services
              portal; record the reference here and attach the acknowledgement to confirm.
            </div>
          </div>
        </div>
        {submission && (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${
              confirmed ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
            }`}
          >
            {confirmed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
            {confirmed ? "Filed & confirmed" : "Awaiting confirmation"}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor={`ref-${payrollFileId}`} className="text-xs">MRA reference number</Label>
          <Input
            id={`ref-${payrollFileId}`}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. MRA/PAYE/2026/000123"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`amt-${payrollFileId}`} className="text-xs">Amount paid (MUR)</Label>
          <Input
            id={`amt-${payrollFileId}`}
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <FilePick
          label="Return submitted"
          hint="PDF or image of the return you filed"
          file={returnFile}
          existing={submission?.return_path ?? null}
          inputRef={returnInput}
          onPick={(f) => pick(f, setReturnFile)}
          onClear={() => setReturnFile(null)}
        />
        <FilePick
          label="MRA acknowledgement"
          hint="Receipt from the portal — confirms the filing"
          file={ackFile}
          existing={submission?.acknowledgement_path ?? null}
          inputRef={ackInput}
          onPick={(f) => pick(f, setAckFile)}
          onClear={() => setAckFile(null)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`notes-${payrollFileId}`} className="text-xs">Notes (optional)</Label>
        <Textarea
          id={`notes-${payrollFileId}`}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Payment channel, who filed, anything to remember"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {submission
            ? `Recorded ${new Date(submission.submitted_at).toLocaleString()}${
                submission.confirmed_at ? ` · confirmed ${new Date(submission.confirmed_at).toLocaleString()}` : ""
              }`
            : `Total payable for this month: MUR ${totalPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          disabled={saving}
          onClick={submit}
          style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          {submission ? "Update filing record" : "Record filing"}
        </Button>
      </div>
    </GlassCard>
  );
};

export default MraSubmission;
