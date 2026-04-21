import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_EMAIL = "jaeyblaine@gmail.com";

export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    (async () => {
      // Check if already has admin role
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (existing) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Auto-grant admin for the designated email
      if (user.email === ADMIN_EMAIL) {
        await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
        setIsAdmin(true);
      }

      setLoading(false);
    })();
  }, [user]);

  return { isAdmin, loading };
};
