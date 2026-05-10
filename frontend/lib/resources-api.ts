export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

export async function getResourceBySlug(slug: string) {
  const res = await fetch(`${BACKEND_URL}/api/resources/slug/${slug}/`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    return null
  }

  return res.json()
}
