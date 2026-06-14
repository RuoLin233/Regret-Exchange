export function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

export function getDisappearProgress(createdAt: string): number {
  const created = new Date(createdAt).getTime()
  const now = Date.now()
  const elapsed = now - created
  const total = 24 * 60 * 60 * 1000
  return Math.min(elapsed / total, 1)
}

export function getRemainingTime(disappearAt: string): string {
  const disappear = new Date(disappearAt).getTime()
  const now = Date.now()
  const diff = disappear - now

  if (diff <= 0) return '即将消散'

  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)

  if (hours > 0) return `${hours}小时${minutes}分钟`
  return `${minutes}分钟`
}
