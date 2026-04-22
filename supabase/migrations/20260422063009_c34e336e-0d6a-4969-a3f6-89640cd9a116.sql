
-- 1. Remove permissive INSERT policy on user_badges
DROP POLICY IF EXISTS "Users can insert their own badges" ON public.user_badges;

-- 2. Create a SECURITY DEFINER RPC to award badges with server-side validation
CREATE OR REPLACE FUNCTION public.award_badge(_badge_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _streak int;
  _whisper_count int;
  _exists boolean;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if already earned
  SELECT EXISTS (
    SELECT 1 FROM public.user_badges
    WHERE user_id = _user_id AND badge_key = _badge_key
  ) INTO _exists;
  IF _exists THEN RETURN false; END IF;

  -- Validate criteria per badge
  IF _badge_key = 'streak_7' THEN
    SELECT current_streak INTO _streak FROM public.user_streaks WHERE user_id = _user_id;
    IF COALESCE(_streak, 0) < 7 THEN RETURN false; END IF;

  ELSIF _badge_key = 'streak_30' THEN
    SELECT current_streak INTO _streak FROM public.user_streaks WHERE user_id = _user_id;
    IF COALESCE(_streak, 0) < 30 THEN RETURN false; END IF;

  ELSIF _badge_key = 'streak_100' THEN
    SELECT current_streak INTO _streak FROM public.user_streaks WHERE user_id = _user_id;
    IF COALESCE(_streak, 0) < 100 THEN RETURN false; END IF;

  ELSIF _badge_key = 'deep_seeker' THEN
    -- Validated client-side via reading timer; trust the call if user has reading progress
    IF NOT EXISTS (SELECT 1 FROM public.reading_progress WHERE user_id = _user_id AND read_seconds >= 300) THEN
      RETURN false;
    END IF;

  ELSIF _badge_key = 'first_whisper' THEN
    IF NOT EXISTS (SELECT 1 FROM public.bookmarks WHERE user_id = _user_id AND note IS NOT NULL) THEN
      RETURN false;
    END IF;

  ELSIF _badge_key = 'whisper_keeper' THEN
    SELECT count(*) INTO _whisper_count FROM public.bookmarks WHERE user_id = _user_id AND note IS NOT NULL;
    IF _whisper_count < 10 THEN RETURN false; END IF;

  ELSE
    RETURN false; -- Unknown badge key
  END IF;

  -- Award the badge
  INSERT INTO public.user_badges (user_id, badge_key) VALUES (_user_id, _badge_key);
  RETURN true;
END;
$$;

-- 3. Fix bookmarks policies: restrict to authenticated role
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON public.bookmarks;

CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON public.bookmarks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON public.bookmarks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
