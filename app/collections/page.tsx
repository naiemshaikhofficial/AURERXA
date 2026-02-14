
import { Suspense } from 'react'
import { getFilteredProducts, getCategories } from '@/app/actions'
import { CollectionsClient } from './collections-client'
import { PRICE_RANGES, FilterState } from '@/components/cinematic-filter'

// Set revalidation time for the page
export const revalidate = 60

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  // Construct initial filters from URL params
  // Use a safe default for priceRange to avoid runtime errors
  const defaultPriceRange = PRICE_RANGES[0] || { label: 'All Prices', min: 0, max: null }

  const initialFilters: FilterState = {
    category: (resolvedSearchParams?.category as string) || (resolvedSearchParams?.material as string) || 'all',
    type: (resolvedSearchParams?.type as string) || 'all',
    gender: (resolvedSearchParams?.gender as string) || 'all',
    priceRange: defaultPriceRange,
    sortBy: (resolvedSearchParams?.sort as string) || 'newest'
  }

  // Parallel fetch initial products and categories on the server
  const [categories, initialProducts] = await Promise.all([
    getCategories(),
    getFilteredProducts({
      sortBy: initialFilters.sortBy,
      category: initialFilters.category === 'all' ? undefined : initialFilters.category,
      gender: initialFilters.gender === 'all' ? undefined : initialFilters.gender,
      type: initialFilters.type === 'all' ? undefined : initialFilters.type,
      minPrice: initialFilters.priceRange?.min ?? 0,
      maxPrice: initialFilters.priceRange?.max ?? undefined
    })
  ])

  // Ensure initialProducts matches the expected type (Product[])
  // If getFilteredProducts returns something else, we need to cast or handle it.
  // Assuming it returns Product[] based on previous context.

  const allCategories = [{ name: 'All Collections', slug: 'all' }, ...categories]

  return (
    <CollectionsClient
      initialProducts={(initialProducts as any[]) || []}
      categories={allCategories}
      initialFilters={initialFilters}
    />
  )
}
