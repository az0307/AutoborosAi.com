import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Field from "@/components/shared/Field";
import OutputStage from "@/components/shared/OutputStage";
import { trpc } from "@/providers/trpc";
import { useLocalHistory } from "@/hooks/useLocalHistory";

const METRICS = [
  { key: "leads", label: "Website Leads", placeholder: "e.g. 7" },
  { key: "reviewRequests", label: "Review Requests Sent", placeholder: "e.g. 12" },
  { key: "reviewsReceived", label: "Reviews Received", placeholder: "e.g. 4" },
  { key: "missedCalls", label: "Missed Calls Caught", placeholder: "e.g. 3" },
  { key: "textBacks", label: "Text-Backs Sent", placeholder: "e.g. 3" },
  { key: "chatbotConvos", label: "Chatbot Conversations", placeholder: "e.g. 15" },
  { key: "websiteViews", label: "Website Visitors", placeholder: "e.g. 180" },
  { key: "newReviews", label: "New Google Reviews", placeholder: "e.g. 2" },
];

export default function ReportTool() {
  const [data, setData] = useState({
    month: new Date().toLocaleString("en-AU", { month: "long", year: "numeric" }),
    leads: "",
    reviewRequests: "",
    reviewsReceived: "",
    missedCalls: "",
    textBacks: "",
    chatbotConvos: "",
    websiteViews: "",
    newReviews: "",
    retainer: "350",
  });
  const [result, setResult] = useState("");

  const localHistory = useLocalHistory();
  const generateMutation = trpc.ai.generate.useMutation({
    onSuccess: (res) => {
      setResult(res.text);
      localHistory.save({
        toolType: "report",
        title: `Monthly Report — ${data.month}`,
        outputText: res.text,
        promptData: { ...data },
      });
    },
    onError: () => {
      setResult("Error generating report — check API connection.");
    },
  });

  const totalLeads =
    (parseInt(data.leads) || 0) +
    (parseInt(data.chatbotConvos) || 0) +
    (parseInt(data.missedCalls) || 0);
  const estimatedJobs = Math.floor(totalLeads * 0.3);
  const estimatedValue = estimatedJobs * 1800;

  const generate = useCallback(() => {
    setResult("");

    const system = `You are Aurora AI Agency writing a monthly performance report for YMI Roofing client Ben Breheny.
Be concise, positive, and specific. Show the value delivered. Use bullet points.
Include: what was delivered, key numbers, what this means in plain English (e.g. "3 leads from chatbot = ~$X in potential jobs"), and what's coming next month.
Keep total length under 400 words. Warm but professional tone.`;

    const user = `Monthly report for ${data.month}:
- Website enquiry leads: ${data.leads || 0}
- Review requests sent: ${data.reviewRequests || 0}
- Reviews received: ${data.reviewsReceived || 0}
- Missed calls intercepted (text-back sent): ${data.missedCalls || 0}
- Chatbot conversations: ${data.chatbotConvos || 0}
- Website visitors (approx): ${data.websiteViews || "not tracked yet"}
- New Google reviews this month: ${data.newReviews || 0}
- Monthly retainer: $${data.retainer}

Write the monthly value report email from Aurora AI Agency to Ben.`;

    generateMutation.mutate({
      provider: "claude",
      systemPrompt: system,
      userPrompt: user,
    });
  }, [data, generateMutation]);

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
    <div className="space-y-6">
      {/* Metric Cards */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          ["Total Leads", totalLeads, "var(--accent-blue)"],
          ["Est. Jobs Won (~30%)", estimatedJobs, "var(--accent-green)"],
          ["Est. Revenue", `$${estimatedValue.toLocaleString()}`, "#F59E0B"],
        ].map(([label, val, color]) => (
          <div key={label as string} className="surface-level-4 p-5 text-center">
            <div
              className="font-mono-data text-[26px] font-bold"
              style={{ color: color as string }}
            >
              {val as string}
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-1 tracking-wide uppercase">
              {label as string}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="surface-level-1 p-5"
      >
        <Field label="Reporting Month">
          <input
            value={data.month}
            onChange={(e) => setData((d) => ({ ...d, month: e.target.value }))}
            style={inputStyle}
          />
        </Field>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {METRICS.map((m) => (
            <div key={m.key}>
              <label className="block text-[11px] font-medium tracking-[0.04em] text-[var(--text-secondary)] uppercase mb-2">
                {m.label}
              </label>
              <input
                type="number"
                value={data[m.key as keyof typeof data]}
                onChange={(e) =>
                  setData((d) => ({ ...d, [m.key]: e.target.value }))
                }
                placeholder={m.placeholder}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        <button
          onClick={generate}
          disabled={generateMutation.isPending}
          className="btn-primary"
        >
          {generateMutation.isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          Generate Report Email
        </button>
      </motion.div>

      {/* Output */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
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
              Generating your report...
            </p>
          </div>
        )}
        <OutputStage
          text={result}
          label="Monthly Report — Send to Ben"
          toolType="report"
        />
      </motion.div>
    </div>
  );
}
