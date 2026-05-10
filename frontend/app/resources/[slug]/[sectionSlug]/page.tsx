import { notFound } from 'next/navigation'
import ResourceDetailContent from '../../../../components/resources/resource-detail'
import { getResourceBySlug } from '../../../../lib/resources-api'

export default async function ResourceSectionPage({
  params,
}: {
  params: Promise<{ slug: string; sectionSlug: string }>
}) {
  const { slug, sectionSlug } = await params
  const resource = await getResourceBySlug(slug)

  if (!resource) {
    notFound()
  }

  const sectionExists = resource.subitems?.some(
    (section: any) => section.slug === sectionSlug
  )

  if (!sectionExists) {
    notFound()
  }

  return (
    <ResourceDetailContent
      resource={resource}
      selectedSubitemSlug={sectionSlug}
    />
  )
}
