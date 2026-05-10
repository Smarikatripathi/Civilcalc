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
  summary: 'Summary',
  table: 'Study Table',
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
  const [sectionSearch, setSectionSearch] = useState('')

  const showSectionIndex =
    resource.content_mode === 'sections' && sections.length > 0 && !selectedSection

  const pdfUrl = getFileUrl(resource.pdf_url ?? resource.pdf_file)
  const thumbnailUrl = getFileUrl(resource.thumbnail_url ?? resource.thumbnail)

  if (selectedSection) {
    return (
      <SectionStudyPage
        resource={resource}
        section={selectedSection}
        chapters={visibleChapters}
        selectedChapter={selectedChapter}
        selectedChapterSlug={selectedChapterSlug}
        search={sectionSearch}
        onSearchChange={setSectionSearch}
      />
    )
  }

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

function matchesSearch(value: string | null | undefined, search: string) {
  if (!search.trim()) return true
  return (value ?? '').toLowerCase().includes(search.trim().toLowerCase())
}

function chapterMatchesSearch(chapter: any, search: string) {
  if (!search.trim()) return true
  if (
    matchesSearch(chapter.title, search) ||
    matchesSearch(chapter.description, search)
  ) {
    return true
  }

  const blocks = chapter.content_blocks ?? []
  const questions = chapter.questions ?? []

  return (
    blocks.some(
      (block: any) =>
        matchesSearch(block.title, search) || matchesSearch(block.body, search)
    ) ||
    questions.some((question: any) =>
      matchesSearch(question.question_text, search)
    )
  )
}

function SectionStudyPage({
  resource,
  section,
  chapters,
  selectedChapter,
  selectedChapterSlug,
  search,
  onSearchChange,
}: {
  resource: any
  section: any
  chapters: any[]
  selectedChapter: any
  selectedChapterSlug?: string | null
  search: string
  onSearchChange: (value: string) => void
}) {
  const rootBlocks = section.content_blocks ?? []
  const legacyFiles = section.files ?? []
  const legacyQuestions = section.questions ?? []
  const downloadUrl = getSectionDownloadUrl(section)
  const searchedBlocks = rootBlocks.filter(
    (block: any) =>
      matchesSearch(block.title, search) || matchesSearch(block.body, search)
  )
  const searchedQuestions = legacyQuestions.filter((question: any) =>
    matchesSearch(question.question_text, search)
  )
  const shownChapters = (selectedChapter ? [selectedChapter] : chapters).filter(
    (chapter: any) => chapterMatchesSearch(chapter, search)
  )
  const hasContent =
    shownChapters.length > 0 ||
    searchedBlocks.length > 0 ||
    legacyFiles.length > 0 ||
    searchedQuestions.length > 0

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 font-sans">
      <div className="mb-6">
        <Link
          href={`/resources/${resource.slug}` as any}
          className="mb-4 inline-block rounded-xl border border-slate-200/20 bg-white px-4 py-2 font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          &larr; Back
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-slate-950 dark:text-slate-100">
          {section.title}
        </h1>
        <p className="mb-4 text-slate-600 dark:text-slate-400">
          {resource.title}
        </p>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            placeholder="Search chapters, formulas, MCQs..."
            className="min-w-[250px] flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {downloadUrl ? (
            <a
              href={downloadUrl}
              download
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-700"
            >
              Download PDF
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-500">
              Download PDF
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 text-sm font-semibold text-slate-950 dark:text-slate-100">
              Chapters
            </div>
            <nav>
              <ul className="space-y-1">
                {chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <Link
                      href={`/resources/${resource.slug}/${section.slug}/${chapter.slug}` as any}
                      className={`block rounded-lg px-3 py-2 text-sm transition ${
                        selectedChapterSlug === chapter.slug
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      {chapter.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <article className="space-y-6">
          {section.description && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="whitespace-pre-line leading-7 text-slate-700 dark:text-slate-300">
                {section.description}
              </p>
            </div>
          )}

          {!selectedChapter && (
            <>
              <ContentBlocks blocks={searchedBlocks} light />
              <LegacyFiles files={legacyFiles} light />
              <Questions questions={searchedQuestions} light />
            </>
          )}

          {shownChapters.map((chapter) => (
            <ChapterContent key={chapter.id} chapter={chapter} light />
          ))}

          {!hasContent && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No content found. Add chapters, formulas, PDFs, notes, and MCQs
              from the admin panel.
            </p>
          )}
        </article>
      </div>
    </main>
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
  const sectionDownloadUrl = selectedSection
    ? getSectionDownloadUrl(selectedSection)
    : getFileUrl(resource.pdf_url ?? resource.pdf_file)

  return (
    <section className="space-y-6">
      {selectedSection && (
        <SectionStudyHeader
          resource={resource}
          section={selectedSection}
          chapterCount={visibleChapters.length}
          blockCount={rootBlocks.length}
          questionCount={legacyQuestions.length}
          downloadUrl={sectionDownloadUrl}
        />
      )}

      {visibleChapters.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <ChapterNavigation
            resource={resource}
            section={selectedSection}
            chapters={visibleChapters}
            selectedChapter={selectedChapter}
          />
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
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
            <AdminEmptyState section={selectedSection} />
          )}
      </div>
    </section>
  )
}

function SectionStudyHeader({
  resource,
  section,
  chapterCount,
  blockCount,
  questionCount,
  downloadUrl,
}: {
  resource: any
  section: any
  chapterCount: number
  blockCount: number
  questionCount: number
  downloadUrl: string | null
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
        Study Section
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-100">
        {section.title}
      </h2>
      {section.description && (
        <p className="mt-4 whitespace-pre-line leading-7 text-slate-400">
          {section.description}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SectionStat label="Chapters" value={chapterCount} />
        <SectionStat label="Study Blocks" value={blockCount} />
        <SectionStat label="MCQs" value={questionCount} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/resources/${resource.slug}/${section.slug}` as any}
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
}

function SectionStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-2xl font-semibold text-slate-100">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
    </div>
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
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400">
        Table of Contents
      </p>
      <h3 className="mt-2 text-lg font-semibold text-slate-100">Chapters</h3>
      <div className="mt-4 grid gap-2">
        {chapters.map((chapter) => {
          const href = section
            ? `/resources/${resource.slug}/${section.slug}/${chapter.slug}`
            : `/resources/${resource.slug}`

          return (
            <Link
              key={chapter.id}
              href={href as any}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                selectedChapter?.id === chapter.id
                  ? 'border-sky-500 bg-sky-500 text-slate-950'
                  : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-sky-500/50'
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

function ChapterContent({ chapter, light = false }: { chapter: any; light?: boolean }) {
  return (
    <article
      className={`mt-6 rounded-2xl border p-5 first:mt-0 ${
        light
          ? 'border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
          : 'border-slate-800 bg-slate-950/40'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">
        Chapter
      </p>
      <h3
        className={`mt-2 text-2xl font-semibold ${
          light ? 'text-slate-950 dark:text-slate-100' : 'text-slate-100'
        }`}
      >
        {chapter.title}
      </h3>
      {chapter.description && (
        <p
          className={`mt-3 whitespace-pre-line leading-7 ${
            light ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'
          }`}
        >
          {chapter.description}
        </p>
      )}
      <ContentBlocks blocks={chapter.content_blocks ?? []} light={light} />
      <Questions questions={chapter.questions ?? []} light={light} />
    </article>
  )
}

function ContentBlocks({ blocks, light = false }: { blocks: any[]; light?: boolean }) {
  if (!blocks.length) return null

  return (
    <div className="mt-6 space-y-4">
      {blocks.map((block) => {
        const fileUrl = getFileUrl(block.file_url ?? block.external_url)

        return (
          <div
            key={block.id}
            className={`rounded-2xl border p-5 ${
              light
                ? 'border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
                : 'border-slate-800 bg-slate-950/60'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">
              {blockLabels[block.block_type] ?? block.block_type}
            </p>
            <h4
              className={`mt-2 text-lg font-semibold ${
                light ? 'text-slate-950 dark:text-slate-100' : 'text-slate-100'
              }`}
            >
              {block.title}
            </h4>
            {block.body && (
              <div
                className={`resource-content mt-3 leading-7 ${
                  light ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300'
                }`}
                dangerouslySetInnerHTML={{ __html: block.body }}
              />
            )}
            {fileUrl && (
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
                >
                  Open
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

function LegacyFiles({ files, light = false }: { files: any[]; light?: boolean }) {
  if (!files.length) return null

  return (
    <div className="mt-6 space-y-4">
      {files.map((file) => {
        const fileUrl = getFileUrl(file.file_url ?? file.url)

        return (
          <div
            key={file.id}
            className={`rounded-2xl border p-4 ${
              light
                ? 'border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
                : 'border-slate-800 bg-slate-950/60'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">
              {file.type}
            </p>
            <h4
              className={`mt-2 text-lg font-semibold ${
                light ? 'text-slate-950 dark:text-slate-100' : 'text-slate-100'
              }`}
            >
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

function AdminEmptyState({ section }: { section: any }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6">
      <h3 className="text-xl font-semibold text-slate-100">
        Add study content from admin
      </h3>
      <p className="mt-3 leading-7 text-slate-400">
        This section is connected to the backend. Add chapters, notes, formulas,
        PDFs, practice content, videos, and MCQs from the admin panel and they
        will appear here automatically.
      </p>
      {section && (
        <p className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm text-slate-400">
          Admin path: Sub items - {section.title} - add Chapters, Content
          blocks, Files, or Questions.
        </p>
      )}
    </div>
  )
}

function Questions({ questions, light = false }: { questions: any[]; light?: boolean }) {
  if (!questions.length) return null

  return (
    <div className="mt-6 space-y-4">
      <h3
        className={`text-lg font-semibold ${
          light ? 'text-slate-950 dark:text-slate-100' : 'text-slate-100'
        }`}
      >
        MCQ Questions
      </h3>
      {questions.map((question) => (
        <MCQQuestion key={question.id} question={question} light={light} />
      ))}
    </div>
  )
}

function MCQQuestion({ question, light = false }: { question: any; light?: boolean }) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const options = [
    { key: 'A', value: question.option_a },
    { key: 'B', value: question.option_b },
    { key: 'C', value: question.option_c },
    { key: 'D', value: question.option_d },
  ]

  return (
    <div
      className={`rounded-2xl border p-4 ${
        light
          ? 'border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
          : 'border-slate-800 bg-slate-950/60'
      }`}
    >
      <p
        className={`mb-4 font-medium ${
          light ? 'text-slate-950 dark:text-slate-100' : 'text-slate-100'
        }`}
      >
        {question.question_text}
      </p>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => setSelectedAnswer(option.key)}
            className={`w-full rounded-lg border p-3 text-left transition ${
              selectedAnswer === option.key
                ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                : light
                  ? 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300'
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
