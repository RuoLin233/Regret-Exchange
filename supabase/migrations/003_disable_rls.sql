-- ============================================
-- 本地开发模式：关闭 RLS，允许匿名访问
-- ============================================

-- 关闭 RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.regrets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies DISABLE ROW LEVEL SECURITY;

-- 删除旧的 RLS 策略
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

DROP POLICY IF EXISTS "regrets_select_visible" ON public.regrets;
DROP POLICY IF EXISTS "regrets_insert_auth" ON public.regrets;
DROP POLICY IF EXISTS "regrets_update_own" ON public.regrets;
DROP POLICY IF EXISTS "regrets_delete_own" ON public.regrets;

DROP POLICY IF EXISTS "replies_select_with_regret" ON public.replies;
DROP POLICY IF EXISTS "replies_insert_auth" ON public.replies;
DROP POLICY IF EXISTS "replies_update_own" ON public.replies;
DROP POLICY IF EXISTS "replies_delete_own" ON public.replies;
