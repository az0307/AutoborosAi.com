import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const LEVERAGE_POINTS = [
  {
    rank: 1,
    name: "Missed Call Text-Back",
    mechanism: "Bottleneck Removal",
    effort: "2 hrs (n8n + Twilio)",
    ratio: "25:1",
    small: "One n8n workflow wired to Twilio's callStatus webhook. Runs forever.",
    big: "Ben misses ~30% of calls on the roof. First to respond wins. This makes him always first.",
    impact: "Capture an extra 3-5 jobs/month that currently go to competitors",
    file: "n8n-missed-call.json ✅ Built",
  },
  {
    rank: 2,
    name: "Social Content Engine",
    mechanism: "Force Multiplier",
    effort: "Built (this tool)",
    ratio: "20:1",
    small: "Ben types 3 fields. Claude writes 3 captions. One minute per post.",
    big: "Every job becomes a marketing asset. 4 posts/week = 200+ posts/year with zero writing effort.",
    impact: "Instagram/Facebook presence that builds trust and generates inbound enquiries",
    file: "Social Content tab ✅ This tool",
  },
  {
    rank: 3,
    name: "Maintenance Reminder Campaign",
    mechanism: "Compounding Return",
    effort: "3 hrs (n8n scheduled)",
    ratio: "30:1",
    small: "Annual SMS to every past client. Spring timing = storm preparation hook.",
    big: "Past clients are the warmest possible leads — they already trust Ben. 10-20% re-engagement rate.",
    impact: "5-10 re-engagement jobs per campaign × $1,500 avg = $7,500-$15,000 per year",
    file: "n8n-maintenance-reminder.json ✅ Built",
  },
];

const OPPORTUNITIES = [
  {
    name: "Scale to 5 Melbourne Trades Clients",
    type: "Business Model",
    priority: "HIGH",
    timeline: "90 days",
    revenue: "$1,750/mo",
    effort: "60 hrs total",
    desc: "Each client uses the same Aurora Trades Stack. Plumber, electrician, painter, landscaper are immediate targets. Client 2 takes 12hrs vs 40hrs for Client 1.",
    win: "Second client revenue covers all agency running costs. Everything after is profit.",
  },
  {
    name: "Google Ads Management Add-On",
    type: "Product",
    priority: "HIGH",
    timeline: "60 days",
    revenue: "$150-300/mo per client",
    effort: "2 hrs/mo per client",
    desc: "Ben spends $500-1,000/mo on Google Ads (or should be). Aurora manages the campaign for $150-300/mo. The website is already conversion-optimised.",
    win: "Ads work 3× better with Aurora's site vs a generic one. Easy proof of value.",
  },
  {
    name: "Jobber + Twilio Affiliate Revenue",
    type: "Partnership",
    priority: "MED",
    timeline: "30 days",
    revenue: "Recurring commission per referral",
    effort: "< 1 hr",
    desc: "Sign up for Jobber affiliate program. Add affiliate link to all client handovers. Same for Twilio. Each referral earns recurring commission.",
    win: "Passive income layer on top of retainers. Zero ongoing effort.",
  },
  {
    name: "Aurora Roofer Stack SaaS",
    type: "Product Platform",
    priority: "MED",
    timeline: "6 months",
    revenue: "$49-99/mo × N roofing companies",
    effort: "80 hrs to productise",
    desc: "Package the entire YMI Roofing stack as a self-serve product for roofing companies nationally. Website + automations + chatbot in a box. RooferClaw charges $200+/mo. Aurora charges $79/mo.",
    win: "AU tiling market is massively underserved by current platforms (all US-focused). First mover advantage.",
  },
  {
    name: "Seasonal Storm Campaign",
    type: "Product",
    priority: "MED",
    timeline: "Next storm season",
    revenue: "Included in Blaze tier",
    effort: "2 hrs to build",
    desc: "n8n workflow: when BOM issues storm warning for Melbourne → SMS goes to all past clients in affected suburbs offering free post-storm inspection. Hyper-relevant, perfectly timed.",
    win: "Storm damage is the single highest-urgency roofing trigger. Being first to offer inspection = jobs.",
  },
  {
    name: "Content → GBP Auto-Poster",
    type: "Technology",
    priority: "LOW",
    timeline: "Month 3",
    revenue: "Included in Blaze tier",
    effort: "3 hrs (n8n + Meta API)",
    desc: "When Ben approves a caption in the Social Content tool, n8n auto-posts to Facebook + Instagram AND uploads the same post to Google Business Profile. One approval = 3 platforms.",
    win: "GBP posts directly boost local search ranking. Most tilers never post to GBP.",
  },
];

const P_COLORS: Record<string, string> = {
  HIGH: "#10B981",
  MED: "#F59E0B",
  LOW: "#6B7280",
};

const T_COLORS: Record<string, string> = {
  "Business Model": "#3B82F6",
  Product: "#8B5CF6",
  Partnership: "#10B981",
  Technology: "#F59E0B",
  "Product Platform": "#EC4899",
};

export default function OpportunityMap() {
  return (
    <div className="space-y-8">
      {/* Leverage Points */}
      <div>
        <h3 className="text-[11px] font-bold tracking-[0.16em] text-[var(--accent-blue)] uppercase mb-4">
          Top 3 Leverage Points
        </h3>
        <div className="space-y-3">
          {LEVERAGE_POINTS.map((lp) => (
            <motion.div
              key={lp.rank}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: lp.rank * 0.08 }}
              className="surface-level-1 p-5"
              style={{ borderLeft: "3px solid #F59E0B" }}
            >
              <div className="flex gap-3 items-start mb-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold"
                  style={{ background: "#F59E0B", color: "#09090B" }}
                >
                  {lp.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-[var(--text-primary)] mb-1.5">
                    {lp.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                      {lp.mechanism}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono-data" style={{ background: "rgba(161, 161, 170, 0.1)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                      {lp.effort}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono-data" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--accent-green)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                      {lp.ratio} leverage
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
                <div className="rounded-lg p-3" style={{ background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
                  <div className="text-[9px] uppercase tracking-[0.1em] text-[var(--accent-green)] mb-1">Small Effort</div>
                  <div className="text-[12px] text-[var(--text-secondary)]">{lp.small}</div>
                </div>
                <div className="rounded-lg p-3" style={{ background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.15)" }}>
                  <div className="text-[9px] uppercase tracking-[0.1em] text-[#F59E0B] mb-1">Big Result</div>
                  <div className="text-[12px] text-[var(--text-secondary)]">{lp.big}</div>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-[12px] text-[var(--text-primary)]">→ {lp.impact}</div>
                <div className="text-[11px] text-[var(--accent-green)] font-mono-data">{lp.file}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Opportunities */}
      <div>
        <h3 className="text-[11px] font-bold tracking-[0.16em] text-[var(--accent-blue)] uppercase mb-4">
          Opportunity Map
        </h3>
        <div className="space-y-2.5">
          {OPPORTUNITIES.map((opp, i) => (
            <motion.div
              key={opp.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.3 + i * 0.06 }}
              className="surface-level-1 p-4"
            >
              <div className="flex gap-3 items-start mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-[var(--text-primary)] mb-2">
                    {opp.name}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{
                        background: `${P_COLORS[opp.priority]}22`,
                        color: P_COLORS[opp.priority],
                        border: `1px solid ${P_COLORS[opp.priority]}44`,
                      }}
                    >
                      {opp.priority}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{
                        background: `${T_COLORS[opp.type] || "#3B82F6"}22`,
                        color: T_COLORS[opp.type] || "#3B82F6",
                        border: `1px solid ${(T_COLORS[opp.type] || "#3B82F6")}44`,
                      }}
                    >
                      {opp.type}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono-data" style={{ background: "rgba(161, 161, 170, 0.1)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                      {opp.timeline}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[14px] font-bold text-[var(--accent-green)] font-mono-data">
                    {opp.revenue}
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)]">{opp.effort}</div>
                </div>
              </div>
              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed mb-1.5">
                {opp.desc}
              </p>
              <div className="flex items-center gap-1.5 text-[12px] text-[#F59E0B]">
                <Zap size={12} />
                {opp.win}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
