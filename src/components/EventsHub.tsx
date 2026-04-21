import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, MapPin, Users, Clock, Plus, Loader2,
  ChevronLeft, ChevronRight, Pencil, Trash2, Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  end_date: string | null;
  cover_url: string | null;
  max_seats: number | null;
  rsvp_count: number;
  created_by: string;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const countdownStr = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Happening now";
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hrs}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
};

// ─── Mini Calendar ───
const MiniCalendar = ({ events, onSelectDate, selectedDate }: {
  events: EventRow[];
  onSelectDate: (d: Date) => void;
  selectedDate: Date;
}) => {
  const [viewMonth, setViewMonth] = useState(new Date());
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventDates = new Set(events.map((e) => {
    const d = new Date(e.event_date);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => setViewMonth(new Date(year, month - 1, 1));
  const next = () => setViewMonth(new Date(year, month + 1, 1));

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-heading text-sm font-semibold text-foreground">
          {MONTHS[month]} {year}
        </span>
        <button onClick={next} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAYS.map((d) => (
          <span key={d} className="text-[9px] text-muted-foreground font-body">{d}</span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e-${i}`} />;
          const key = `${year}-${month}-${day}`;
          const hasEvent = eventDates.has(key);
          const isSelected = selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
          const isToday = new Date().getFullYear() === year && new Date().getMonth() === month && new Date().getDate() === day;
          return (
            <button
              key={key}
              onClick={() => onSelectDate(new Date(year, month, day))}
              className={`w-8 h-8 rounded-full text-xs font-body flex items-center justify-center relative transition-colors
                ${isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-accent/20 text-accent" : "text-foreground hover:bg-secondary"}`}
            >
              {day}
              {hasEvent && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Event Editor (Admin) ───
const EventEditor = ({ event, onBack, onSaved }: {
  event?: EventRow;
  onBack: () => void;
  onSaved: () => void;
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [eventDate, setEventDate] = useState(event ? event.event_date.slice(0, 16) : "");
  const [endDate, setEndDate] = useState(event?.end_date ? event.end_date.slice(0, 16) : "");
  const [coverUrl, setCoverUrl] = useState(event?.cover_url ?? "");
  const [maxSeats, setMaxSeats] = useState(event?.max_seats?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user || !title.trim() || !eventDate) return;
    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      event_date: new Date(eventDate).toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
      cover_url: coverUrl.trim() || null,
      max_seats: maxSeats ? parseInt(maxSeats) : null,
      created_by: user.id,
    };
    if (event) {
      await supabase.from("events").update(payload).eq("id", event.id);
    } else {
      await supabase.from("events").insert(payload);
    }
    toast({ title: event ? "Event updated" : "Event created" });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-safe pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-body">Back</span>
        </button>
        <h1 className="font-heading text-2xl font-bold text-foreground">{event ? "Edit Event" : "New Event"}</h1>
      </div>
      <div className="px-5 space-y-4">
        <div>
          <label className="text-xs font-body text-muted-foreground mb-1 block">Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title"
            className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/40" />
        </div>
        <div>
          <label className="text-xs font-body text-muted-foreground mb-1 block">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this event about?" rows={4}
            className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/40 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Start *</label>
            <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl bg-secondary px-3 py-3 text-sm font-body text-foreground outline-none border border-border focus:border-primary/40" />
          </div>
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">End</label>
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl bg-secondary px-3 py-3 text-sm font-body text-foreground outline-none border border-border focus:border-primary/40" />
          </div>
        </div>
        <div>
          <label className="text-xs font-body text-muted-foreground mb-1 block">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where?"
            className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/40" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Cover Image URL</label>
            <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..."
              className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/40" />
          </div>
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Max Seats</label>
            <input type="number" value={maxSeats} onChange={(e) => setMaxSeats(e.target.value)} placeholder="Unlimited"
              className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/40" />
          </div>
        </div>
        <button disabled={saving || !title.trim() || !eventDate} onClick={save}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> {event ? "Update" : "Create Event"}</>}
        </button>
      </div>
    </div>
  );
};

// ─── Main Hub ───
const EventsHub = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeEvent, setActiveEvent] = useState<EventRow | null>(null);
  const [editing, setEditing] = useState<EventRow | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [myRsvps, setMyRsvps] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("events")
      .select("id, title, description, location, event_date, end_date, cover_url, max_seats, rsvp_count, created_by")
      .order("event_date", { ascending: true });
    setEvents((data ?? []) as EventRow[]);
    if (user) {
      const { data: rsvps } = await supabase
        .from("event_rsvps")
        .select("event_id")
        .eq("user_id", user.id);
      setMyRsvps(new Set((rsvps ?? []).map((r) => r.event_id)));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const toggleRsvp = async (eventId: string) => {
    if (!user) return;
    const has = myRsvps.has(eventId);
    const next = new Set(myRsvps);
    if (has) {
      next.delete(eventId);
      setMyRsvps(next);
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, rsvp_count: Math.max(0, e.rsvp_count - 1) } : e));
      await supabase.from("event_rsvps").delete().eq("user_id", user.id).eq("event_id", eventId);
    } else {
      next.add(eventId);
      setMyRsvps(next);
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, rsvp_count: e.rsvp_count + 1 } : e));
      await supabase.from("event_rsvps").insert({ user_id: user.id, event_id: eventId });
    }
    toast({ title: has ? "RSVP cancelled" : "Seat saved! 🎉" });
  };

  const deleteEvent = async () => {
    if (!deleteTarget) return;
    await supabase.from("events").delete().eq("id", deleteTarget);
    setDeleteTarget(null);
    setActiveEvent(null);
    toast({ title: "Event deleted" });
    load();
  };

  const addToCalendar = (ev: EventRow) => {
    const start = new Date(ev.event_date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const end = ev.end_date
      ? new Date(ev.end_date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
      : new Date(new Date(ev.event_date).getTime() + 3600000).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${start}/${end}&location=${encodeURIComponent(ev.location ?? "")}&details=${encodeURIComponent(ev.description ?? "")}`;
    window.open(url, "_blank");
  };

  // Editor views
  if (creating || editing) {
    return (
      <EventEditor
        event={editing}
        onBack={() => { setCreating(false); setEditing(undefined); }}
        onSaved={() => { setCreating(false); setEditing(undefined); load(); }}
      />
    );
  }

  // Detail view
  if (activeEvent) {
    const ev = activeEvent;
    const saved = myRsvps.has(ev.id);
    const full = ev.max_seats !== null && ev.rsvp_count >= ev.max_seats;
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-safe pb-4">
          <button onClick={() => setActiveEvent(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-body">Back</span>
          </button>
        </div>
        {ev.cover_url && (
          <div className="px-5 mb-4">
            <img src={ev.cover_url} alt="" className="w-full rounded-xl object-cover max-h-48" />
          </div>
        )}
        <div className="px-5 space-y-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">{ev.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground text-xs font-body">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fmtDate(ev.event_date)}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{fmtTime(ev.event_date)}</span>
            </div>
            {ev.location && (
              <p className="flex items-center gap-1 mt-1 text-xs text-muted-foreground font-body">
                <MapPin className="w-3.5 h-3.5" />{ev.location}
              </p>
            )}
          </div>

          {ev.description && (
            <p className="text-sm font-body text-foreground/90 leading-relaxed whitespace-pre-line">{ev.description}</p>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-body text-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-semibold">{ev.rsvp_count}</span>
              {ev.max_seats && <span className="text-muted-foreground">/ {ev.max_seats}</span>}
              <span className="text-muted-foreground">attending</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-body font-medium">
              {countdownStr(ev.event_date)}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => toggleRsvp(ev.id)}
              disabled={!saved && full}
              className={`flex-1 py-3 rounded-xl font-body text-sm font-medium transition-colors flex items-center justify-center gap-2
                ${saved
                  ? "bg-primary text-primary-foreground"
                  : full
                    ? "bg-secondary text-muted-foreground"
                    : "bg-primary text-primary-foreground"}`}
            >
              {saved ? "✓ Seat Saved" : full ? "Full" : "Save My Seat"}
            </button>
            <button onClick={() => addToCalendar(ev)}
              className="px-4 py-3 rounded-xl bg-secondary text-foreground font-body text-sm font-medium hover:bg-secondary/80 transition-colors">
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          {isAdmin && (
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setEditing(ev); setActiveEvent(null); }}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground font-body text-xs flex items-center justify-center gap-2">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => setDeleteTarget(ev.id)}
                className="flex-1 py-2.5 rounded-xl bg-destructive/10 text-destructive font-body text-xs flex items-center justify-center gap-2">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>

        <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading">Delete this event?</AlertDialogTitle>
              <AlertDialogDescription className="font-body">This will remove the event and all RSVPs. This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground font-body" onClick={deleteEvent}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Filter events for selected date
  const dayEvents = events.filter((e) => {
    const d = new Date(e.event_date);
    return d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === selectedDate.getMonth() && d.getDate() === selectedDate.getDate();
  });

  // Upcoming (future events, regardless of selected date)
  const upcoming = events.filter((e) => new Date(e.event_date) > new Date()).slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-safe pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-body">Back</span>
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Events</h1>
          </div>
          {isAdmin && (
            <button onClick={() => setCreating(true)} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
      ) : (
        <div className="px-5 space-y-5">
          <MiniCalendar events={events} onSelectDate={setSelectedDate} selectedDate={selectedDate} />

          {/* Events on selected date */}
          <div>
            <h2 className="font-heading text-sm font-semibold text-foreground mb-3">
              {selectedDate.toDateString() === new Date().toDateString() ? "Today" : fmtDate(selectedDate.toISOString())}
            </h2>
            {dayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground font-body">No events on this day.</p>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((ev, i) => (
                  <motion.button key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setActiveEvent(ev)}
                    className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-sm font-semibold text-foreground truncate">{ev.title}</h3>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground font-body">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmtTime(ev.event_date)}</span>
                          {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-primary font-body font-medium shrink-0">
                        <Users className="w-3 h-3" />{ev.rsvp_count}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming events */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-heading text-sm font-semibold text-foreground mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((ev, i) => (
                  <motion.button key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setActiveEvent(ev)}
                    className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] text-primary font-body font-semibold uppercase">{MONTHS[new Date(ev.event_date).getMonth()]}</span>
                        <span className="font-heading text-lg font-bold text-foreground leading-none">{new Date(ev.event_date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-sm font-semibold text-foreground truncate">{ev.title}</h3>
                        <p className="text-[11px] text-muted-foreground font-body mt-0.5">{fmtTime(ev.event_date)}{ev.location ? ` · ${ev.location}` : ""}</p>
                      </div>
                      {myRsvps.has(ev.id) && (
                        <span className="text-[10px] text-primary font-body font-medium px-2 py-0.5 rounded-full bg-primary/15">Saved</span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {events.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-body">No events yet.</p>
              {isAdmin && <p className="text-xs text-muted-foreground font-body mt-1">Tap + to create one.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsHub;
