import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Field from "@/components/shared/Field";
import OutputStage from "@/components/shared/OutputStage";
import { trpc } from "@/providers/trpc";
import { useLocalHistory } from "@/hooks/useLocalHistory";

const SERVICES = [
  "New Roof Tiling",
  "Re-Bedding & Re-Pointing",
  "Roof Repairs",
  "Tile Replacement",
  "Ridge Capping",
  "Roof Inspection",
];
const ACCESS = [
  "standard",
  "single-storey easy access",
  "two-storey",
  "steep pitch",
  "very difficult access",
];

export default function QuoteTool() {
  const [form, setForm] = useState({
    service: "",
    tileType: "",
    area: "",
    suburb: "",
    access: "standard",
    condition: "",
    extras: "",
  });
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const localHistory = useLocalHistory();
  const generateMutation = trpc.ai.generate.useMutation({
    onSuccess: (data) => {
      setResult(data.text);
      localHistory.save({
        toolType: "quote",
        title: `Quote: ${form.service} — ${form.suburb}`,
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
    if (!form.service || !form.suburb) {
      setError("Service and suburb are required.");
      return;
    }
    setError("");
    setResult("");

    const system = `You are an expert quoting assistant for Y.M.I Roofing, a Melbourne roof tiling business.
Ben Breheny has 20+ years experience and provides 100% guaranteed workmanship.
Generate a professional, structured quote DRAFT for Ben to review and adjust.
Include:
1. A brief scope of works description
2. Key line items with estimated hours/materials where relevant  
3. A realistic price range (not exact — Ben will firm up on inspection)
4. Important notes/caveats
5. Terms: payment on completion, free quote, written guarantee

Use Australian English. Be concise and professional. This is a draft starting point, not a final quote.
Format clearly with sections. Do NOT invent specific prices you aren't confident in — use ranges.`;

    const user = `Quote request:
Service: ${form.service}
Tile type: ${form.tileType || "to be confirmed on inspection"}
Approximate area: ${form.area ? form.area + " m²" : "to be confirmed on inspection"}
Suburb: ${form.suburb}
Roof access: ${form.access}
Current condition: ${form.condition || "to be confirmed on inspection"}
Additional work: ${form.extras || "none specified"}

Generate a draft quote for Ben to review and send to the client.`;

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
            Fill in what you know from the initial enquiry. The AI drafts a
            structured quote for you to review, adjust, and send. Saves 20-30
            min per quote.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Service *">
              <select
                value={form.service}
                onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                style={inputStyle}
              >
                <option value="">Select service...</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Suburb *">
              <input
                value={form.suburb}
                onChange={(e) => setForm((f) => ({ ...f, suburb: e.target.value }))}
                placeholder="e.g. Ringwood"
                style={inputStyle}
              />
            </Field>
            <Field label="Tile Type">
              <input
                value={form.tileType}
                onChange={(e) => setForm((f) => ({ ...f, tileType: e.target.value }))}
                placeholder="e.g. concrete, terracotta, slate"
                style={inputStyle}
              />
            </Field>
            <Field label="Approximate Area (m²)">
              <input
                type="number"
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                placeholder="e.g. 180"
                style={inputStyle}
              />
            </Field>
            <Field label="Roof Access">
              <select
                value={form.access}
                onChange={(e) => setForm((f) => ({ ...f, access: e.target.value }))}
                style={inputStyle}
              >
                {ACCESS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Current Condition">
              <input
                value={form.condition}
                onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
                placeholder="e.g. 30yr old, multiple broken tiles"
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Additional Works / Notes">
            <input
              value={form.extras}
              onChange={(e) => setForm((f) => ({ ...f, extras: e.target.value }))}
              placeholder="e.g. replace guttering, gutter guard, barge capping"
              style={inputStyle}
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
            Draft Quote
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
              Drafting your quote...
            </p>
          </div>
        )}
        <OutputStage
          text={result}
          label="Draft Quote — Review & Adjust Before Sending"
          toolType="quote"
        />
      </motion.div>
    </div>
  );
}
