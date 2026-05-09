'use client'

import Link from 'next/link'
import { useState } from 'react'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

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

function getFileUrl(url?: string) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${BACKEND_URL}${url}`
}

export default function ResourceDetailContent({
  resource,
  selectedSubitemSlug,
}: {
  resource: any
  selectedSubitemSlug?: string | null
}) {
  const [selectedSubitem, setSelectedSubitem] = useState(
    selectedSubitemSlug
      ? resource.subitems?.find((item: any) => item.slug === selectedSubitemSlug)
      : resource.subitems?.[0] || null
  )

  const pdfUrl = getFileUrl(resource.pdf_file)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Link href="/resources" className="text-sky-400 hover:text-sky-300">
          ← Back to Resources
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
            <p className="text-xs tracking-[0.35em] uppercase text-sky-400">
              {categoryLabels[resource.category] ?? resource.category}
            </p>

            <h1 className="mt-3 text-4xl font-bold">{resource.title}</h1>

            <div
              className="mt-5 text-slate-300 leading-7"
              dangerouslySetInnerHTML={{ __html: resource.description || '' }}
            />
          </div>

          {/* Sections Navigation */}
          {resource.subitems?.length > 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Sections</h2>
              <div className="flex flex-wrap gap-2">
                {resource.subitems.map((subitem: any) => (
                  <button
                    key={subitem.id}
                    onClick={() => setSelectedSubitem(subitem)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedSubitem?.id === subitem.id
                        ? 'bg-sky-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {subitem.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Section Content */}
          {selectedSubitem && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">
                {selectedSubitem.title}
              </h2>
              {selectedSubitem.description && (
                <div className="text-slate-400 mb-6 whitespace-pre-line">
                  {selectedSubitem.description}
                </div>
              )}

              {/* PDFs */}
              {selectedSubitem.files?.filter((file: any) => file.type === 'PDF').length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">📄 PDF Files</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedSubitem.files
                      .filter((file: any) => file.type === 'PDF')
                      .map((file: any) => (
                        <div key={file.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <p className="text-xs text-slate-500 uppercase mb-2">PDF</p>
                          <p className="font-medium mb-3">{file.title}</p>
                          <div className="flex gap-2">
                            <a
                              href={getFileUrl(file.url) ?? '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 text-center bg-sky-500 text-black font-semibold py-2 px-4 rounded-lg text-sm hover:bg-sky-400 transition"
                            >
                              View PDF
                            </a>
                            <a
                              href={getFileUrl(file.url) ?? '#'}
                              download
                              className="flex-1 text-center border border-slate-600 text-slate-300 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-800 transition"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Study Content */}
              {selectedSubitem.files?.filter((file: any) => file.type === 'NOTE').length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">📝 Study Content</h3>
                  <div className="space-y-4">
                    {selectedSubitem.files
                      .filter((file: any) => file.type === 'NOTE')
                      .map((file: any) => (
                        <div key={file.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <h4 className="font-medium text-slate-100 mb-2">{file.title}</h4>
                          <a
                            href={getFileUrl(file.url) ?? '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-400 hover:text-sky-300 text-sm"
                          >
                            View Content →
                          </a>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* MCQ Questions */}
              {selectedSubitem.questions?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">❓ MCQ Questions</h3>
                  <div className="space-y-4">
                    {selectedSubitem.questions.map((question: any) => (
                      <MCQQuestion key={question.id} question={question} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="sticky top-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
            <p className="text-sm text-slate-400">Region</p>
            <p className="font-semibold">
              {regionLabels[resource.region] ?? resource.region}
            </p>

            <p className="mt-4 text-sm text-slate-400">Updated</p>
            <p>{new Date(resource.updated_at).toLocaleDateString()}</p>

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
        </div>
      </div>
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
      <p className="font-medium text-slate-100 mb-4">{question.question_text}</p>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => setSelectedAnswer(option.key)}
            className={`w-full text-left p-3 rounded-lg border transition ${
              selectedAnswer === option.key
                ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
            }`}
          >
            <span className="font-semibold mr-2">{option.key}.</span>
            {option.value}
          </button>
        ))}
      </div>
      {selectedAnswer && (
        <button
          onClick={() => setShowAnswer(true)}
          className="mt-4 w-full bg-slate-700 text-slate-300 py-2 px-4 rounded-lg hover:bg-slate-600 transition"
        >
          Show Answer
        </button>
      )}
      {showAnswer && (
        <div className="mt-4 p-3 rounded-lg bg-slate-800/50">
          <p className="text-sm text-slate-400">
            Correct Answer: <span className="font-semibold text-green-400">{question.correct_answer}</span>
          </p>
        </div>
      )}
    </div>
  )
}
