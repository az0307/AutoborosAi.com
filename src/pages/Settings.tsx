import { useState } from "react";
import { ArrowLeft, Save, Key, FileText, Moon, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

const PROVIDERS = [
  { id: "claude" as const, label: "Claude (Anthropic)", placeholder: "sk-ant-api03-..." },
  { id: "openai" as const, label: "OpenAI", placeholder: "sk-..." },
  { id: "gemini" as const, label: "Google Gemini", placeholder: "AIza..." },
];

export default function Settings() {
  const { isAuthenticated } = useAuth();
  const [keys, setKeys] = useState<Record<string, string>>({
    claude: "",
    openai: "",
    gemini: "",
  });
  const [saved, setSaved] = useState(false);

  const upsertKey = trpc.apiKey.upsert.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSave = (provider: "claude" | "openai" | "gemini") => {
    const key = keys[provider].trim();
    if (!key) return;
    upsertKey.mutate({ provider, apiKey: key });
  };

  return (
    <div
      className="min-h-screen pt-20 pb-12 px-5"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-[600px] mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to Command Center
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="font-brand text-[22px] font-bold mb-6">Settings</h1>

          {/* API Keys */}
          <div className="surface-level-1 p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Key size={16} className="text-[var(--accent-blue)]" />
              <h2 className="text-[14px] font-semibold">API Keys</h2>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] mb-4">
              Add your AI provider API keys. Keys are encrypted and stored
              securely. At least one key is required for the AI tools to work.
            </p>

            {!isAuthenticated && (
              <div
                className="mb-4 p-3 rounded-lg text-[12px]"
                style={{
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  color: "#F59E0B",
                }}
              >
                Sign in to save API keys securely to your account. As a guest,
                keys are only stored in memory for this session.
              </div>
            )}

            <div className="space-y-4">
              {PROVIDERS.map((p) => (
                <div key={p.id}>
                  <label className="block text-[11px] font-medium tracking-[0.04em] text-[var(--text-secondary)] uppercase mb-2">
                    {p.label}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={keys[p.id]}
                      onChange={(e) =>
                        setKeys((k) => ({ ...k, [p.id]: e.target.value }))
                      }
                      placeholder={p.placeholder}
                      className="flex-1 surface-level-2 px-3 py-2.5 text-[13px]"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 8,
                        color: "var(--text-primary)",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={() => handleSave(p.id)}
                      disabled={!keys[p.id].trim() || upsertKey.isPending}
                      className="btn-primary"
                    >
                      {saved ? (
                        <CheckCircle size={14} />
                      ) : (
                        <Save size={14} />
                      )}
                      {saved ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Preferences */}
          <div className="surface-level-1 p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-[var(--accent-blue)]" />
              <h2 className="text-[14px] font-semibold">Export Defaults</h2>
            </div>
            <div className="flex gap-3">
              {["pdf", "json", "text"].map((fmt) => (
                <button
                  key={fmt}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium capitalize transition-colors"
                  style={{
                    background:
                      fmt === "pdf"
                        ? "var(--accent-blue-dim)"
                        : "transparent",
                    color:
                      fmt === "pdf"
                        ? "var(--accent-blue)"
                        : "var(--text-secondary)",
                    border: `1px solid ${
                      fmt === "pdf"
                        ? "var(--accent-blue)"
                        : "var(--border-subtle)"
                    }`,
                  }}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Appearance */}
          <div className="surface-level-1 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Moon size={16} className="text-[var(--accent-blue)]" />
              <h2 className="text-[14px] font-semibold">Appearance</h2>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[var(--text-secondary)]">
                Theme
              </span>
              <span className="text-[12px] px-3 py-1.5 rounded-lg font-medium" style={{ background: "var(--accent-blue-dim)", color: "var(--accent-blue)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                Dark
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
