import { Metadata } from 'next'
import { getProductBySlug, getRelatedProducts, isInWishlist, getReviewStats, getAllProductSlugs } from '@/app/actions'
import { ProductClient } from '@/components/product-client'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
    const products = await getAllProductSlugs()
    return products.map((p: any) => ({
        slug: p.slug,
    }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const { slug } = await params
        const product = await getProductBySlug(slug)

        if (!product) {
            return {
                title: 'Product Not Found | AURERXA'
            }
        }

        const categories = product.categories as any
        const categoryName = Array.isArray(categories) ? categories[0]?.name : categories?.name
        const materialLabel = product.material_type || 'Jewelry'
        const purityLabel = product.purity ? `${product.purity} ` : ''

        const title = `${purityLabel}${materialLabel} ${categoryName || 'Jewelry'} | ${product.name} | AURERXA`
        const rawDescription = product.description || `Explore our exquisite ${purityLabel}${materialLabel} ${categoryName || 'jewelry'}. Handcrafted ${product.name} from AURERXA's heritage collection. Certified quality & Free Shipping.`
        const description = rawDescription.length > 160 ? rawDescription.substring(0, 157) + '...' : rawDescription

        const baseUrl = 'https://www.aurerxa.com'
        const ogImageUrl = `${baseUrl}/api/og/product/${product.slug}`
        const productUrl = `${baseUrl}/products/${product.slug}`

        const dynamicKeywords = [
            product.name,
            `Buy ${product.name} Online`,
            `${product.name} Price`,
            `${product.name} India`,
            categoryName ? `${categoryName} Online` : '',
            categoryName ? `Buy ${categoryName}` : '',
            categoryName ? `${categoryName} for ${product.gender || 'Women'}` : '',
            categoryName ? `Gold ${categoryName}` : '',
            categoryName ? `${materialLabel} ${categoryName}` : '',
            `AURERXA ${categoryName || 'Jewelry'}`,
            materialLabel,
            product.purity ? `${product.purity} Gold` : '',
            product.gender ? `${product.gender} Jewelry` : '',
            product.gender ? `${categoryName || 'Jewelry'} for ${product.gender}` : '',
            'Buy Jewelry India', 'Luxury Jewelry Brand India',
            'Certified Quality Jewelry', 'Free Insured Shipping',
            ...(Array.isArray(product.tags) ? product.tags : []),
        ].filter(Boolean)

        const productImages = Array.isArray(product.images) ? product.images : []

        return {
            title,
            description,
            keywords: dynamicKeywords,
            openGraph: {
                title,
                description,
                type: 'website',
                url: productUrl,
                siteName: 'AURERXA',
                locale: 'en_IN',
                images: [
                    {
                        url: ogImageUrl,
                        width: 1200,
                        height: 630,
                        alt: `${product.name} - Buy Online at AURERXA`,
                    },
                    {
                        url: product.image_url?.startsWith('http') ? product.image_url : `${baseUrl}${product.image_url}`,
                        width: 1200,
                        height: 630,
                        alt: product.name,
                    },
                    ...productImages.slice(0, 3).filter(Boolean).map((img: string) => ({
                        url: img.startsWith('http') ? img : `${baseUrl}${img}`,
                        width: 800,
                        height: 800,
                        alt: `${product.name} - AURERXA`,
                    })),
                ].filter(img => img.url && !img.url.includes('undefined')),
            },
            twitter: {
                card: 'summary_large_image',
                title: `${product.name} - ₹${(product.price || 0).toLocaleString('en-IN')}`,
                description: `Experience the finest craftsmanship with our ${product.name}. Certified quality, Luxe design & Free Insured Shipping.`,
                images: [ogImageUrl],
            },
            alternates: {
                canonical: productUrl,
            },
        }
    } catch (e: any) {
        console.error('❌ Error in generateMetadata:', e)
        return {
            title: 'Product Details | AURERXA'
        }
    }
}

import { ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        console.log('🔹 Product Page Slug:', slug)
        const product = await getProductBySlug(slug)
        console.log('🔹 Fetch Result:', product ? 'Found' : 'Not Found')

        if (!product) {
            return (
                <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-background">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 blur-3xl bg-primary/10 rounded-full" />
                        <ShoppingBag className="w-16 h-16 text-primary/40 relative z-10" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif text-foreground/90 italic mb-6">Masterpiece Not Found</h1>
                    <p className="text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed uppercase tracking-[0.2em] text-[10px]">
                        The item you are looking for may have been moved to our private archive or has yet to be released.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/collections">
                            <button className="px-10 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-foreground hover:text-background transition-all">
                                Browse Collection
                            </button>
                        </Link>
                        <Link href="/">
                            <button className="px-10 py-4 border border-border text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-muted transition-all flex items-center gap-3">
                                <ArrowLeft className="w-3 h-3" /> Back to Home
                            </button>
                        </Link>
                    </div>
                </div>
            )
        }

        const [isWishlisted, reviewStats] = await Promise.all([
            isInWishlist(product.id),
            getReviewStats(product.id)
        ])

        const baseUrl = 'https://www.aurerxa.com'
        const productUrl = `${baseUrl}/products/${product.slug}`

        const categories = product.categories as any
        const categoryName = Array.isArray(categories) ? categories[0]?.name : categories?.name
        const categorySlug = Array.isArray(categories) ? categories[0]?.slug : categories?.slug

        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            '@id': productUrl,
            name: product.name,
            image: product.image_url ? [product.image_url, ...(Array.isArray(product.images) ? product.images : [])] : [baseUrl + '/icon-512.png'],
            description: product.description || `Buy ${product.name} online at AURERXA. Premium ${product.material_type || ''} ${categoryName || 'jewelry'}.`,
            sku: product.id,
            mpn: product.slug,
            brand: {
                '@type': 'Brand',
                name: 'AURERXA',
                url: baseUrl,
                logo: `${baseUrl}/icon-512.png`,
            },
            aggregateRating: (reviewStats?.total > 0) ? {
                '@type': 'AggregateRating',
                ratingValue: reviewStats.average,
                reviewCount: reviewStats.total,
                bestRating: '5',
                worstRating: '1'
            } : undefined,
            offers: {
                '@type': 'Offer',
                url: productUrl,
                priceCurrency: 'INR',
                price: product.price,
                priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                itemCondition: 'https://schema.org/NewCondition',
                availability: product.stock && product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                seller: {
                    '@type': 'Organization',
                    name: 'AURERXA',
                },
            },
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
                },
                ...(categoryName ? [{
                    '@type': 'ListItem',
                    position: 3,
                    name: categoryName,
                    item: `${baseUrl}/collections?category=${categorySlug}`,
                }] : []),
                {
                    '@type': 'ListItem',
                    position: categoryName ? 4 : 3,
                    name: product.name,
                    item: productUrl,
                },
            ],
        }

        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
                />
                <ProductClient
                    product={product}
                    isWishlisted={isWishlisted}
                />
            </>
        )
    } catch (e: any) {
        console.error('❌ Error in ProductPage:', e)
        return (
            <div className="p-20 text-center">
                <h1 className="text-2xl font-serif mb-4">Elegance Interrupted</h1>
                <p className="text-white/40 uppercase tracking-widest text-[10px] mb-8">A technical issue occurred while loading this masterpiece.</p>
                <div className="bg-white/5 p-4 rounded text-left overflow-auto max-w-2xl mx-auto">
                    <pre className="text-[9px] text-red-400">{e.message}</pre>
                    <pre className="text-[8px] text-white/20 mt-2">{e.stack}</pre>
                </div>
                <Link href="/collections" className="inline-block mt-8 text-[10px] uppercase tracking-[0.3em] text-amber-500 border-b border-amber-500/20 pb-1">Back to Gallery</Link>
            </div>
        )
    }
}

