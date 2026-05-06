import ResourceExplorer from '../../components/resources/resource-explorer'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

async function getResources() {
  const res = await fetch(`${BACKEND_URL}/api/resources/`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to fetch resources')
  }
  return res.json()
}

export default async function ResourcesPage() {
  const resources = await getResources()

  return <ResourceExplorer initialResources={resources} />
}
