import { motion } from "framer-motion";
import { useState } from "react";
import { Users } from "lucide-react";
import { plans } from "@/lib/verses";

const subTabs = ["My Plans", "Find Plans", "Saved", "Completed"];

const PlansTab = () => {
  const [activeTab, setActiveTab] = useState("My Plans");

  const filteredPlans =
    activeTab === "Completed"
      ? plans.filter((p) => p.completedDays === p.days)
      : activeTab === "My Plans"
        ? plans.filter((p) => p.completedDays > 0 && p.completedDays < p.days)
        : plans;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-2">
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
        {filteredPlans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center text-2xl shrink-0">
              {plan.image}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-sm font-semibold text-foreground truncate">{plan.title}</h3>
              <p className="text-xs text-muted-foreground font-body mt-0.5 line-clamp-2">{plan.description}</p>

              <div className="flex items-center gap-3 mt-2">
                {/* Progress */}
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

                {/* Participants */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span className="text-[10px] font-body">{(plan.participants / 1000).toFixed(1)}k</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlansTab;
