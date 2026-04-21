import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface NextEvent {
  id: string;
  title: string;
  event_date: string;
  location: string | null;
  rsvp_count: number;
  max_seats: number | null;
}

const countdownParts = (iso: string) => {
  const diff = Math.max(0, new Date(iso).getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return { days, hrs, mins, past: diff <= 0 };
};

const SaveMySeatCard = ({ onOpen }: { onOpen: () => void }) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<NextEvent | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hrs: 0, mins: 0, past: false });

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Get next event the user has RSVP'd to
      const { data: rsvps } = await supabase
        .from("event_rsvps")
        .select("event_id")
        .eq("user_id", user.id);
      if (!rsvps?.length) return;

      const { data: events } = await supabase
        .from("events")
        .select("id, title, event_date, location, rsvp_count, max_seats")
        .in("id", rsvps.map((r) => r.event_id))
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(1);

      if (events?.[0]) {
        setEvent(events[0] as NextEvent);
        setCountdown(countdownParts(events[0].event_date));
      }
    })();
  }, [user]);

  // Tick the countdown every minute
  useEffect(() => {
    if (!event) return;
    const t = setInterval(() => setCountdown(countdownParts(event.event_date)), 60000);
    return () => clearInterval(t);
  }, [event]);

  if (!event) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className="w-full text-left rounded-xl bg-gradient-to-br from-primary/15 via-card to-card border border-primary/20 p-4 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] tracking-[0.15em] uppercase text-primary font-body font-semibold">Your Next Event</span>
      </div>
      <h3 className="font-heading text-base font-semibold text-foreground leading-snug">{event.title}</h3>
      {event.location && (
        <p className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground font-body">
          <MapPin className="w-3 h-3" />{event.location}
        </p>
      )}
      <div className="flex items-center gap-4 mt-3">
        {!countdown.past ? (
          <div className="flex items-center gap-2">
            {countdown.days > 0 && (
              <div className="flex flex-col items-center bg-primary/10 rounded-lg px-2.5 py-1.5">
                <span className="font-heading text-lg font-bold text-primary leading-none">{countdown.days}</span>
                <span className="text-[8px] text-muted-foreground font-body">days</span>
              </div>
            )}
            <div className="flex flex-col items-center bg-primary/10 rounded-lg px-2.5 py-1.5">
              <span className="font-heading text-lg font-bold text-primary leading-none">{countdown.hrs}</span>
              <span className="text-[8px] text-muted-foreground font-body">hrs</span>
            </div>
            <div className="flex flex-col items-center bg-primary/10 rounded-lg px-2.5 py-1.5">
              <span className="font-heading text-lg font-bold text-primary leading-none">{countdown.mins}</span>
              <span className="text-[8px] text-muted-foreground font-body">min</span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-primary font-body font-medium">Happening now!</span>
        )}
        <div className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground font-body">
          <Users className="w-3 h-3" />{event.rsvp_count} going
        </div>
      </div>
    </motion.button>
  );
};

export default SaveMySeatCard;
