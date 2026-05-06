import Link from 'next/link'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

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

async function getResourceDetail(category: string, sub: string) {
  const res = await fetch(`${BACKEND_URL}/api/resources/${category}/${sub}/`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Resource not found')
  }
  return res.json()
}

function getFileUrl(url?: string) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${BACKEND_URL}${url}`
}

export default async function ResourceDetailPage({ params }: { params: { category: string; sub: string } }) {
  const resource = await getResourceDetail(params.category, params.sub)
  const pdfUrl = getFileUrl(resource.pdf_file)

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/resources" className="text-sky-400 hover:text-sky-300">
        ← Back to resources
      </Link>

      <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-sky-400">{categoryLabels[resource.category] ?? resource.category}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-100">{resource.title}</h1>
            <div className="mt-4 text-slate-400 leading-7" dangerouslySetInnerHTML={{ __html: resource.description || '' }} />
          </div>

          <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-sm text-slate-300">
            <div>
              <span className="block text-slate-500">Region</span>
              <p className="mt-1 text-slate-100">{regionLabels[resource.region] ?? resource.region}</p>
            </div>
            <div>
              <span className="block text-slate-500">Published</span>
              <p className="mt-1 text-slate-100">{new Date(resource.updated_at).toLocaleDateString()}</p>
            </div>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                Download PDF
              </a>
            )}
            {resource.link && (
              <a
                href={resource.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full justify-center rounded-2xl border border-slate-700 bg-transparent px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-500/60 hover:text-sky-300"
              >
                Visit resource link
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-6">
        {resource.subitems?.length ? (
          resource.subitems.map((subitem: any) => (
            <div key={subitem.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-100">{subitem.title}</h2>
                  {subitem.description && <p className="mt-2 text-slate-400">{subitem.description}</p>}
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">
                  {subitem.files?.length ?? 0} files
                </span>
              </div>

              {subitem.files?.length ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {subitem.files.map((file: any) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 transition hover:border-sky-500/40 hover:bg-slate-900"
                    >
                      <div className="text-sm uppercase tracking-[0.3em] text-slate-400">{file.type}</div>
                      <h3 className="mt-3 text-lg font-semibold text-slate-100">{file.title}</h3>
                      <p className="mt-2 text-slate-500 line-clamp-2">{file.url}</p>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-slate-400">No files attached to this item yet.</p>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-slate-400">
            No subitems found for this resource.
          </div>
        )}
      </div>
    </section>
  )
}
  