import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Newsletter {
  id: string;
  title: string;
  summary: string | null;
  body: string;
  cover_url: string | null;
  published_at: string | null;
}

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const NewsletterList = ({ onBack }: { onBack: () => void }) => {
  const [items, setItems] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Newsletter | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("newsletters")
        .select("id, title, summary, body, cover_url, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(50);
      setItems((data ?? []) as Newsletter[]);
      setLoading(false);
    })();
  }, []);

  if (active) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-14 pb-4">
          <button
            onClick={() => setActive(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-body">Back to Newsletter</span>
          </button>
          <p className="text-[10px] tracking-[0.2em] uppercase text-primary font-body font-semibold mb-2">
            Newsletter · {formatDate(active.published_at)}
          </p>
          <h1 className="font-heading text-2xl font-bold text-foreground leading-tight">{active.title}</h1>
        </div>
        {active.cover_url && (
          <div className="px-5 mb-4">
            <img src={active.cover_url} alt="" className="w-full rounded-xl object-cover max-h-56" />
          </div>
        )}
        <article className="px-5 prose prose-sm max-w-none">
          {active.body.split(/\n\n+/).map((para, i) => (
            <p key={i} className="text-sm font-body text-foreground/90 leading-relaxed mb-4 whitespace-pre-line">
              {para}
            </p>
          ))}
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-body">Back to Discover</span>
        </button>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Newsletter</h1>
        </div>
        <p className="text-xs text-muted-foreground font-body">Reflections, letters, and updates from the editors.</p>
      </div>

      <div className="px-5 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground font-body py-12">No newsletters yet.</p>
        ) : (
          items.map((n, i) => (
            <motion.button
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setActive(n)}
              className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-body">{formatDate(n.published_at)}</span>
              </div>
              <h3 className="font-heading text-base font-semibold text-foreground leading-snug">{n.title}</h3>
              {n.summary && (
                <p className="text-xs text-muted-foreground font-body mt-1.5 line-clamp-2">{n.summary}</p>
              )}
              <span className="inline-block text-[10px] text-primary font-body font-medium mt-3">Read →</span>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsletterList;
