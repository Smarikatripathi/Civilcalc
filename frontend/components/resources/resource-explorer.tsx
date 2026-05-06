'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

export type ResourceItem = {
  id: number
  title: string
  description: string
  category: string
  region: string
  updated_at: string
  sub_items_count?: number
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
}

export default function ResourceExplorer({
  initialResources,
  title = 'Engineering Resources',
  description = 'Access comprehensive civil engineering resources including codes, standards, rates, and industry guidelines from around the world.',
  hideCategoryPills = false,
}: Props) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [sort, setSort] = useState('newest')

  const categories = useMemo(() => {
    return Array.from(new Set(initialResources.map((item) => item.category)))
  }, [initialResources])

  const regions = useMemo(() => {
    return Array.from(new Set(initialResources.map((item) => item.region)))
  }, [initialResources])

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
      <div className="text-center mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Engineering Resources</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-100">{title}</h1>
        <p className="mt-4 max-w-2xl mx-auto text-slate-400">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center mb-8">
        <div className="relative">
          <label htmlFor="resource-search" className="sr-only">Search resources</label>
          <input
            id="resource-search"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            placeholder="Search resources, codes, blogs, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-3 items-center justify-end">
          <label htmlFor="resource-sort" className="text-sm text-slate-400">Sort by</label>
          <select
            id="resource-sort"
            className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
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
      </div>

      <div className="space-y-2 mb-8">
        {!hideCategoryPills && (
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedCategory === 'all' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedCategory === category ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {categoryLabels[category] ?? category}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedRegion === 'all' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            onClick={() => setSelectedRegion('all')}
          >
            All Regions
          </button>
          {regions.map((region) => (
            <button
              key={region}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedRegion === region ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              onClick={() => setSelectedRegion(region)}
            >
              {regionLabels[region] ?? region}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((resource) => (
          <article
            key={resource.id}
            className="group rounded-3xl border border-slate-800 bg-slate-950/80 p-6 transition hover:border-sky-500/40 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.2)]"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                {categoryLabels[resource.category] ?? resource.category}
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                {regionLabels[resource.region] ?? resource.region}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-slate-100 mb-3">{resource.title}</h2>
            <p className="text-slate-400 line-clamp-3 mb-6">{resource.description}</p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                {resource.sub_items_count ? `${resource.sub_items_count} items` : 'Resource'}
              </p>
              <Link
                href={`/resources/${resource.category}/${resource.id}`}
                className="inline-flex items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
              >
                View details
              </Link>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-slate-300">No resources match your search or filter selection.</p>
        </div>
      )}
    </section>
  )
}
