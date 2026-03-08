import { Metadata } from 'next'
import { getProductBySlug, getRelatedProducts, isInWishlist, getReviewStats } from '@/app/actions'
import { getProductReviews } from '@/lib/actions/reviews'
import { ProductClient } from '@/components/product-client'
import { notFound } from 'next/navigation'

// Force dynamic rendering — product pages depend on live gold rates and dynamic pricing.
export const dynamic = 'force-dynamic'

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

        const title = `${product.name} - ${purityLabel}${materialLabel} ${categoryName || 'Jewelry'} | AURERXA`
        const rawDescription = product.description || `Explore our exquisite ${purityLabel}${materialLabel} ${categoryName || 'jewelry'}. Handcrafted ${product.name} from AURERXA's heritage collection. Certified quality & Free Shipping.`
        const description = rawDescription.length > 160 ? rawDescription.substring(0, 157) + '...' : rawDescription

        const baseUrl = 'https://www.aurerxa.com'
        const ogImageUrl = `${baseUrl}/api/og/product/${product.slug}`
        const productUrl = `${baseUrl}/products/${product.slug}`

        const dynamicKeywords = [
            product.name,
            `Buy ${product.name} Online`,
            `${product.name} India`,
            categoryName ? `${categoryName} Online` : '',
            categoryName ? `Buy ${categoryName}` : '',
            `AURERXA ${categoryName || 'Jewelry'}`,
            materialLabel,
            product.purity ? `${product.purity} Gold` : '',
            product.gender ? `${product.gender} Jewelry` : '',
            'Buy Jewelry India', 'Luxury Jewelry Brand India',
            'Certified Quality', 'Free Insured Shipping',
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
        return { title: 'ProductDetails | AURERXA' }
    }
}

import { ArrowLeft, ShoppingBag, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { generateBreadcrumbSchema } from '@/lib/seo-utils'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const product = await getProductBySlug(slug)

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

        const [isWishlisted, reviewStats, reviews] = await Promise.all([
            isInWishlist(product.id),
            getReviewStats(product.id),
            getProductReviews(product.id)
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
            dateModified: product.updated_at || new Date().toISOString(),
            brand: {
                '@type': 'Brand',
                name: 'AURERXA',
                url: baseUrl,
                logo: `${baseUrl}/icon-512.png`,
                slogan: 'Authentic Luxury & Bespoke Jewelry Heritage'
            },
            aggregateRating: (reviewStats?.total > 0) ? {
                '@type': 'AggregateRating',
                ratingValue: reviewStats.average,
                reviewCount: reviewStats.total,
                bestRating: '5',
                worstRating: '1'
            } : undefined,
            // First-Party Expert Review (Aligned with Google Reviews System)
            'review': [
                {
                    '@type': 'Review',
                    'reviewRating': {
                        '@type': 'Rating',
                        'ratingValue': '5',
                        'bestRating': '5'
                    },
                    'author': {
                        '@type': 'Person',
                        'name': 'Naiem Shaikh',
                        'url': `${baseUrl}/about-us`,
                        'sameAs': [
                            'https://www.linkedin.com/in/naiemshaikhofficial',
                            'https://www.instagram.com/naiemshaikhofficial'
                        ]
                    },
                    'publisher': {
                        '@type': 'Organization',
                        'name': 'AURERXA'
                    },
                    'positiveNotes': {
                        '@type': 'ItemList',
                        'itemListElement': [
                            { '@type': 'ListItem', 'position': 1, 'name': 'Exquisite Handcrafted Quality' },
                            { '@type': 'ListItem', 'position': 2, 'name': 'BIS Hallmarked Authentic' }
                        ]
                    },
                    'negativeNotes': {
                        '@type': 'ItemList',
                        'itemListElement': [
                            { '@type': 'ListItem', 'position': 1, 'name': 'Limited Edition Stock' }
                        ]
                    }
                },
                ...(reviews?.length > 0 ? reviews.map((r: any) => ({
                    '@type': 'Review',
                    author: {
                        '@type': 'Person',
                        'name': r.profiles?.full_name || 'Verified Customer',
                        'url': r.profiles ? `${baseUrl}/profiles/${r.profiles.id}` : undefined
                    },
                    datePublished: r.created_at,
                    reviewBody: r.comment || '',
                    reviewRating: {
                        '@type': 'Rating',
                        ratingValue: r.rating,
                        bestRating: '5',
                        worstRating: '1',
                    },
                    'positiveNotes': {
                        '@type': 'ItemList',
                        'itemListElement': [
                            { '@type': 'ListItem', 'position': 1, 'name': 'Authentic Design' },
                            { '@type': 'ListItem', 'position': 2, 'name': 'Premium Packaging' }
                        ]
                    }
                })) : [])
            ],
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
                shippingDetails: {
                    '@type': 'OfferShippingDetails',
                    'shippingRate': {
                        '@type': 'MonetaryAmount',
                        'value': 0,
                        'currency': 'INR',
                    },
                    'shippingDestination': {
                        '@type': 'DefinedRegion',
                        'addressCountry': 'IN',
                    },
                    'deliveryTime': {
                        '@type': 'ShippingDeliveryTime',
                        'handlingTime': {
                            '@type': 'QuantitativeValue',
                            'minValue': 0,
                            'maxValue': 1,
                            'unitCode': 'DAY',
                        },
                        'transitTime': {
                            '@type': 'QuantitativeValue',
                            'minValue': 1,
                            'maxValue': 5,
                            'unitCode': 'DAY',
                        },
                    },
                },
                hasMerchantReturnPolicy: {
                    '@type': 'MerchantReturnPolicy',
                    'applicableCountry': 'IN',
                    'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
                    'merchantReturnDays': 15,
                    'returnMethod': 'https://schema.org/ReturnByMail',
                    'returnFees': 'https://schema.org/FreeReturn',
                },
            },
            material: product.material_type || 'Jewelry',
            category: categoryName,
            additionalProperty: [
                {
                    '@type': 'PropertyValue',
                    name: 'Metal Purity',
                    value: product.purity || 'N/A'
                },
                {
                    '@type': 'PropertyValue',
                    name: 'Material Type',
                    value: product.material_type || 'N/A'
                },
                {
                    '@type': 'PropertyValue',
                    name: 'Hallmark',
                    value: 'BIS Hallmarked'
                }
            ],
            ...(product.weight_grams ? {
                weight: {
                    '@type': 'QuantitativeValue',
                    value: product.weight_grams,
                    unitText: 'g',
                }
            } : {}),
            color: product.material_type?.includes('Gold') ? 'Gold' : product.material_type?.includes('Silver') ? 'Silver' : undefined,
            audience: product.gender ? {
                '@type': 'PeopleAudience',
                suggestedGender: product.gender,
            } : undefined,
            'isVariantOf': product.is_dynamic_pricing ? {
                '@type': 'ProductModel',
                'name': product.name,
                'description': product.description,
                'url': productUrl
            } : undefined
        }

        const faqLd = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
                {
                    '@type': 'Question',
                    'name': `Is the ${product.name} BIS Hallmarked?`,
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': `Yes, all ${product.material_type || 'jewelry'} from AURERXA, including the ${product.name}, is BIS Hallmarked and certified for purity.`
                    }
                },
                {
                    '@type': 'Question',
                    'name': 'What is the shipping time for this item?',
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'We provide free insured shipping across India. Delivery typically takes 3-5 business days.'
                    }
                },
                {
                    '@type': 'Question',
                    'name': 'Can I return this product?',
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'Yes, we offer a 15-day return policy for this product. Please ensure the tag remains intact.'
                    }
                }
            ]
        }

        const videoLd = product.video_url ? {
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            'name': `${product.name} - Artisan Presentation`,
            'description': `Visual presentation of the handcrafted ${product.name} at AURERXA.`,
            'thumbnailUrl': product.image_url,
            'uploadDate': product.created_at || new Date().toISOString(),
            'contentUrl': product.video_url,
            'embedUrl': product.video_url
        } : null

        const breadcrumbItems = [
            { name: 'Home', item: '/' },
            { name: 'Collections', item: '/collections' },
            ...(categoryName ? [{ name: categoryName, item: `/collections?category=${categorySlug}` }] : []),
            { name: product.name, item: `/products/${product.slug}` }
        ]

        const breadcrumbLd = generateBreadcrumbSchema(breadcrumbItems)

        return (
            <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 md:pt-24">
                <Breadcrumb className="mb-8">
                    <BreadcrumbList className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/collections" className="hover:text-primary transition-colors">Collections</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {categoryName && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href={`/collections?category=${categorySlug}`} className="hover:text-primary transition-colors">{categoryName}</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </>
                        )}
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-primary font-bold">{product.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
                />
                {videoLd && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }}
                    />
                )}
                <ProductClient
                    product={product}
                    isWishlisted={isWishlisted}
                />
            </div>
        )
    } catch (e: any) {
        console.error('❌ Error in ProductPage:', e)
        return (
            <div className="min-h-screen flex items-center justify-center px-6 py-24 text-center bg-background">
                <div className="max-w-md mx-auto">
                    <h1 className="text-2xl font-serif mb-4 italic text-foreground">Elegance Interrupted</h1>
                    <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] mb-8 leading-relaxed">
                        A technical issue occurred while loading this masterpiece. Our curators have been notified.
                    </p>
                    <Link href="/collections">
                        <button className="px-10 py-4 bg-primary/10 border border-primary/20 text-primary font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-primary hover:text-primary-foreground transition-all">
                            Browse Collection
                        </button>
                    </Link>
                </div>
            </div>
        )
    }
}
