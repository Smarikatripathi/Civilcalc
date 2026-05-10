'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { BACKEND_URL } from '../../lib/resources-api'

export type ResourceItem = {
  id: number
  slug: string
  title: string
  description: string
  category: string
  region: string
  updated_at: string
  thumbnail_url?: string | null
  thumbnail?: string | null
  sub_items_count?: number
  subitems?: { id: number; slug?: string; title: string }[]
}

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

const categoryStyles: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  codes: { label: 'Codes', color: 'bg-sky-500 text-slate-950', icon: '📘' },
  district_rates: { label: 'District Rates', color: 'bg-orange-500 text-slate-950', icon: '🏷️' },
  rules: { label: 'Rules & Regulations', color: 'bg-fuchsia-500 text-slate-950', icon: '📜' },
  notes: { label: 'Notes', color: 'bg-amber-500 text-slate-950', icon: '📝' },
  blogs: { label: 'Blogs', color: 'bg-pink-500 text-slate-950', icon: '📰' },
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'a-z', label: 'A-Z' },
  { value: 'z-a', label: 'Z-A' },
]

interface Props {
  initialResources: ResourceItem[]
  title?: string
  description?: string
  hideCategoryPills?: boolean
  hideHeader?: boolean
}

export default function ResourceExplorer({
  initialResources,
  title = 'Engineering Resources',
  description = 'Access comprehensive civil engineering resources including codes, standards, rates, and industry guidelines from around the world.',
  hideCategoryPills = false,
  hideHeader = false,
}: Props) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [sort, setSort] = useState('newest')

  const categories = useMemo(() => ['codes', 'district_rates', 'rules', 'notes', 'blogs'], [])

  const regions = useMemo(() => ['nepal', 'india', 'us', 'europe', 'other'], [])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      codes: 0,
      district_rates: 0,
      rules: 0,
      notes: 0,
      blogs: 0,
    }
    initialResources.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1
    })
    return counts
  }, [initialResources])

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {
      nepal: 0,
      india: 0,
      us: 0,
      europe: 0,
      other: 0,
    }
    initialResources.forEach((item) => {
      counts[item.region] = (counts[item.region] || 0) + 1
    })
    return counts
  }, [initialResources])

  const stripHtml = (text: string) => text.replace(/<[^>]+>/g, '').trim()
  const getFileUrl = (url?: string | null) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${BACKEND_URL}${url}`
  }

  const filtered = useMemo(() => {
    return [...initialResources]
      .filter((item) => {
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
        if (selectedRegion !== 'all' && item.region !== selectedRegion) return false
        if (!search.trim()) return true
        const searchValue = search.toLowerCase()
        return (
          item.title.toLowerCase().includes(searchValue) ||
          item.description.toLowerCase().includes(searchValue) ||
          item.category.toLowerCase().includes(searchValue) ||
          item.region.toLowerCase().includes(searchValue)
        )
      })
      .sort((a, b) => {
        if (sort === 'oldest') return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        if (sort === 'a-z') return a.title.localeCompare(b.title)
        if (sort === 'z-a') return b.title.localeCompare(a.title)
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      })
  }, [initialResources, selectedCategory, selectedRegion, search, sort])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {!hideHeader && (
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
            {title}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-8">
            {description}
          </p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div className="relative">
          <label htmlFor="resource-search" className="sr-only">Search resources</label>
          <input
            id="resource-search"
            className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="Search everything: NBC 105, Kathmandu rates, IS 456, ACI 318..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <label htmlFor="resource-sort" className="text-sm text-slate-500 dark:text-slate-400">Sort by</label>
            <select
              id="resource-sort"
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-950 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} resources found</div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {!hideCategoryPills && (
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedCategory === 'all' ? 'bg-sky-500 text-slate-950' : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-0 dark:hover:bg-slate-700'}`}
              onClick={() => setSelectedCategory('all')}
            >
              All {initialResources.length}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedCategory === category ? 'bg-sky-500 text-slate-950' : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-0 dark:hover:bg-slate-700'}`}
                onClick={() => setSelectedCategory(category)}
              >
                <span>{categoryLabels[category] ?? category}</span>
                <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-semibold text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  {categoryCounts[category]}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedRegion === 'all' ? 'bg-sky-500 text-slate-950' : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-0 dark:hover:bg-slate-700'}`}
            onClick={() => setSelectedRegion('all')}
          >
            All {initialResources.length}
          </button>
          {regions.map((region) => (
            <button
              key={region}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedRegion === region ? 'bg-sky-500 text-slate-950' : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-0 dark:hover:bg-slate-700'}`}
              onClick={() => setSelectedRegion(region)}
            >
              <span>{regionLabels[region] ?? region}</span>
              <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-semibold text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                {regionCounts[region]}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((resource) => {
          const categoryStyle = categoryStyles[resource.category] ?? {
            label: categoryLabels[resource.category] ?? resource.category,
            color: 'bg-slate-700 text-white',
            icon: '📁',
          }
          const itemCount = resource.sub_items_count || resource.subitems?.length || 0
          const thumbnailUrl = getFileUrl(resource.thumbnail_url ?? resource.thumbnail)
          const updatedDate = new Date(resource.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })

          return (
            <Link
              key={resource.id}
              href={`/resources/${resource.slug}`}
              className="group block rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-[0_25px_75px_-35px_rgba(56,189,248,0.35)] dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-[0_20px_60px_-30px_rgba(15,23,42,0.8)]"
            >
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt={resource.title}
                  className="mb-5 aspect-video w-full rounded-2xl object-cover"
                />
              )}

              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${categoryStyle.color}`}>
                    <span className="text-lg">{categoryStyle.icon}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-600 dark:bg-slate-900/90 dark:text-slate-300">
                        {categoryStyle.label}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-600 dark:bg-slate-900/90 dark:text-slate-300">
                        {regionLabels[resource.region] ?? resource.region}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition group-hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:text-white">
                  <span>★</span>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-slate-950 leading-tight mb-3 dark:text-slate-100">
                {resource.title}
              </h2>
              <p className="text-slate-600 line-clamp-3 mb-6 dark:text-slate-400">
                {stripHtml(resource.description)}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                  <p className="text-slate-700 dark:text-slate-300">{itemCount ? `${itemCount} sub-items` : 'Resource'}</p>
                  <p>{`Updated ${updatedDate}`}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-300">No resources match your search or filter selection.</p>
        </div>
      )}
    </section>
  )
}
