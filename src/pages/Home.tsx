import { useState, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import BlueprintBackground from "@/components/layout/BlueprintBackground";
import Header from "@/components/layout/Header";
import HistorySidebar from "@/components/shared/HistorySidebar";

const SocialTool = lazy(() => import("@/components/tools/SocialTool"));
const QuoteTool = lazy(() => import("@/components/tools/QuoteTool"));
const EmailTool = lazy(() => import("@/components/tools/EmailTool"));
const ReportTool = lazy(() => import("@/components/tools/ReportTool"));
const OpportunityMap = lazy(() => import("@/components/tools/OpportunityMap"));

const TABS = [
  { id: "social", label: "Social Content" },
  { id: "quote", label: "Quote Estimator" },
  { id: "email", label: "Email Writer" },
  { id: "report", label: "Monthly Report" },
  { id: "opps", label: "Automations" },
] as const;

function TabFallback() {
  return (
    <div className="surface-level-1 p-12 text-center">
      <div
        className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-3"
        style={{
          borderColor: "rgba(59, 130, 246, 0.2)",
          borderTopColor: "var(--accent-blue)",
        }}
      />
      <p className="text-[13px] text-[var(--text-secondary)]">Loading...</p>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("social");
  const [historyOpen, setHistoryOpen] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case "social":
        return <SocialTool />;
      case "quote":
        return <QuoteTool />;
      case "email":
        return <EmailTool />;
      case "report":
        return <ReportTool />;
      case "opps":
        return <OpportunityMap />;
      default:
        return <SocialTool />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <BlueprintBackground />
      <Header onHistoryToggle={() => setHistoryOpen(!historyOpen)} />
      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={(_text) => {
          // Could restore to output stage
          setHistoryOpen(false);
        }}
      />

      {/* Main Content */}
      <main className="relative z-10 pt-14">
        {/* Tab Navigation */}
        <div
          className="sticky top-14 z-20 px-5"
          style={{
            background: "rgba(9, 9, 11, 0.9)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div className="max-w-[1200px] mx-auto flex gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-4 py-3 text-[12px] font-semibold whitespace-nowrap transition-colors"
                style={{
                  color:
                    activeTab === tab.id
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  borderBottom:
                    activeTab === tab.id
                      ? "2px solid var(--accent-blue)"
                      : "2px solid transparent",
                }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: "var(--accent-blue)" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-[1200px] mx-auto px-5 py-6">
          <Suspense fallback={<TabFallback />}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderTab()}
            </motion.div>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
