import ResourceExplorer from '../../components/resources/resource-explorer'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

async function getResources() {
  const res = await fetch(`${BACKEND_URL}/api/resources/`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch resources')
  }

  return res.json()
}

export default async function ResourcesPage() {
  const resources = await getResources()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-white">
      <section className="max-w-7xl mx-auto px-6 py-16">
        <ResourceExplorer initialResources={resources} />
      </section>
    </div>
  )
}
