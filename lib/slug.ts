const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars (0,O,1,I)

export function generateSlug(): string {
  const year = new Date().getFullYear().toString().slice(-2)
  let random = ''
  for (let i = 0; i < 4; i++) {
    random += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return `WED${year}-${random}`
}
