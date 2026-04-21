import { motion } from "framer-motion";
import { useState } from "react";
import { Users, ChevronRight, CheckCircle2 } from "lucide-react";
import { plans } from "@/lib/verses";

const subTabs = ["My Plans", "Find Plans", "Saved", "Completed"];

const PlansTab = () => {
  const [activeTab, setActiveTab] = useState("My Plans");
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const filteredPlans =
    activeTab === "Completed"
      ? plans.filter((p) => p.completedDays === p.days)
      : activeTab === "My Plans"
        ? plans.filter((p) => p.completedDays > 0 && p.completedDays < p.days)
        : activeTab === "Saved"
          ? plans.filter((_, i) => i % 2 === 0)
          : plans;

  const toggleExpand = (id: string) => {
    setExpandedPlan(expandedPlan === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-safe pb-2">
        <h1 className="font-heading text-2xl font-bold text-foreground">Plans</h1>
        <p className="text-xs text-muted-foreground font-body mt-1">Grow deeper in your faith journey</p>
      </div>

      {/* Sub-tabs */}
      <div className="px-5 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-body font-medium whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Plan list */}
      <div className="px-5 space-y-3 mt-2">
        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm font-body">No plans in this category yet.</p>
          </div>
        )}
        {filteredPlans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <button
              onClick={() => toggleExpand(plan.id)}
              className="w-full flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors text-left"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center text-2xl shrink-0">
                {plan.image}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-sm font-semibold text-foreground truncate">{plan.title}</h3>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${
                    expandedPlan === plan.id ? "rotate-90" : ""
                  }`} />
                </div>
                <p className="text-xs text-muted-foreground font-body mt-0.5 line-clamp-2">{plan.description}</p>

                <div className="flex items-center gap-3 mt-2">
                  {plan.completedDays > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(plan.completedDays / plan.days) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-body">
                        {plan.completedDays}/{plan.days}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span className="text-[10px] font-body">{(plan.participants / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded content */}
            {expandedPlan === plan.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mx-4 mt-1 mb-2 p-4 rounded-lg bg-secondary/50 border border-border"
              >
                <p className="text-xs text-muted-foreground font-body mb-3">{plan.description}</p>
                {/* Day-by-day progress */}
                <div className="space-y-2">
                  {Array.from({ length: Math.min(plan.days, 7) }).map((_, dayIdx) => (
                    <div key={dayIdx} className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          dayIdx < plan.completedDays ? "text-primary" : "text-muted"
                        }`}
                        fill={dayIdx < plan.completedDays ? "currentColor" : "none"}
                      />
                      <span className={`text-xs font-body ${
                        dayIdx < plan.completedDays ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        Day {dayIdx + 1}
                      </span>
                    </div>
                  ))}
                  {plan.days > 7 && (
                    <p className="text-[10px] text-muted-foreground font-body pl-6">
                      +{plan.days - 7} more days
                    </p>
                  )}
                </div>
                <button className="mt-3 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-body font-semibold">
                  {plan.completedDays > 0 ? "Continue Plan" : "Start Plan"}
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlansTab;
