import { CollectionsClient } from './collections-client'
import { getFilteredProducts, getCategories, getUsedTags } from '@/app/actions'
import { Navbar } from '@/components/navbar'

interface PageProps {
    searchParams: Promise<{
        category?: string
        sub_category?: string
        tag?: string
        occasion?: string
        gender?: string
        type?: string
        material_type?: string
        minPrice?: string
        maxPrice?: string
        sortBy?: string
        search?: string
    }>
}
import { Metadata } from 'next'

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const params = await searchParams
    const category = params.category && params.category !== 'all' ? params.category : ''
    const gender = params.gender && params.gender !== 'all' ? params.gender : ''
    const material = params.material_type && params.material_type !== 'all' ? params.material_type : ''
    const occasion = params.occasion && params.occasion !== 'all' ? params.occasion : ''

    const parts = [
        gender ? (gender === 'women' ? "Women's" : "Men's") : '',
        material || '',
        category || 'Jewellery',
        'Collections',
        occasion ? `for ${occasion}` : ''
    ].filter(Boolean)

    const title = `${parts.join(' ')} - Latest 2026 Designs | Buy Online at AURERXA`
    const description = `Shop the exclusive ${parts.join(' ').toLowerCase()} at AURERXA India. Discover handcrafted luxury masterpieces, certified quality, and free insured shipping on our latest heritage collection.`
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aurerxa.com'
    const url = `${baseUrl}/collections${category ? `?category=${category}` : ''}`

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            siteName: 'AURERXA',
            type: 'website'
        }
    }
}

export default async function CollectionsPage({ searchParams }: PageProps) {
    const params = await searchParams
    const categories = await getCategories()
    const tags = await getUsedTags()

    const initialFilters = {
        category: params.category || 'all',
        sub_category: params.sub_category || 'all',
        tag: params.tag || '',
        occasion: params.occasion || 'all',
        gender: params.gender || 'all',
        type: params.type || 'all',
        material_type: params.material_type || 'all',
        sortBy: params.sortBy || 'newest',
        search: params.search || '',
        priceRange: {
            label: 'All Prices',
            min: Number(params.minPrice) || 0,
            max: params.maxPrice ? Number(params.maxPrice) : null
        }
    }

    const products = await getFilteredProducts({
        category: initialFilters.category === 'all' ? undefined : initialFilters.category,
        sub_category: initialFilters.sub_category === 'all' ? undefined : initialFilters.sub_category,
        tag: initialFilters.tag || undefined,
        occasion: initialFilters.occasion === 'all' ? undefined : initialFilters.occasion,
        gender: initialFilters.gender === 'all' ? undefined : initialFilters.gender,
        type: initialFilters.type === 'all' ? undefined : initialFilters.type,
        material_type: initialFilters.material_type === 'all' ? undefined : initialFilters.material_type,
        sortBy: initialFilters.sortBy,
        search: initialFilters.search || undefined,
        minPrice: initialFilters.priceRange.min,
        maxPrice: initialFilters.priceRange.max || undefined
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aurerxa.com'
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: params.category ? `${params.category} Collection | AURERXA` : 'Jewellery Collections | AURERXA',
        description: `Explore our exclusive ${params.category || ''} jewelry collection. Handcrafted masterpieces and timeless luxury at AURERXA.`,
        url: `${baseUrl}/collections${params.category ? `?category=${params.category}` : ''}`,
        mainEntity: {
            '@type': 'ItemList',
            'itemListElement': products.slice(0, 10).map((product: any, index: number) => ({
                '@type': 'ListItem',
                'position': index + 1,
                'url': `${baseUrl}/products/${product.slug}`,
                'name': product.name,
                'image': product.image_url
            }))
        }
    }

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: baseUrl,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Collections',
                item: `${baseUrl}/collections`,
            }
        ],
    }

    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <Navbar />
            <CollectionsClient
                initialProducts={products as any}
                categories={categories}
                tags={tags}
                initialFilters={initialFilters as any}
            />
        </main>
    )
}
