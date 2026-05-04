export const PRAYERS = ['bomdod', 'peshin', 'asr', 'shom', 'xufton', 'vitr']

export const PRAYER_EMOJIS = {
  bomdod: '🌅',
  peshin: '☀️',
  asr: '🌤️',
  shom: '🌇',
  xufton: '🌙',
  vitr: '⭐',
}

export const PRAYER_COLORS = {
  bomdod: '#6366f1',
  peshin: '#f59e0b',
  asr: '#3b82f6',
  shom: '#f97316',
  xufton: '#8b5cf6',
  vitr: '#2d9e8a',
}

export const EMPTY_COUNTS = () => Object.fromEntries(PRAYERS.map(p => [p, 0]))
