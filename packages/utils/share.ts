export type SharePlatform = 'whatsapp' | 'telegram' | 'facebook' | 'twitter' | 'linkedin' | 'email' | 'copy_link'

export function tournamentUrl(baseUrl: string, slug: string) {
  return `${baseUrl.replace(/\/$/, '')}/t/${slug}`
}

export function defaultShareMessage(name: string, url: string) {
  return `Join us for ${name}! Follow live standings & results at ${url}`
}

export function buildShareUrl(platform: SharePlatform, url: string, message: string): string | null {
  const u = encodeURIComponent(url)
  const m = encodeURIComponent(message)
  switch (platform) {
    case 'whatsapp': return `https://wa.me/?text=${m}`
    case 'telegram': return `https://t.me/share/url?url=${u}&text=${m}`
    case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${u}`
    case 'twitter': return `https://twitter.com/intent/tweet?text=${m}`
    case 'linkedin': return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`
    case 'email': return `mailto:?subject=${encodeURIComponent('Tournament details')}&body=${m}`
    default: return null // copy_link handled by clipboard
  }
}
