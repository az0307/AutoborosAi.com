import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Field from "@/components/shared/Field";
import OutputStage from "@/components/shared/OutputStage";
import { trpc } from "@/providers/trpc";
import { useLocalHistory } from "@/hooks/useLocalHistory";

const EMAIL_TYPES = [
  { val: "quote_followup", label: "Quote Follow-Up" },
  { val: "job_complete", label: "Job Completion Thank You" },
  { val: "delay_notice", label: "Job Delay Notice" },
  { val: "inspection_report", label: "Inspection Report Cover" },
  { val: "storm_alert", label: "Storm Alert to Past Clients" },
  { val: "referral_request", label: "Referral Request" },
];

export default function EmailTool() {
  const [form, setForm] = useState({
    type: "quote_followup",
    customerName: "",
    context: "",
    tone: "friendly professional",
  });
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const localHistory = useLocalHistory();
  const generateMutation = trpc.ai.generate.useMutation({
    onSuccess: (data) => {
      setResult(data.text);
      localHistory.save({
        toolType: "email",
        title: `${EMAIL_TYPES.find((t) => t.val === form.type)?.label} — ${form.customerName}`,
        outputText: data.text,
        promptData: { ...form },
      });
      setError("");
    },
    onError: (err) => {
      setError(err.message || "API error — check your connection and try again.");
    },
  });

  const generate = useCallback(() => {
    if (!form.customerName) {
      setError("Customer name is required.");
      return;
    }
    setError("");
    setResult("");

    const system = `You are writing emails for Ben Breheny, Director of Y.M.I Roofing in Melbourne.
Ben is a straight-talking, experienced tradesperson. He's professional but not corporate. Emails should sound like him — warm, direct, trustworthy.
Include subject line and body. Keep it concise. Australian English.
Signature: Ben Breheny | Y.M.I Roofing | 0422 093 241 | y.m.iroofing@outlook.com | ymiroofing.com.au`;

    const user = `Write a ${form.type.replace(/_/g, " ")} email.
Customer name: ${form.customerName}
Context/Details: ${form.context || "standard situation"}
Tone: ${form.tone}`;

    generateMutation.mutate({
      provider: "claude",
      systemPrompt: system,
      userPrompt: user,
    });
  }, [form, generateMutation]);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 8,
    padding: "10px 13px",
    fontSize: 13,
    color: "var(--text-primary)",
    fontFamily: "inherit",
    outline: "none",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="lg:col-span-1 space-y-4"
      >
        <div className="surface-level-1 p-5">
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-5">
            <strong className="text-[var(--text-primary)]">How to use:</strong>{" "}
            Pick an email type, add the customer name and any relevant context.
            The AI writes a ready-to-send email in Ben&apos;s voice.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email Type *">
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                style={inputStyle}
              >
                {EMAIL_TYPES.map((t) => (
                  <option key={t.val} value={t.val}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Customer Name *">
              <input
                value={form.customerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerName: e.target.value }))
                }
                placeholder="e.g. John Smith"
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Context / Details">
            <textarea
              value={form.context}
              onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
              rows={4}
              placeholder="e.g. Quoted $3,200 for re-bedding last Tuesday, sent quote but no reply yet. Job was in Croydon."
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
          </Field>

          {error && (
            <div className="text-red-400 text-[12px] mb-3">{error}</div>
          )}

          <button
            onClick={generate}
            disabled={generateMutation.isPending}
            className="btn-primary w-full justify-center"
          >
            {generateMutation.isPending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            Write Email
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="lg:col-span-2"
      >
        {generateMutation.isPending && (
          <div className="surface-level-1 p-8 text-center">
            <div
              className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-3"
              style={{
                borderColor: "rgba(59, 130, 246, 0.2)",
                borderTopColor: "var(--accent-blue)",
              }}
            />
            <p className="text-[13px] text-[var(--text-secondary)]">
              Writing your email...
            </p>
          </div>
        )}
        <OutputStage
          text={result}
          label="Email Draft — Copy into Outlook"
          toolType="email"
        />
      </motion.div>
    </div>
  );
}
