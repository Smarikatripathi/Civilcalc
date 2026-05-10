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

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' '))
}

function parseHtmlTable(html?: string | null) {
  if (!html || !/<table/i.test(html)) return null

  const rowMatches = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? []
  const rows = rowMatches
    .map((row) => {
      const cells = row.match(/<(td|th)[^>]*>[\s\S]*?<\/(td|th)>/gi) ?? []
      return cells.map(stripTags).filter(Boolean)
    })
    .filter((row) => row.length > 0)

  if (!rows.length) return null

  return {
    headers: rows[0],
    rows: rows.slice(1),
  }
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
    <div className="min-h-screen bg-[#111111] text-white">
      <main className="mx-auto max-w-[1260px] px-6 py-10 font-sans">
      <div className="mb-8">
        <Link
          href={`/resources/${resource.slug}` as any}
          className="mb-6 inline-flex h-[52px] items-center rounded-xl border border-[#334155] bg-[#171717] px-5 text-lg font-semibold text-white transition-colors hover:bg-[#1f2937]"
        >
          &larr; Back
        </Link>
        <h1 className="mb-3 text-[40px] font-bold leading-tight tracking-tight text-white">
          {section.title}
        </h1>
        <p className="mb-6 text-[22px] text-[#b8c3d4]">
          {resource.title}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <input
            placeholder="Search chapters, formulas, MCQs..."
            className="h-[60px] min-w-[250px] flex-1 rounded-2xl border-2 border-[#334155] bg-[#1e1e1e] px-5 text-lg text-white placeholder:text-[#b8c3d4] transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {downloadUrl ? (
            <a
              href={downloadUrl}
              download
              className="inline-flex h-[56px] items-center gap-2 rounded-2xl bg-[#2f80ed] px-6 text-lg font-semibold text-white transition-colors hover:bg-[#1f6fd8]"
            >
              <span aria-hidden="true">📄</span> Download PDF
            </a>
          ) : (
            <span className="inline-flex h-[56px] items-center gap-2 rounded-2xl bg-[#2f80ed] px-6 text-lg font-semibold text-white opacity-60">
              <span aria-hidden="true">📄</span> Download PDF
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-7 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-[#334155] bg-[#1e293b] p-5 shadow-sm">
            <div className="mb-6 text-lg font-bold text-white">
              Chapters
            </div>
            <nav>
              <ul className="space-y-3">
                {chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <Link
                      href={`/resources/${resource.slug}/${section.slug}/${chapter.slug}` as any}
                      className={`block rounded px-3 py-2 text-lg leading-6 transition ${
                        selectedChapterSlug === chapter.slug
                          ? 'bg-[#233a5b] text-[#2f80ed]'
                          : 'text-[#cbd5e1] hover:bg-[#233a5b] hover:text-[#2f80ed]'
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
            <div className="rounded-2xl border border-[#334155] bg-[#151515] p-5">
              <p className="whitespace-pre-line text-lg leading-8 text-[#cbd5e1]">
                {section.description}
              </p>
            </div>
          )}

          {!selectedChapter && (
            <>
              <ContentBlocks blocks={searchedBlocks} study />
              <LegacyFiles files={legacyFiles} study />
              <Questions questions={searchedQuestions} study />
            </>
          )}

          {shownChapters.map((chapter) => (
            <ChapterContent key={chapter.id} chapter={chapter} study />
          ))}

          {!hasContent && (
            <p className="text-sm text-[#cbd5e1]">
              No content found. Add chapters, formulas, PDFs, notes, and MCQs
              from the admin panel.
            </p>
          )}
        </article>
      </div>
      </main>
    </div>
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

function ChapterContent({
  chapter,
  light = false,
  study = false,
}: {
  chapter: any
  light?: boolean
  study?: boolean
}) {
  if (study) {
    return (
      <article className="space-y-6">
        <div className="rounded-2xl border border-[#334155] bg-[#111111] px-5 py-6">
          <h2 className="text-[31px] font-bold leading-tight text-white">
            {chapter.title}
          </h2>
        </div>
        {chapter.description && (
          <p className="whitespace-pre-line text-lg leading-8 text-[#cbd5e1]">
            {chapter.description}
          </p>
        )}
        <ContentBlocks blocks={chapter.content_blocks ?? []} study />
        <Questions questions={chapter.questions ?? []} study />
      </article>
    )
  }

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

function ContentBlocks({
  blocks,
  light = false,
  study = false,
}: {
  blocks: any[]
  light?: boolean
  study?: boolean
}) {
  if (!blocks.length) return null

  return (
    <div className={study ? 'space-y-6' : 'mt-6 space-y-4'}>
      {blocks.map((block) => {
        const fileUrl = getFileUrl(block.file_url ?? block.external_url)
        const parsedTable = study ? parseHtmlTable(block.body) : null

        if (study) {
          return (
            <div key={block.id} className="space-y-4">
              <h3 className="text-2xl font-bold text-white">{block.title}</h3>
              {parsedTable ? (
                <StudyTable table={parsedTable} />
              ) : block.body ? (
                <div
                  className="resource-content resource-content-study text-lg leading-8 text-[#e2e8f0]"
                  dangerouslySetInnerHTML={{ __html: block.body }}
                />
              ) : null}
              {fileUrl && (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-[#2f80ed] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f6fd8]"
                  >
                    Open
                  </a>
                  <a
                    href={fileUrl}
                    download
                    className="rounded-xl border border-[#334155] px-4 py-2 text-sm font-semibold text-[#cbd5e1] hover:bg-[#1e293b]"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          )
        }

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

function StudyTable({
  table,
}: {
  table: { headers: string[]; rows: string[][] }
}) {
  const headers = table.headers.slice(0, 2)

  return (
    <div className="overflow-hidden rounded-xl border border-[#334155] bg-[#1e293b] p-5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-lg">
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="border border-[#48617f] bg-[#24459b] px-4 py-4 font-bold uppercase text-white"
                >
                  {header}
                </th>
              ))}
              <th className="w-[180px] border border-[#48617f] bg-[#24459b] px-4 py-4 font-bold uppercase text-white">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => (
              <tr
                key={`${row.join('-')}-${index}`}
                className={index % 2 === 0 ? 'bg-[#1e293b]' : 'bg-[#111827]'}
              >
                {headers.map((_, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border border-[#48617f] px-4 py-4 align-top text-white"
                  >
                    {row[cellIndex] ?? ''}
                  </td>
                ))}
                <td className="border border-[#48617f] p-2 align-top">
                  <textarea
                    aria-label="Add notes"
                    placeholder="Add notes..."
                    className="min-h-[74px] w-full resize-y rounded border border-[#48617f] bg-[#0f172a] p-3 text-base text-white placeholder:text-[#b8c3d4] focus:border-[#2f80ed] focus:outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LegacyFiles({
  files,
  light = false,
  study = false,
}: {
  files: any[]
  light?: boolean
  study?: boolean
}) {
  if (!files.length) return null

  return (
    <div className="mt-6 space-y-4">
      {files.map((file) => {
        const fileUrl = getFileUrl(file.file_url ?? file.url)

        if (study) {
          return (
            <div
              key={file.id}
              className="rounded-2xl border border-[#334155] bg-[#151515] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2f80ed]">
                {file.type}
              </p>
              <h4 className="mt-2 text-lg font-semibold text-white">
                {file.title}
              </h4>
              {fileUrl && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-[#2f80ed] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f6fd8]"
                  >
                    View
                  </a>
                  <a
                    href={fileUrl}
                    download
                    className="rounded-xl border border-[#334155] px-4 py-2 text-sm font-semibold text-[#cbd5e1] hover:bg-[#1e293b]"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          )
        }

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

function Questions({
  questions,
  light = false,
  study = false,
}: {
  questions: any[]
  light?: boolean
  study?: boolean
}) {
  if (!questions.length) return null

  return (
    <div className={study ? 'space-y-4' : 'mt-6 space-y-4'}>
      <h3
        className={`text-lg font-semibold ${
          study
            ? 'text-2xl font-bold text-white'
            : light
              ? 'text-slate-950 dark:text-slate-100'
              : 'text-slate-100'
        }`}
      >
        MCQ Questions
      </h3>
      {questions.map((question) => (
        <MCQQuestion
          key={question.id}
          question={question}
          light={light}
          study={study}
        />
      ))}
    </div>
  )
}

function MCQQuestion({
  question,
  light = false,
  study = false,
}: {
  question: any
  light?: boolean
  study?: boolean
}) {
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
        study
          ? 'border-[#334155] bg-[#151515]'
          : light
          ? 'border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
          : 'border-slate-800 bg-slate-950/60'
      }`}
    >
      <p
        className={`mb-4 font-medium ${
          study
            ? 'text-white'
            : light
              ? 'text-slate-950 dark:text-slate-100'
              : 'text-slate-100'
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
                : study
                  ? 'border-[#334155] bg-[#0f172a] text-[#cbd5e1] hover:border-[#2f80ed]'
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
