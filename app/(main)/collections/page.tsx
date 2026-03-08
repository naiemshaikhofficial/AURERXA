import { CollectionsClient } from './collections-client'
import { getFilteredProducts, getCategories, getUsedTags, getSubCategories } from '@/app/actions'
import Link from 'next/link'

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
    const sub_category = params.sub_category && params.sub_category !== 'all' ? params.sub_category : ''
    const gender = params.gender && params.gender !== 'all' ? params.gender : ''
    const material = params.material_type && params.material_type !== 'all' ? params.material_type : ''
    const occasion = params.occasion && params.occasion !== 'all' ? params.occasion : ''

    const parts = [
        gender ? (gender === 'women' ? "Women's" : "Men's") : '',
        material || '',
        sub_category || category || 'Jewellery',
        'Collections',
        occasion ? `for ${occasion}` : ''
    ].filter(Boolean)

    const title = `AURERXA ${parts.join(' ')} - Latest 2026 Designs`
    const description = `Shop the exclusive ${parts.join(' ').toLowerCase()} at AURERXA India. Discover handcrafted luxury masterpieces, BIS Hallmarked gold, certified silver, and free insured shipping.`
    const baseUrl = 'https://www.aurerxa.com'
    const queryParams = new URLSearchParams()
    if (category) queryParams.set('category', category)
    if (sub_category) queryParams.set('sub_category', sub_category)
    if (gender) queryParams.set('gender', gender)
    if (material) queryParams.set('material_type', material)

    const queryString = queryParams.toString()
    const url = `${baseUrl}/collections${queryString ? `?${queryString}` : ''}`

    return {
        title,
        description,
        alternates: { canonical: url },
        keywords: [...parts, 'Buy Jewelry Online', 'Handcrafted Jewelry India', 'BIS Hallmarked', 'Certified Silver'],
        openGraph: {
            title,
            description,
            url,
            siteName: 'AURERXA',
            type: 'website',
            images: [`${baseUrl}/luxury-boutique-cover.jpg`]
        }
    }
}

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function CollectionsPage({ searchParams }: PageProps) {
    const params = await searchParams
    const subCategories = await getSubCategories()
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
        name: params.sub_category ? `${params.sub_category} Collection | AURERXA` : params.category ? `${params.category} Collection | AURERXA` : 'Jewellery Collections | AURERXA',
        description: `Explore our exclusive ${params.sub_category || params.category || ''} jewelry collection. Handcrafted masterpieces and timeless luxury at AURERXA.`,
        url: `${baseUrl}/collections${params.sub_category ? `?sub_category=${params.sub_category}` : params.category ? `?category=${params.category}` : ''}`,
        mainEntity: {
            '@type': 'ItemList',
            'numberOfItems': products.length,
            'itemListElement': products.slice(0, 20).map((product: any, index: number) => ({
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
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': baseUrl,
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': 'Collections',
                'item': `${baseUrl}/collections`,
            },
            ...(params.category ? [{
                '@type': 'ListItem',
                'position': 3,
                'name': params.category,
                'item': `${baseUrl}/collections?category=${params.category}`,
            }] : []),
            ...(params.sub_category ? [{
                '@type': 'ListItem',
                'position': params.category ? 4 : 3,
                'name': params.sub_category,
                'item': `${baseUrl}/collections?sub_category=${params.sub_category}`,
            }] : [])
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
            <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 md:pt-24 min-h-screen">
                <Breadcrumb className="mb-8">
                    <BreadcrumbList className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            {(!params.category && !params.sub_category) ? (
                                <BreadcrumbPage className="text-primary font-bold">Collections</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href="/collections" className="hover:text-primary transition-colors">Collections</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {params.category && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {!params.sub_category ? (
                                        <BreadcrumbPage className="text-primary font-bold">{params.category}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={`/collections?category=${params.category}`} className="hover:text-primary transition-colors">{params.category}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </>
                        )}
                        {params.sub_category && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-primary font-bold">{params.sub_category}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
                <CollectionsClient
                    initialProducts={products as any}
                    categories={subCategories as any}
                    tags={tags}
                    initialFilters={initialFilters as any}
                />
            </div>
        </main>
    )
}
