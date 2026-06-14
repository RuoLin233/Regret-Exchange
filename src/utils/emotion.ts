import type { EmotionTag } from '../types'

const emotionKeywords: Record<EmotionTag, RegExp[]> = {
  '思念': [/想/, /念/, /怀/, /梦/, /记/, /忘/, /曾经/, /过去/, /旧/],
  '懊悔': [/悔/, /错/, /不该/, /如果/, /假如/, /要是/, /当初/, /早知/],
  '释然': [/放下/, /算了/, /过去/, /向前/, /成长/, /明白/, /懂了/, /释怀/],
  '遗憾': [/遗憾/, /可惜/, /未/, /没/, /错过/, /再也/, /来不及/],
  '怀念': [/那年/, /小时/, /从前/, /以前/, /那时/, /老/, /旧时光/, /童年/],
  '如果': [/如果/, /假如/, /希望/, /但愿/, /多想/, /好想/],
  '温柔': [/温柔/, /谢谢/, /感谢/, /美好/, /幸运/, /遇见/, /光/, /暖/],
}

export function detectEmotion(content: string): EmotionTag | null {
  for (const [tag, patterns] of Object.entries(emotionKeywords)) {
    for (const regex of patterns) {
      if (regex.test(content)) {
        return tag as EmotionTag
      }
    }
  }
  return null
}
