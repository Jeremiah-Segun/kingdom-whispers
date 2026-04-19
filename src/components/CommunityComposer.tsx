import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const MAX_LEN = 500;

const CommunityComposer = ({ displayName, onPosted }: { displayName?: string; onPosted?: () => void }) => {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const trimmed = body.trim();
    if (!user || !trimmed) return;
    if (trimmed.length > MAX_LEN) {
      toast.error(`Keep it under ${MAX_LEN} characters`);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("posts").insert({ user_id: user.id, body: trimmed });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't share your post");
      return;
    }
    setBody("");
    onPosted?.();
  };

  const initial = (displayName?.[0] ?? "·").toUpperCase();

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <span className="text-xs font-heading font-bold text-primary">{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX_LEN))}
            placeholder="What's on your mind?"
            rows={2}
            className="w-full resize-none bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-[10px] text-muted-foreground font-body">
              {body.length}/{MAX_LEN}
            </span>
            <button
              onClick={submit}
              disabled={!body.trim() || submitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-body font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityComposer;
