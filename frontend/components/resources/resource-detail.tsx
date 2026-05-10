'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { BACKEND_URL } from '../../lib/resources-api'

const categoryLabels: Record<string, string> = {
  codes: 'Codes',
  district_rates: 'District Rates',
  rules: 'Rules and Regulations',
  notes: 'Notes',
  blogs: 'Blogs',
}

const regionLabels: Record<string, string> = {
  nepal: 'Nepal',
  india: 'India',
  us: 'US',
  europe: 'Europe',
  other: 'Other Regions',
}

const blockLabels: Record<string, string> = {
  note: 'Notes',
  formula: 'Important Formulas',
  pdf: 'PDF',
  embed: 'Study Material',
  practice: 'Practice Questions',
  video: 'Video',
}

function getFileUrl(url?: string | null) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${BACKEND_URL}${url}`
}

function stripHtml(text?: string | null) {
  return text?.replace(/<[^>]+>/g, '').trim() ?? ''
}

function getSectionDownloadUrl(section: any) {
  const legacyPdf = section.files?.find((file: any) => file.type === 'PDF')
  if (legacyPdf) {
    return getFileUrl(legacyPdf.file_url ?? legacyPdf.url)
  }

  const pdfBlock = section.content_blocks?.find(
    (block: any) => block.block_type === 'pdf'
  )
  if (pdfBlock) {
    return getFileUrl(pdfBlock.file_url ?? pdfBlock.external_url)
  }

  const chapterPdfBlock = section.chapters
    ?.flatMap((chapter: any) => chapter.content_blocks ?? [])
    .find((block: any) => block.block_type === 'pdf')

  return getFileUrl(chapterPdfBlock?.file_url ?? chapterPdfBlock?.external_url)
}

export default function ResourceDetailContent({
  resource,
  selectedSubitemSlug,
  selectedChapterSlug,
}: {
  resource: any
  selectedSubitemSlug?: string | null
  selectedChapterSlug?: string | null
}) {
  const sections = resource.subitems ?? []
  const selectedSection = selectedSubitemSlug
    ? sections.find((item: any) => item.slug === selectedSubitemSlug)
    : null

  const visibleChapters = useMemo(() => {
    if (selectedSection) return selectedSection.chapters ?? []
    return (resource.chapters ?? []).filter((chapter: any) => !chapter.section)
  }, [resource.chapters, selectedSection])

  const selectedChapter = selectedChapterSlug
    ? visibleChapters.find((chapter: any) => chapter.slug === selectedChapterSlug)
    : null

  const showSectionIndex =
    resource.content_mode === 'sections' && sections.length > 0 && !selectedSection

  const pdfUrl = getFileUrl(resource.pdf_url ?? resource.pdf_file)
  const thumbnailUrl = getFileUrl(resource.thumbnail_url ?? resource.thumbnail)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Link href="/resources" className="text-sky-400 hover:text-sky-300">
          Back to Resources
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16 grid lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 space-y-6">
          <ResourceHeader resource={resource} thumbnailUrl={thumbnailUrl} />

          {showSectionIndex ? (
            <SectionIndex resource={resource} sections={sections} />
          ) : (
            <LearningView
              resource={resource}
              selectedSection={selectedSection}
              selectedChapter={selectedChapter}
              visibleChapters={visibleChapters}
            />
          )}
        </main>

        <aside className="space-y-4">
          <div className="sticky top-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <p className="text-sm text-slate-400">Region</p>
            <p className="font-semibold">
              {regionLabels[resource.region] ?? resource.region}
            </p>

            <p className="mt-4 text-sm text-slate-400">Updated</p>
            <p>{new Date(resource.updated_at).toLocaleDateString()}</p>

            {resource.content_mode === 'sections' && sections.length > 0 && (
              <>
                <p className="mt-6 text-sm text-slate-400">Sections</p>
                <div className="mt-3 space-y-2">
                  {sections.map((section: any) => (
                    <Link
                      key={section.id}
                      href={`/resources/${resource.slug}/${section.slug}`}
                      className={`block rounded-xl px-3 py-2 text-sm transition ${
                        selectedSection?.id === section.id
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {section.title}
                    </Link>
                  ))}
                </div>
              </>
            )}

            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 block text-center bg-sky-500 text-black font-semibold py-3 rounded-2xl"
              >
                Download PDF
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function ResourceHeader({
  resource,
  thumbnailUrl,
}: {
  resource: any
  thumbnailUrl: string | null
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={resource.title}
          className="mb-6 aspect-video w-full rounded-xl object-cover"
        />
      )}

      <p className="text-xs tracking-[0.3em] uppercase text-sky-400">
        {categoryLabels[resource.category] ?? resource.category}
      </p>

      <h1 className="mt-3 text-3xl sm:text-4xl font-bold">{resource.title}</h1>

      <div
        className="mt-5 text-slate-300 leading-7"
        dangerouslySetInnerHTML={{ __html: resource.description || '' }}
      />
    </section>
  )
}

function SectionIndex({ resource, sections }: { resource: any; sections: any[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {sections.map((section) => {
        const sectionHref = `/resources/${resource.slug}/${section.slug}`
        const downloadUrl = getSectionDownloadUrl(section)

        return (
          <div
            key={section.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"
          >
            <div className="flex items-start gap-3">
              {section.icon && (
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-sm">
                  {section.icon}
                </span>
              )}
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-slate-100">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Opens section page
                </p>
                {section.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                    {stripHtml(section.description)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={sectionHref as any}
                className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
              >
                Open
              </Link>
              {downloadUrl ? (
                <a
                  href={downloadUrl}
                  download
                  className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Download
                </a>
              ) : (
                <span className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-600">
                  Download
                </span>
              )}
            </div>
          </div>
        )
      })}
    </section>
  )
}

function LearningView({
  resource,
  selectedSection,
  selectedChapter,
  visibleChapters,
}: {
  resource: any
  selectedSection: any
  selectedChapter: any
  visibleChapters: any[]
}) {
  const rootBlocks = selectedSection
    ? selectedSection.content_blocks ?? []
    : resource.content_blocks ?? []
  const legacyFiles = selectedSection?.files ?? []
  const legacyQuestions = selectedSection?.questions ?? []
  const activeChapters = selectedChapter ? [selectedChapter] : visibleChapters

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      {selectedSection && (
        <div className="mb-6 border-b border-slate-800 pb-6">
          <p className="text-xs tracking-[0.28em] uppercase text-sky-400">Section</p>
          <h2 className="mt-2 text-2xl font-semibold">{selectedSection.title}</h2>
          {selectedSection.description && (
            <p className="mt-3 whitespace-pre-line text-slate-400">
              {selectedSection.description}
            </p>
          )}
        </div>
      )}

      {visibleChapters.length > 0 && (
        <ChapterNavigation
          resource={resource}
          section={selectedSection}
          chapters={visibleChapters}
          selectedChapter={selectedChapter}
        />
      )}

      {!selectedChapter && (
        <>
          <ContentBlocks blocks={rootBlocks} />
          <LegacyFiles files={legacyFiles} />
          <Questions questions={legacyQuestions} />
        </>
      )}

      {activeChapters.map((chapter) => (
        <ChapterContent key={chapter.id} chapter={chapter} />
      ))}

      {!rootBlocks.length &&
        !legacyFiles.length &&
        !legacyQuestions.length &&
        !activeChapters.length && (
          <p className="text-slate-400">
            Content for this resource has not been added from the admin panel yet.
          </p>
        )}
    </section>
  )
}

function ChapterNavigation({
  resource,
  section,
  chapters,
  selectedChapter,
}: {
  resource: any
  section: any
  chapters: any[]
  selectedChapter: any
}) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-lg font-semibold">Chapters</h3>
      <div className="flex flex-wrap gap-2">
        {chapters.map((chapter) => {
          const href = section
            ? `/resources/${resource.slug}/${section.slug}/${chapter.slug}`
            : `/resources/${resource.slug}`

          return (
            <Link
              key={chapter.id}
              href={href as any}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedChapter?.id === chapter.id
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {chapter.title}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function ChapterContent({ chapter }: { chapter: any }) {
  return (
    <article className="mt-6 border-t border-slate-800 pt-6 first:mt-0 first:border-t-0 first:pt-0">
      <h3 className="text-2xl font-semibold">{chapter.title}</h3>
      {chapter.description && (
        <p className="mt-3 whitespace-pre-line text-slate-400">
          {chapter.description}
        </p>
      )}
      <ContentBlocks blocks={chapter.content_blocks ?? []} />
      <Questions questions={chapter.questions ?? []} />
    </article>
  )
}

function ContentBlocks({ blocks }: { blocks: any[] }) {
  if (!blocks.length) return null

  return (
    <div className="mt-6 space-y-4">
      {blocks.map((block) => {
        const fileUrl = getFileUrl(block.file_url ?? block.external_url)

        return (
          <div
            key={block.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400">
              {blockLabels[block.block_type] ?? block.block_type}
            </p>
            <h4 className="mt-2 text-lg font-semibold text-slate-100">
              {block.title}
            </h4>
            {block.body && (
              <div
                className="mt-3 leading-7 text-slate-300"
                dangerouslySetInnerHTML={{ __html: block.body }}
              />
            )}
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
              >
                Open
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}

function LegacyFiles({ files }: { files: any[] }) {
  if (!files.length) return null

  return (
    <div className="mt-6 space-y-4">
      {files.map((file) => {
        const fileUrl = getFileUrl(file.file_url ?? file.url)

        return (
          <div
            key={file.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400">
              {file.type}
            </p>
            <h4 className="mt-2 text-lg font-semibold text-slate-100">
              {file.title}
            </h4>
            {fileUrl && (
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
                >
                  View
                </a>
                <a
                  href={fileUrl}
                  download
                  className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Questions({ questions }: { questions: any[] }) {
  if (!questions.length) return null

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-slate-100">MCQ Questions</h3>
      {questions.map((question) => (
        <MCQQuestion key={question.id} question={question} />
      ))}
    </div>
  )
}

function MCQQuestion({ question }: { question: any }) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const options = [
    { key: 'A', value: question.option_a },
    { key: 'B', value: question.option_b },
    { key: 'C', value: question.option_c },
    { key: 'D', value: question.option_d },
  ]

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="mb-4 font-medium text-slate-100">{question.question_text}</p>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => setSelectedAnswer(option.key)}
            className={`w-full rounded-lg border p-3 text-left transition ${
              selectedAnswer === option.key
                ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
            }`}
          >
            <span className="mr-2 font-semibold">{option.key}.</span>
            {option.value}
          </button>
        ))}
      </div>

      {selectedAnswer && (
        <button
          onClick={() => setShowAnswer(true)}
          className="mt-4 w-full rounded-lg bg-slate-700 px-4 py-2 text-slate-300 transition hover:bg-slate-600"
        >
          Show Answer
        </button>
      )}

      {showAnswer && (
        <div className="mt-4 rounded-lg bg-slate-800/50 p-3">
          <p className="text-sm text-slate-400">
            Correct Answer:{' '}
            <span className="font-semibold text-green-400">
              {question.correct_answer}
            </span>
          </p>
          {question.explanation && (
            <p className="mt-2 text-sm text-slate-300">{question.explanation}</p>
          )}
        </div>
      )}
    </div>
  )
}
