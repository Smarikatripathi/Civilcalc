import { notFound } from 'next/navigation'
import ResourceDetailContent from '../../../../../components/resources/resource-detail'
import { getResourceBySlug } from '../../../../../lib/resources-api'

export default async function ResourceChapterPage({
  params,
}: {
  params: Promise<{ slug: string; sectionSlug: string; chapterSlug: string }>
}) {
  const { slug, sectionSlug, chapterSlug } = await params
  const resource = await getResourceBySlug(slug)

  if (!resource) {
    notFound()
  }

  const section = resource.subitems?.find(
    (item: any) => item.slug === sectionSlug
  )
  const chapterExists = section?.chapters?.some(
    (chapter: any) => chapter.slug === chapterSlug
  )

  if (!section || !chapterExists) {
    notFound()
  }

  return (
    <ResourceDetailContent
      resource={resource}
      selectedSubitemSlug={sectionSlug}
      selectedChapterSlug={chapterSlug}
    />
  )
}
