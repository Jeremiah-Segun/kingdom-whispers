import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterCardProps {
  onOpen: () => void;
}

const NewsletterCard = ({ onOpen }: NewsletterCardProps) => {
  const [latest, setLatest] = useState<{ title: string; summary: string | null } | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    (async () => {
      const [{ data }, { count: c }] = await Promise.all([
        supabase
          .from("newsletters")
          .select("title, summary")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("newsletters")
          .select("id", { count: "exact", head: true })
          .eq("is_published", true),
      ]);
      if (data) setLatest(data);
      setCount(c ?? 0);
    })();
  }, []);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className="w-full text-left rounded-2xl bg-gradient-to-br from-accent/15 via-card to-card border border-accent/15 p-4 hover:border-accent/30 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] tracking-[0.18em] uppercase text-accent font-body font-semibold">
            Newsletter {count > 0 ? `· ${count} issues` : ""}
          </p>
          <p className="font-heading text-sm font-semibold text-foreground truncate">
            {latest?.title ?? "New letters every week"}
          </p>
          {latest?.summary && (
            <p className="text-[11px] text-muted-foreground font-body line-clamp-1 mt-0.5">{latest.summary}</p>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
      </div>
    </motion.button>
  );
};

export default NewsletterCard;
