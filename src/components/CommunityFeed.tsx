import { motion } from "framer-motion";
import { Heart, MessageCircle, Users } from "lucide-react";

const activities = [
  { name: "Sarah", action: "is on Day 12 of the Peace Plan", avatar: "S", time: "2h ago" },
  { name: "David", action: "shared a testimony", avatar: "D", time: "4h ago" },
  { name: "Grace", action: "highlighted Psalm 23:4", avatar: "G", time: "5h ago" },
  { name: "John", action: "is on Day 5 of the Purpose Plan", avatar: "J", time: "6h ago" },
];

const questions = [
  { author: "Rebecca", question: "How do you find peace in seasons of waiting?", amens: 24, replies: 8 },
  { author: "Michael", question: "What verse carries you through difficult mornings?", amens: 31, replies: 12 },
];

const CommunityFeed = () => (
  <div className="min-h-screen bg-background pb-24">
    <div className="px-6 pt-8 pb-4">
      <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase font-body">The Global Family</p>
      <h1 className="font-heading text-3xl font-light text-foreground mt-1">Community</h1>
    </div>

    <div className="px-6 space-y-5">
      {/* Friend Activity */}
      <div>
        <h3 className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Friend Activity</h3>
        <div className="space-y-2">
          {activities.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 rounded-xl bg-card p-4 border border-border"
            >
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-heading text-lg">
                {a.avatar}
              </div>
              <div className="flex-1">
                <p className="font-body text-sm text-foreground">
                  <span className="font-semibold">{a.name}</span> {a.action}
                </p>
                <p className="text-xs text-muted-foreground">{a.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Kingdom Opinions */}
      <div>
        <h3 className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Kingdom Opinions</h3>
        <div className="space-y-3">
          {questions.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="rounded-2xl bg-card p-5 border border-border"
            >
              <p className="font-body text-sm text-foreground mb-3">{q.question}</p>
              <p className="text-xs text-muted-foreground font-body mb-3">— {q.author}</p>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-xs text-gold font-body font-medium hover:text-gold-glow transition-colors">
                  <Heart className="w-3.5 h-3.5" /> I Prayed · {q.amens}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-ether font-body font-medium hover:text-ether-light transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" /> Amen · {q.replies}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <button className="flex-1 rounded-xl bg-primary text-primary-foreground py-3.5 font-body font-medium text-sm text-center shadow-golden">
          <Users className="w-4 h-4 inline mr-2" />Share Testimony
        </button>
        <button className="flex-1 rounded-xl bg-card text-foreground py-3.5 font-body font-medium text-sm text-center border border-border hover:border-gold/30 transition-colors">
          Join Conversation
        </button>
      </div>
    </div>
  </div>
);

export default CommunityFeed;
