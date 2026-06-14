-- ============================================
-- 遗憾交易所 - 种子数据（SQL 版）
-- 直接在 Supabase SQL Editor 中运行
-- ============================================

-- 1. 创建测试用户（密码: test123456）
DO $$
DECLARE
  v_user_id UUID;
  v_regret_ids UUID[] := '{}';
  v_reply_texts TEXT[] := ARRAY[
    '海风会带走所有的遗憾。',
    '有些告别，是为了更好的重逢。',
    '你从来都不是一个人。',
    '时间会留下最珍贵的东西。',
    '光，总在拐角处等着你。',
    '那些没说完的话，就留给风吧。',
    '遗憾也是生命的一部分。',
    '明天的太阳依然会升起。',
    '你很好，只是遇到了错的时间。',
    '有些回忆，温暖过就够了。',
    '慢慢来，你并不孤单。',
    '一切都会好起来的。',
    '你的故事，有人愿意听。',
    '悲伤会过去，就像潮水会退去。',
    '你有权利用任何一种方式活着。',
    '蝴蝶记得所有的花。',
    '不必原谅，但可以放下。',
    '星星即使在最暗的夜里也会发光。',
    '此刻的你，就是最好的你。',
    '有些路，走下去就会看到光。',
    '温柔的人值得被温柔以待。',
    '你已经做得很好了。',
    '未来还有人在等你。',
    '每一段路都是一次成长。'
  ];
BEGIN
  -- 检查是否已存在
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'local@test.com';

  IF v_user_id IS NULL THEN
    -- 创建用户
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at)
    VALUES (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'local@test.com',
      crypt('test123456', gen_salt('bf')),
      now(),
      '{"nickname":"海风旅人"}',
      now()
    )
    RETURNING id INTO v_user_id;
  END IF;

  -- 确保 profile 存在
  INSERT INTO public.profiles (id, nickname, created_at)
  VALUES (v_user_id, '海风旅人', now())
  ON CONFLICT (id) DO UPDATE SET nickname = '海风旅人';

  -- 清空旧数据
  DELETE FROM public.replies WHERE user_id = v_user_id;
  DELETE FROM public.regrets WHERE user_id = v_user_id;

  -- 2. 插入 50 条遗憾
  WITH regrets_data AS (
    SELECT * FROM (VALUES
      (1, '如果那天说了再见，也许就不会遗憾这么多年了。', '遗憾'),
      (2, '小时候总想长大，长大了却总想回到小时候。', '怀念'),
      (3, '妈妈做的最后一顿饭，我忘记说谢谢了。', '思念'),
      (4, '不该在吵架时说那些伤人的话。', '懊悔'),
      (5, '放下一个人需要多久？我已经数不清日子了。', '释然'),
      (6, '没有去那场演唱会，后来乐队解散了。', '遗憾'),
      (7, '假如当时勇敢一点，牵住你的手。', '如果'),
      (8, '谢谢你在最难的时刻陪着我。', '温柔'),
      (9, '爸爸总说忙完就回家，可是他已经很久没回来了。', '思念'),
      (10, '错过的不只是那班车，还有那段时光。', '遗憾'),
      (11, '那年夏天，外婆的蒲扇，蝉鸣，和冰西瓜。', '怀念'),
      (12, '如果能回到18岁，我会告诉自己：别怕。', '如果'),
      (13, '删掉了所有聊天记录，但删不掉记忆。', '遗憾'),
      (14, '对不起，那时候的我太年轻了。', '懊悔'),
      (15, '那个常去的书店关门了，老板送了我最后一本书。', '怀念'),
      (16, '感谢那场雨，让我遇见了你。', '温柔'),
      (17, '早知道那是最后一次见面，我会多看你几眼。', '遗憾'),
      (18, '爷爷走后，老家院子里的枣树也不结果了。', '思念'),
      (19, '没能和你说一句：我喜欢你。', '遗憾'),
      (20, '从前的日色变得慢，车、马、邮件都慢。', '怀念'),
      (21, '如果能重来，我不会那么固执。', '如果'),
      (22, '那封没有寄出的信，还躺在抽屉里。', '遗憾'),
      (23, '后来我学会了做饭，但你吃不到了。', '思念'),
      (24, '每次路过那家咖啡馆，都会想起你的笑容。', '思念'),
      (25, '毕业后，有些人一辈子都没再见过。', '遗憾'),
      (26, '老师说过：你们以为离开的是地狱，其实那是天堂。', '怀念'),
      (27, '有些路，只能一个人走。', '释然'),
      (28, '总有一天，你会成为别人的光。', '温柔'),
      (29, '如果当初没有放弃那个梦想。', '如果'),
      (30, '城市的灯光很亮，却照不亮回家的路。', '思念'),
      (31, '有些抱歉，说出来的时候已经太晚了。', '懊悔'),
      (32, '已经很久没有抬头看星星了。', '释然'),
      (33, '那本借给你的书，你还没还给我。', '温柔'),
      (34, '童年时以为世界很小，长大后才发现世界很大，而我很小。', '怀念'),
      (35, '希望你能遇到一个懂你欲言又止的人。', '温柔'),
      (36, '最遗憾的是：我本可以。', '遗憾'),
      (37, '时间是个庸医，却自称包治百病。', '释然'),
      (38, '再也没有人和我争论一碗面到底好不好吃了。', '思念'),
      (39, '那个约定，我一直记得。', '怀念'),
      (40, '有些伤口，需要时间来愈合。', '释然'),
      (41, '如果能回到那个路口，我会选择左转。', '如果'),
      (42, '毕业那天，我欠你们一个拥抱。', '遗憾'),
      (43, '你教会了我爱，却没教会我忘记。', '思念'),
      (44, '最怕在某个年纪，突然听懂了一首歌。', '怀念'),
      (45, '我的城市下雨了，你带伞了吗。', '思念'),
      (46, '有些事，不是忘了，只是不再提起。', '释然'),
      (47, '多想再听你喊一声我的小名。', '思念'),
      (48, '假如时光能倒流，我会更用力地活着。', '如果'),
      (49, '昨天越来越多，明天越来越少。', '释然'),
      (50, '谢谢你曾经出现在我的生命里。', '温柔')
    ) AS t(id, content, tag)
    ORDER BY random()
  )
  INSERT INTO public.regrets (user_id, content, emotion_tag, is_anonymous, created_at, disappear_at, is_visible)
  SELECT
    v_user_id,
    rd.content,
    rd.tag,
    random() > 0.3, -- 70% 匿名
    now() - (random() * 48 * interval '1 hour'),
    now() - (random() * 48 * interval '1 hour') + interval '24 hours',
    true
  FROM regrets_data rd;

  -- 收集所有遗憾 ID
  SELECT array_agg(id) INTO v_regret_ids FROM public.regrets WHERE user_id = v_user_id;

  -- 3. 给部分遗憾添加回应（约 30% 的遗憾有 1-3 条回应）
  FOR i IN 1..array_length(v_regret_ids, 1) LOOP
    IF random() > 0.7 THEN
      DECLARE
        num_replies INT := floor(random() * 3) + 1;
      BEGIN
        FOR j IN 1..num_replies LOOP
          INSERT INTO public.replies (regret_id, user_id, content, type, created_at)
          VALUES (
            v_regret_ids[i],
            v_user_id,
            v_reply_texts[floor(random() * array_length(v_reply_texts, 1)) + 1],
            CASE WHEN random() > 0.5 THEN 'ai' ELSE 'user' END,
            now() - (random() * 24 * interval '1 hour')
          );
        END LOOP;
      END;
    END IF;
  END LOOP;

  RAISE NOTICE '✅ 种子数据生成完成！';
  RAISE NOTICE '📧 local@test.com / test123456';
END $$;
