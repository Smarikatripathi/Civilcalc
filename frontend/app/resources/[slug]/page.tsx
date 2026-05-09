'use client'

import { useEffect, useState } from 'react'
import ResourceDetailContent from '../../../components/resources/resource-detail'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

export default function ResourceDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const [resource, setResource] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`http://localhost:8000/api/resources/slug/pokhara-university-entrance-msc-structure-2025/`)
      .then(res => {
        console.log('Response status:', res.status)
        console.log('Response headers:', res.headers)
        return res.text()
      })
      .then(text => {
        console.log('Response text:', text.substring(0, 200))
        try {
          const data = JSON.parse(text)
          console.log('Parsed data:', data)
          setResource(data)
        } catch (e) {
          console.error('JSON parse error:', e)
          setError('Invalid response format')
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Fetch error:', err)
        setError('Failed to load resource')
        setLoading(false)
      })
  }, [])

  console.log('Render state:', { loading, error, hasResource: !!resource })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading resource...</p>
        </div>
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Resource Not Found</h1>
          <p className="text-slate-400 mb-8">The resource you're looking for doesn't exist or failed to load.</p>
          <a href="/resources" className="text-sky-400 hover:text-sky-300">
            ← Back to Resources
          </a>
        </div>
      </div>
    )
  }

  return <ResourceDetailContent resource={resource} />
}