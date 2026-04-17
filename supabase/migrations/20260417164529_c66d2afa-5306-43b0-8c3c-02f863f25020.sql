-- PHASE 1 SCHEMA: prayers, verse comments + likes/reports, badges/reading days

-- 1) PRAYERS
CREATE TABLE public.prayers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_answered BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMPTZ,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prayers" ON public.prayers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone authenticated can view public prayers" ON public.prayers
  FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Users can insert their own prayers" ON public.prayers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prayers" ON public.prayers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prayers" ON public.prayers
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER prayers_updated_at BEFORE UPDATE ON public.prayers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) VERSE COMMENTS
CREATE TABLE public.verse_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reference TEXT NOT NULL,           -- e.g. "John 3:16"
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  body TEXT NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.verse_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view comments" ON public.verse_comments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own comments" ON public.verse_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.verse_comments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.verse_comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_verse_comments_ref ON public.verse_comments(reference);
CREATE INDEX idx_verse_comments_created ON public.verse_comments(created_at DESC);
CREATE TRIGGER verse_comments_updated_at BEFORE UPDATE ON public.verse_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) COMMENT LIKES
CREATE TABLE public.comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.verse_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view likes" ON public.comment_likes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like" ON public.comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own" ON public.comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to maintain like_count
CREATE OR REPLACE FUNCTION public.bump_comment_like_count()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.verse_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.verse_comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER comment_likes_count_ins AFTER INSERT ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.bump_comment_like_count();
CREATE TRIGGER comment_likes_count_del AFTER DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.bump_comment_like_count();

-- 4) COMMENT REPORTS
CREATE TABLE public.comment_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.verse_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own reports" ON public.comment_reports
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can report" ON public.comment_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5) READING DAYS (for streak calendar)
CREATE TABLE public.reading_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  read_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, read_date)
);
ALTER TABLE public.reading_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own reading days" ON public.reading_days
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reading days" ON public.reading_days
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6) BADGES (earned)
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_key TEXT NOT NULL,           -- 'streak_7', 'streak_30', 'streak_100', 'deep_seeker'
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookmarks: add book/chapter/verse for richer linking (optional cols, nullable to keep existing rows valid)
ALTER TABLE public.bookmarks
  ADD COLUMN IF NOT EXISTS book TEXT,
  ADD COLUMN IF NOT EXISTS chapter INTEGER,
  ADD COLUMN IF NOT EXISTS verse INTEGER;