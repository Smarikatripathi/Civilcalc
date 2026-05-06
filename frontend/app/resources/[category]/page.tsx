import ResourceExplorer from '../../../components/resources/resource-explorer'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

const categoryLabels: Record<string, string> = {
  codes: 'Codes',
  district_rates: 'District Rates',
  rules: 'Rules and Regulations',
  notes: 'Notes',
  blogs: 'Blogs',
}

async function getCategoryData(category: string) {
  const res = await fetch(`${BACKEND_URL}/api/resources/${category}/`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to load category: ${category}`)
  }
  return res.json()
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const data = await getCategoryData(params.category)
  const categoryTitle = categoryLabels[params.category] ?? params.category

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Category</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-100">{categoryTitle}</h1>
        <p className="mt-4 max-w-2xl mx-auto text-slate-400">
          Explore all resources in the {categoryTitle} category.
        </p>
      </div>

      <ResourceExplorer
        initialResources={data}
        title={`${categoryTitle} Resources`}
        description={`Browse the latest ${categoryTitle.toLowerCase()} content and reference materials.`}
        hideCategoryPills
      />
    </section>
  )
}
