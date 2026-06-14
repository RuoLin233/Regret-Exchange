/**
 * 遗憾交易所 - 种子数据脚本
 * 运行：node scripts/seed.js
 *
 * 需要 Supabase service_role key（在 Dashboard → Settings → API 里找）
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://yndsqtpglkncrbjzqrkd.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SERVICE_ROLE_KEY) {
  console.error('请设置 SUPABASE_SERVICE_ROLE_KEY 环境变量')
  console.log('从 Supabase Dashboard → Settings → API → service_role secret 获取')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// 50 条遗憾内容
const regretData = [
  { content: '如果那天说了再见，也许就不会遗憾这么多年了。', emotion_tag: '遗憾' },
  { content: '小时候总想长大，长大了却总想回到小时候。', emotion_tag: '怀念' },
  { content: '妈妈做的最后一顿饭，我忘记说谢谢了。', emotion_tag: '思念' },
  { content: '不该在吵架时说那些伤人的话。', emotion_tag: '懊悔' },
  { content: '放下一个人需要多久？我已经数不清日子了。', emotion_tag: '释然' },
  { content: '没有去那场演唱会，后来乐队解散了。', emotion_tag: '遗憾' },
  { content: '假如当时勇敢一点，牵住你的手。', emotion_tag: '如果' },
  { content: '谢谢你在最难的时刻陪着我。', emotion_tag: '温柔' },
  { content: '爸爸总说忙完就回家，可是他已经很久没回来了。', emotion_tag: '思念' },
  { content: '错过的不只是那班车，还有那段时光。', emotion_tag: '遗憾' },
  { content: '那年夏天，外婆的蒲扇，蝉鸣，和冰西瓜。', emotion_tag: '怀念' },
  { content: '如果能回到18岁，我会告诉自己：别怕。', emotion_tag: '如果' },
  { content: '删掉了所有聊天记录，但删不掉记忆。', emotion_tag: '遗憾' },
  { content: '对不起，那时候的我太年轻了。', emotion_tag: '懊悔' },
  { content: '那个常去的书店关门了，老板送了我最后一本书。', emotion_tag: '怀念' },
  { content: '感谢那场雨，让我遇见了你。', emotion_tag: '温柔' },
  { content: '早知道那是最后一次见面，我会多看你几眼。', emotion_tag: '遗憾' },
  { content: '爷爷走后，老家院子里的枣树也不结果了。', emotion_tag: '思念' },
  { content: '没能和你说一句：我喜欢你。', emotion_tag: '遗憾' },
  { content: '从前的日色变得慢，车、马、邮件都慢。', emotion_tag: '怀念' },
  { content: '如果能重来，我不会那么固执。', emotion_tag: '如果' },
  { content: '那封没有寄出的信，还躺在抽屉里。', emotion_tag: '遗憾' },
  { content: '后来我学会了做饭，但你吃不到了。', emotion_tag: '思念' },
  { content: '每次路过那家咖啡馆，都会想起你的笑容。', emotion_tag: '思念' },
  { content: '毕业后，有些人一辈子都没再见过。', emotion_tag: '遗憾' },
  { content: '老师说过：你们以为离开的是地狱，其实那是天堂。', emotion_tag: '怀念' },
  { content: '有些路，只能一个人走。', emotion_tag: '释然' },
  { content: '总有一天，你会成为别人的光。', emotion_tag: '温柔' },
  { content: '如果当初没有放弃那个梦想。', emotion_tag: '如果' },
  { content: '城市的灯光很亮，却照不亮回家的路。', emotion_tag: '思念' },
  { content: '有些抱歉，说出来的时候已经太晚了。', emotion_tag: '懊悔' },
  { content: '已经很久没有抬头看星星了。', emotion_tag: '释然' },
  { content: '那本借给你的书，你还没还给我。', emotion_tag: '温柔' },
  { content: '童年时以为世界很小，长大后才发现世界很大，而我很小。', emotion_tag: '怀念' },
  { content: '希望你能遇到一个懂你欲言又止的人。', emotion_tag: '温柔' },
  { content: '最遗憾的是：我本可以。', emotion_tag: '遗憾' },
  { content: '时间是个庸医，却自称包治百病。', emotion_tag: '释然' },
  { content: '再也没有人和我争论一碗面到底好不好吃了。', emotion_tag: '思念' },
  { content: '那个约定，我一直记得。', emotion_tag: '怀念' },
  { content: '有些伤口，需要时间来愈合。', emotion_tag: '释然' },
  { content: '如果能回到那个路口，我会选择左转。', emotion_tag: '如果' },
  { content: '毕业那天，我欠你们一个拥抱。', emotion_tag: '遗憾' },
  { content: '你教会了我爱，却没教会我忘记。', emotion_tag: '思念' },
  { content: '最怕在某个年纪，突然听懂了一首歌。', emotion_tag: '怀念' },
  { content: '我的城市下雨了，你带伞了吗。', emotion_tag: '思念' },
  { content: '有些事，不是忘了，只是不再提起。', emotion_tag: '释然' },
  { content: '多想再听你喊一声我的小名。', emotion_tag: '思念' },
  { content: '假如时光能倒流，我会更用力地活着。', emotion_tag: '如果' },
  { content: '昨天越来越多，明天越来越少。', emotion_tag: '释然' },
  { content: '谢谢你曾经出现在我的生命里。', emotion_tag: '温柔' },
]

// AI 治愈回应（部分预设）
const replyTemplates = [
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
  '我记得你笑的样子，很美。',
  '未来还有人在等你。',
  '每一段路都是一次成长。',
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function seed() {
  console.log('🌊 开始生成种子数据...\n')

  // 1. 创建测试用户（先检查是否已存在）
  const testEmail = 'local@test.com'
  const testPassword = 'test123456'

  let userId

  const { data: existingUser } = await supabase.auth.admin.getUserByEmail(testEmail)
  if (existingUser?.user) {
    userId = existingUser.user.id
    console.log('📋 使用已有用户:', userId)
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { nickname: '海风旅人' },
    })
    if (error) { console.error('创建用户失败:', error.message); return }
    userId = newUser.user.id
    console.log('✅ 创建新用户:', userId)
  }

  // 2. 确保 profile 存在
  await supabase.from('profiles').upsert({
    id: userId,
    nickname: '海风旅人',
    avatar_url: null,
  })

  // 3. 清空旧数据
  await supabase.from('replies').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('regrets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('🗑️ 清空旧数据完成')

  // 4. 插入遗憾（打乱时间，分布在最近 48 小时内）
  const now = Date.now()
  const insertedRegrets = []

  for (let i = 0; i < regretData.length; i++) {
    const r = regretData[i]
    const hoursAgo = Math.floor(Math.random() * 48)
    const minutesAgo = Math.floor(Math.random() * 60)
    const createdAt = new Date(now - hoursAgo * 3600000 - minutesAgo * 60000).toISOString()
    const disappearAt = new Date(new Date(createdAt).getTime() + 24 * 3600000).toISOString()

    const { data: regret, error } = await supabase.from('regrets').insert({
      user_id: userId,
      content: r.content,
      emotion_tag: r.emotion_tag,
      is_anonymous: Math.random() > 0.3, // 70% 匿名
      created_at: createdAt,
      disappear_at: disappearAt,
      is_visible: true,
    }).select().single()

    if (error) {
      console.error(`❌ 插入遗憾 ${i+1} 失败:`, error.message)
    } else {
      insertedRegrets.push(regret)
      process.stdout.write(`\r📜 插入遗憾: ${insertedRegrets.length}/${regretData.length}`)
    }
  }
  console.log()

  // 5. 给部分遗憾添加回应
  let replyCount = 0
  for (const regret of insertedRegrets) {
    // 30% 概率有 1-3 条回应
    if (Math.random() > 0.7) continue
    const numReplies = Math.floor(Math.random() * 3) + 1

    for (let j = 0; j < numReplies; j++) {
      const replyContent = pick(replyTemplates)
      const replyTime = new Date(new Date(regret.created_at).getTime() + Math.random() * 3600000).toISOString()

      const { error } = await supabase.from('replies').insert({
        regret_id: regret.id,
        user_id: userId,
        content: replyContent,
        type: Math.random() > 0.5 ? 'ai' : 'user',
        created_at: replyTime,
      })

      if (!error) replyCount++
    }
  }

  console.log(`💬 插入回应: ${replyCount} 条`)
  console.log(`\n🌊 种子数据生成完成！`)
  console.log(`📊 遗憾: ${insertedRegrets.length} 条`)
  console.log(`💧 回应: ${replyCount} 条`)
  console.log(`👤 用户: ${testEmail} / ${testPassword}`)
}

seed().catch(console.error)
