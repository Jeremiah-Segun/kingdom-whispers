
-- comment_likes
DROP POLICY IF EXISTS "Users can like" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can unlike own" ON public.comment_likes;
CREATE POLICY "Users can like" ON public.comment_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own" ON public.comment_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- comment_reports
DROP POLICY IF EXISTS "Users can report" ON public.comment_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.comment_reports;
CREATE POLICY "Users can report" ON public.comment_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own reports" ON public.comment_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- event_rsvps
DROP POLICY IF EXISTS "Users can RSVP" ON public.event_rsvps;
DROP POLICY IF EXISTS "Users can cancel RSVP" ON public.event_rsvps;
CREATE POLICY "Users can RSVP" ON public.event_rsvps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel RSVP" ON public.event_rsvps FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- events
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- follows
DROP POLICY IF EXISTS "Users can follow as themselves" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow themselves" ON public.follows;
CREATE POLICY "Users can follow as themselves" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow themselves" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- newsletters
DROP POLICY IF EXISTS "Admins can delete newsletters" ON public.newsletters;
DROP POLICY IF EXISTS "Admins can insert newsletters" ON public.newsletters;
DROP POLICY IF EXISTS "Admins can update newsletters" ON public.newsletters;
DROP POLICY IF EXISTS "Admins can view all newsletters" ON public.newsletters;
CREATE POLICY "Admins can delete newsletters" ON public.newsletters FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert newsletters" ON public.newsletters FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = author_id);
CREATE POLICY "Admins can update newsletters" ON public.newsletters FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all newsletters" ON public.newsletters FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- post_comments
DROP POLICY IF EXISTS "Users can create their own post comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete their own post comments" ON public.post_comments;
CREATE POLICY "Users can create their own post comments" ON public.post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own post comments" ON public.post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- post_likes
DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike own" ON public.post_likes;
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own" ON public.post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- post_reports
DROP POLICY IF EXISTS "Users can report posts" ON public.post_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.post_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.post_reports;
CREATE POLICY "Users can report posts" ON public.post_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all reports" ON public.post_reports FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own reports" ON public.post_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- posts
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- prayers
DROP POLICY IF EXISTS "Users can delete their own prayers" ON public.prayers;
DROP POLICY IF EXISTS "Users can insert their own prayers" ON public.prayers;
DROP POLICY IF EXISTS "Users can update their own prayers" ON public.prayers;
DROP POLICY IF EXISTS "Users can view their own prayers" ON public.prayers;
CREATE POLICY "Users can delete their own prayers" ON public.prayers FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own prayers" ON public.prayers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prayers" ON public.prayers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own prayers" ON public.prayers FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- reading_days
DROP POLICY IF EXISTS "Users can insert their own reading days" ON public.reading_days;
DROP POLICY IF EXISTS "Users can view their own reading days" ON public.reading_days;
CREATE POLICY "Users can insert their own reading days" ON public.reading_days FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own reading days" ON public.reading_days FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- reading_progress
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.reading_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.reading_progress;
DROP POLICY IF EXISTS "Users can view their own progress" ON public.reading_progress;
CREATE POLICY "Users can insert their own progress" ON public.reading_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.reading_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own progress" ON public.reading_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- user_badges
DROP POLICY IF EXISTS "Users can view their own badges" ON public.user_badges;
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- user_streaks
DROP POLICY IF EXISTS "Users can insert their own streak" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can update their own streak" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can view their own streak" ON public.user_streaks;
CREATE POLICY "Users can insert their own streak" ON public.user_streaks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own streak" ON public.user_streaks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own streak" ON public.user_streaks FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- verse_comments
DROP POLICY IF EXISTS "Users can insert their own comments" ON public.verse_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.verse_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.verse_comments;
CREATE POLICY "Users can insert their own comments" ON public.verse_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.verse_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.verse_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
