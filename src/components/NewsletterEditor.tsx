import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2, Eye, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Newsletter {
  id: string;
  title: string;
  summary: string | null;
  body: string;
  cover_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const NewsletterEditor = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Newsletter | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("newsletters")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as Newsletter[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setTitle(""); setSummary(""); setBody(""); setCoverUrl("");
    setEditing(null); setIsNew(true);
  };

  const openEdit = (n: Newsletter) => {
    setTitle(n.title); setSummary(n.summary ?? ""); setBody(n.body); setCoverUrl(n.cover_url ?? "");
    setEditing(n); setIsNew(true);
  };

  const save = async (publish: boolean) => {
    if (!user || !title.trim() || !body.trim()) return;
    setSaving(true);
    const payload = {
      title: title.trim(),
      summary: summary.trim() || null,
      body: body.trim(),
      cover_url: coverUrl.trim() || null,
      is_published: publish,
      published_at: publish ? new Date().toISOString() : editing?.published_at ?? null,
      author_id: user.id,
    };

    if (editing) {
      const { error } = await supabase.from("newsletters").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("newsletters").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    }
    toast({ title: publish ? "Published!" : "Saved as draft" });
    setIsNew(false); setEditing(null); setSaving(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("newsletters").delete().eq("id", id);
    toast({ title: "Deleted" });
    load();
  };

  // Editor form
  if (isNew) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-safe pb-4">
          <button onClick={() => setIsNew(false)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-body">Back</span>
          </button>
          <h1 className="font-heading text-2xl font-bold text-foreground">{editing ? "Edit Newsletter" : "New Newsletter"}</h1>
        </div>

        <div className="px-5 space-y-4">
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Newsletter title"
              className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/40" />
          </div>
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Summary</label>
            <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary (optional)"
              className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/40" />
          </div>
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Cover Image URL</label>
            <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..."
              className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/40" />
          </div>
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Body *</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your newsletter..."
              rows={10}
              className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/40 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button disabled={saving || !title.trim() || !body.trim()} onClick={() => save(false)}
              className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-body text-sm font-medium disabled:opacity-40">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Draft"}
            </button>
            <button disabled={saving || !title.trim() || !body.trim()} onClick={() => save(true)}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Publish</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-safe pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-body">Back</span>
        </button>
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Newsletter Editor</h1>
          <button onClick={openNew} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground font-body py-12">No newsletters yet. Tap + to create one.</p>
        ) : (
          items.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm font-semibold text-foreground truncate">{n.title}</h3>
                  <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${n.is_published ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {n.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(n)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(n.id)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsletterEditor;
