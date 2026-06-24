import { X, Star, Trash2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalHistory } from "@/hooks/useLocalHistory";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

interface HistorySidebarProps {
  open: boolean;
  onClose: () => void;
  onSelect: (text: string) => void;
}

const TOOL_LABELS: Record<string, string> = {
  social: "Social Content",
  quote: "Quote Estimator",
  email: "Email Writer",
  report: "Monthly Report",
};

export default function HistorySidebar({
  open,
  onClose,
  onSelect,
}: HistorySidebarProps) {
  const { isAuthenticated } = useAuth();
  const localHistory = useLocalHistory();
  const { data: serverHistory } = trpc.generation.list.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  const items = isAuthenticated
    ? (serverHistory?.items.map((g) => ({
        id: String(g.id),
        timestamp: g.createdAt.toISOString(),
        toolType: g.toolType,
        title: g.title,
        outputText: g.outputText,
        isFavorite: g.isFavorite ?? false,
        promptData: g.promptData as Record<string, unknown>,
      })) ?? [])
    : localHistory.items;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 z-50 flex flex-col"
            style={{
              background: "var(--bg-surface)",
              borderLeft: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[var(--accent-blue)]" />
                <span className="text-sm font-semibold">History</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <X size={16} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-secondary)] text-xs">
                  No history yet.
                  <br />
                  Generate something to see it here.
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer rounded-lg p-3 transition-colors hover:bg-[var(--bg-elevated)]"
                    style={{ border: "1px solid var(--border-subtle)" }}
                    onClick={() => onSelect(item.outputText)}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-[var(--accent-blue)] uppercase tracking-wide">
                        {TOOL_LABELS[item.toolType] || item.toolType}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAuthenticated) {
                              // server toggle
                            } else {
                              localHistory.toggleFavorite(item.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-[var(--bg-surface)]"
                        >
                          <Star
                            size={12}
                            className={
                              item.isFavorite
                                ? "text-[var(--accent-green)] fill-[var(--accent-green)]"
                                : "text-[var(--text-secondary)]"
                            }
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAuthenticated) {
                              // server delete
                            } else {
                              localHistory.remove(item.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-[var(--bg-surface)]"
                        >
                          <Trash2
                            size={12}
                            className="text-[var(--text-secondary)] hover:text-red-400"
                          />
                        </button>
                      </div>
                    </div>
                    <p className="text-[12px] text-[var(--text-primary)] line-clamp-2 leading-relaxed">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1.5">
                      {new Date(item.timestamp).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
