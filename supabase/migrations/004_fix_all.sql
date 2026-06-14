-- ============================================
-- 遗憾交易所 - 一次性修复脚本（修正版）
-- ============================================

-- 获取已存在的用户 ID
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 查找已有的测试用户
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'local@test.com';

  -- 如果没找到，就新建
  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at)
    VALUES (gen_random_uuid(), 'local@test.com', crypt('test123456', gen_salt('bf')), now(), '{"nickname":"海风旅人"}', now())
    RETURNING id INTO v_user_id;
  END IF;

  -- 确保 profile 存在
  INSERT INTO public.profiles (id, nickname, created_at)
  VALUES (v_user_id, '海风旅人', now())
  ON CONFLICT (id) DO UPDATE SET nickname = '海风旅人';
END $$;

-- 关闭 RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.regrets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies DISABLE ROW LEVEL SECURITY;

-- 删除旧 RLS 策略
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
