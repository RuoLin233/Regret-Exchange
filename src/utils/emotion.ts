import type { EmotionTag } from '../types'

const patterns: [RegExp, string][] = [
  [/想|念|怀|忘|梦|记|曾经|过去|旧/, '思念'],
  [/悔|错|不该|如果|假如|要是|当初|早知|要是/, '懊悔'],
  [/放下|算了|向前|成长|明白|懂了|释怀|看开/, '释然'],
  [/遗憾|可惜|未|没|错过|再也|来不及|从未/, '遗憾'],
  [/那年|小时|从前|以前|那时|老|旧时光|童年/, '怀念'],
  [/如果|假如|希望|但愿|多想|好想|期待/, '如果'],
  [/温柔|谢谢|感谢|美好|幸运|遇见|光|暖/, '温柔'],
  [/对不起|抱歉|亏欠|愧疚/, '愧疚'],
  [/孤独|寂寞|一个人|孤/, '落寞'],
  [/舍不得|不舍|留恋|放不下/, '不舍'],
  [/变了|变了|回不去|不再|陌生/, '怅然'],
  [/珍重|珍惜|有幸|值得/, '庆幸'],
]

export function detectEmotion(content: string): EmotionTag {
  for (const [regex, tag] of patterns) {
    if (regex.test(content)) return tag
  }
  return '遗憾'
}
