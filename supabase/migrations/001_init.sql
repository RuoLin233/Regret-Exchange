-- ============================================
-- 遗憾交易所 - 数据库初始化
-- ============================================

-- 1. 用户资料表
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname    TEXT NOT NULL DEFAULT '匿名旅人',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 遗憾表
CREATE TABLE IF NOT EXISTS public.regrets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  emotion_tag   TEXT,
  is_anonymous  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  disappear_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  is_visible    BOOLEAN NOT NULL DEFAULT true
);

-- 3. 回应表
CREATE TABLE IF NOT EXISTS public.replies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regret_id   UUID NOT NULL REFERENCES public.regrets(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('user', 'ai')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. 索引
CREATE INDEX IF NOT EXISTS idx_regrets_visible_created
  ON public.regrets (is_visible, created_at DESC)
  WHERE is_visible = true;

CREATE INDEX IF NOT EXISTS idx_regrets_user_id
  ON public.regrets (user_id);

CREATE INDEX IF NOT EXISTS idx_replies_regret_id
  ON public.replies (regret_id);

CREATE INDEX IF NOT EXISTS idx_replies_user_id
  ON public.replies (user_id);

-- 5. Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;

-- profiles RLS
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- regrets RLS
CREATE POLICY "regrets_select_visible" ON public.regrets
  FOR SELECT USING (is_visible = true OR auth.uid() = user_id);

CREATE POLICY "regrets_insert_auth" ON public.regrets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "regrets_update_own" ON public.regrets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "regrets_delete_own" ON public.regrets
  FOR DELETE USING (auth.uid() = user_id);

-- replies RLS
CREATE POLICY "replies_select_with_regret" ON public.replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.regrets
      WHERE regrets.id = replies.regret_id
      AND (regrets.is_visible = true OR regrets.user_id = auth.uid())
    )
  );

CREATE POLICY "replies_insert_auth" ON public.replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "replies_update_own" ON public.replies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "replies_delete_own" ON public.replies
  FOR DELETE USING (auth.uid() = user_id);

-- 6. 新用户注册时自动创建 profile 的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', '匿名旅人')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. 消散 Cron（每小时执行）
-- 在 Supabase Dashboard -> SQL Editor 中执行：
-- 先在 Database -> Extensions 启用 pg_cron
-- 然后执行：

-- SELECT cron.schedule(
--   'disappear-regrets',
--   '0 * * * *',
--   $$ UPDATE public.regrets SET is_visible = false
--      WHERE is_visible = true AND disappear_at <= now(); $$
-- );
