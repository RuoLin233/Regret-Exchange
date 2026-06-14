-- ============================================
-- 添加遗憾颜色字段
-- ============================================

ALTER TABLE public.regrets ADD COLUMN IF NOT EXISTS regret_color TEXT NOT NULL DEFAULT 'ocean';

-- 为已有数据随机分配颜色
UPDATE public.regrets SET regret_color = (
  CASE (floor(random() * 6))::int
    WHEN 0 THEN 'ocean'
    WHEN 1 THEN 'gold'
    WHEN 2 THEN 'coral'
    WHEN 3 THEN 'seafoam'
    WHEN 4 THEN 'lavender'
    WHEN 5 THEN 'sand'
  END
) WHERE regret_color IS NULL OR regret_color = '';
