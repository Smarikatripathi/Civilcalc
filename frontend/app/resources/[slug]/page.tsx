import { notFound } from 'next/navigation'
import ResourceDetailContent from '../../../components/resources/resource-detail'
import { getResourceBySlug } from '../../../lib/resources-api'

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const resource = await getResourceBySlug(slug)

  if (!resource) {
    notFound()
  }

  return <ResourceDetailContent resource={resource} />
}
