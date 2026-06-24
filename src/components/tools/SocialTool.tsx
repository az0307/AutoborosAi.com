import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Field from "@/components/shared/Field";
import OutputStage from "@/components/shared/OutputStage";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useLocalHistory } from "@/hooks/useLocalHistory";

const TONES = ["professional", "friendly/casual", "bold/confident", "local/community"];
const JOB_TYPES = [
  "New Roof Tiling",
  "Re-Bedding & Re-Pointing",
  "Roof Repairs",
  "Tile Replacement",
  "Ridge Capping",
  "Roof Inspection",
];

export default function SocialTool() {
  const [form, setForm] = useState({
    jobType: "",
    suburb: "",
    tileType: "",
    extra: "",
    tone: "professional",
  });
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const { isAuthenticated } = useAuth();
  const localHistory = useLocalHistory();
  const generateMutation = trpc.ai.generate.useMutation({
    onSuccess: (data) => {
      setResult(data.text);
      const title = `${form.jobType} in ${form.suburb}`;
      if (isAuthenticated) {
        // Will be saved via tRPC
      }
      localHistory.save({
        toolType: "social",
        title,
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
    if (!form.jobType || !form.suburb) {
      setError("Job type and suburb are required.");
      return;
    }
    setError("");
    setResult("");

    const system = `You are a social media copywriter for Y.M.I Roofing, a Melbourne roof tiling business run by Ben Breheny. 
Ben has 20+ years experience, 100% workmanship guarantee, and is known for turning up on time and doing the job right the first time.
Write exactly 3 Instagram/Facebook caption options. Each must:
- Be punchy and human-sounding (not corporate)
- Include 1-2 relevant hashtags inline or at the end
- Be under 150 words
- Have a clear call-to-action (call, DM, or visit website)
- Reflect the ${form.tone} tone
Number them 1. 2. 3. and separate with a blank line.`;

    const user = `Job completed today:
- Service: ${form.jobType}
- Suburb: ${form.suburb}
- Tile type: ${form.tileType || "standard concrete tiles"}
- Extra details: ${form.extra || "standard job, client happy"}

Write 3 caption options for the before/after photos from this job.`;

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
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Panel */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="lg:col-span-1 space-y-4"
      >
        <div className="surface-level-1 p-5">
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-5">
            <strong className="text-[var(--text-primary)]">How to use:</strong>{" "}
            After a job, fill in the details below. The AI writes 3 ready-to-post
            Instagram/Facebook captions. Copy the one you like, post with your
            before/after photo. Done.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Job Type *">
              <select
                value={form.jobType}
                onChange={(e) => setForm((f) => ({ ...f, jobType: e.target.value }))}
                style={inputStyle}
              >
                <option value="">Select job type...</option>
                {JOB_TYPES.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Suburb *">
              <input
                value={form.suburb}
                onChange={(e) => setForm((f) => ({ ...f, suburb: e.target.value }))}
                placeholder="e.g. Croydon"
                style={inputStyle}
              />
            </Field>
            <Field label="Tile Type">
              <input
                value={form.tileType}
                onChange={(e) => setForm((f) => ({ ...f, tileType: e.target.value }))}
                placeholder="e.g. terracotta, concrete, slate"
                style={inputStyle}
              />
            </Field>
            <Field label="Tone">
              <select
                value={form.tone}
                onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
                style={inputStyle}
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Extra Details (optional)">
            <input
              value={form.extra}
              onChange={(e) => setForm((f) => ({ ...f, extra: e.target.value }))}
              placeholder="e.g. 30-year-old home, tricky access, client loved the result"
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
            Generate 3 Captions
          </button>
        </div>
      </motion.div>

      {/* Output Stage */}
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
              AI is crafting your captions...
            </p>
          </div>
        )}
        <OutputStage
          text={result}
          label="3 Caption Options — Pick Your Favourite"
          toolType="social"
        />
      </motion.div>
    </div>
  );
}
