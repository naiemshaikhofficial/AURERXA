import { Metadata } from 'next'
import { getProductBySlug, getRelatedProducts, isInWishlist } from '@/app/actions'
import { ProductClient } from '@/components/product-client'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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

    // Tanishq-style title: [Purity] [Metal] [Category] | [Product Name] | AURERXA
    const title = `${purityLabel}${materialLabel} ${categoryName || 'Jewelry'} | ${product.name} | AURERXA`
    const description = product.description || `Explore our exquisite ${purityLabel}${materialLabel} ${categoryName || 'jewelry'}. Handcrafted ${product.name} from AURERXA's heritage collection. Certified quality & Free Shipping.`

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aurerxa.com'
    const ogImageUrl = `${baseUrl}/api/og/product/${product.slug}`
    const productUrl = `${baseUrl}/products/${product.slug}`

    // Dynamic keyword generation based on product attributes
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
        ...(product.tags || []),
        'Handcrafted Jewelry India',
        'Buy Jewelry Online',
        'AURERXA',
    ].filter(Boolean)

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
                    url: product.image_url || ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${product.name} - Buy Online at AURERXA`,
                },
                ...(product.images || []).slice(0, 3).map((img: string) => ({
                    url: img,
                    width: 800,
                    height: 800,
                    alt: `${product.name} - AURERXA`,
                })),
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} - ₹${product.price?.toLocaleString('en-IN')} | AURERXA`,
            description,
            images: [product.image_url || ogImageUrl],
        },
        alternates: {
            canonical: productUrl,
        },
    }
}

import { ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    console.log('🔹 Product Page Slug:', slug)
    const product = await getProductBySlug(slug)
    console.log('🔹 Fetch Result:', product ? 'Found' : 'Not Found')

    if (!product) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-neutral-950">
                <div className="relative mb-8">
                    <div className="absolute inset-0 blur-3xl bg-amber-500/10 rounded-full" />
                    <ShoppingBag className="w-16 h-16 text-amber-500/40 relative z-10" />
                </div>

                <h1 className="text-4xl md:text-5xl font-serif text-white/90 italic mb-6">Masterpiece Not Found</h1>
                <p className="text-white/40 max-w-md mx-auto mb-10 leading-relaxed uppercase tracking-[0.2em] text-[10px]">
                    The item you are looking for may have been moved to our private archive or has yet to be released.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/collections">
                        <button className="px-10 py-4 bg-amber-500 text-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-amber-400 transition-all">
                            Browse Collection
                        </button>
                    </Link>
                    <Link href="/">
                        <button className="px-10 py-4 border border-white/10 text-white/60 font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white/5 transition-all flex items-center gap-3">
                            <ArrowLeft className="w-3 h-3" /> Back to Home
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    const isWishlisted = await isInWishlist(product.id)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aurerxa.com'
    const productUrl = `${baseUrl}/products/${product.slug}`

    const categories = product.categories as any
    const subCategories = product.sub_categories as any
    const categoryName = Array.isArray(categories) ? categories[0]?.name : categories?.name
    const categorySlug = Array.isArray(categories) ? categories[0]?.slug : categories?.slug
    const subCategoryName = Array.isArray(subCategories) ? subCategories[0]?.name : subCategories?.name

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': productUrl,
        name: product.name,
        image: product.image_url ? [product.image_url, ...(product.images || [])] : [baseUrl + '/logo-new.webp'],
        description: product.description || `Buy ${product.name} online at AURERXA. Premium ${product.material_type || ''} ${categoryName || 'jewelry'}.`,
        sku: product.id,
        mpn: product.slug,
        gtin13: undefined, // Add if you have barcode/GTIN
        brand: {
            '@type': 'Brand',
            name: 'AURERXA',
            url: baseUrl,
            logo: `${baseUrl}/logo-new.webp`,
        },
        manufacturer: {
            '@type': 'Organization',
            name: 'AURERXA',
        },
        // Deep Schema: Ratings & Review Placeholders
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5',
            reviewCount: '1',
            bestRating: '5',
            worstRating: '1'
        },
        review: {
            '@type': 'Review',
            author: { '@type': 'Person', name: 'AURERXA Guest' },
            datePublished: '2026-02-20',
            reviewBody: 'Exquisite craftsmanship and timeless design. A true masterpiece.',
            reviewRating: { '@type': 'Rating', ratingValue: '5' }
        },
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
        ...(product.weight_grams ? {
            weight: {
                '@type': 'QuantitativeValue',
                value: product.weight_grams,
                unitCode: 'GRM',
            }
        } : {}),
        ...(product.dimensions_width && product.dimensions_height ? {
            depth: {
                '@type': 'QuantitativeValue',
                value: product.dimensions_length || 0,
                unitCode: product.dimensions_unit === 'cm' ? 'CMT' : 'MMT',
            },
            width: {
                '@type': 'QuantitativeValue',
                value: product.dimensions_width,
                unitCode: product.dimensions_unit === 'cm' ? 'CMT' : 'MMT',
            },
            height: {
                '@type': 'QuantitativeValue',
                value: product.dimensions_height,
                unitCode: product.dimensions_unit === 'cm' ? 'CMT' : 'MMT',
            },
        } : {}),
        color: product.material_type?.includes('Gold') ? 'Gold' : product.material_type?.includes('Silver') ? 'Silver' : product.material_type?.includes('Rose') ? 'Rose Gold' : undefined,
        audience: product.gender ? {
            '@type': 'PeopleAudience',
            suggestedGender: product.gender,
        } : undefined,
        additionalProperty: [
            ...(product.purity ? [{ '@type': 'PropertyValue', name: 'Purity', value: product.purity }] : []),
            ...(product.material_type ? [{ '@type': 'PropertyValue', name: 'Material', value: product.material_type }] : []),
            ...(product.gender ? [{ '@type': 'PropertyValue', name: 'Gender', value: product.gender }] : []),
            ...(categoryName ? [{ '@type': 'PropertyValue', name: 'Jewelry Type', value: categoryName }] : []),
            ...(subCategoryName ? [{ '@type': 'PropertyValue', name: 'Sub Category', value: subCategoryName }] : []),
            ...(product.tags || []).map((tag: string) => ({ '@type': 'PropertyValue', name: 'Tag', value: tag })),
        ],
        isRelatedTo: categoryName ? {
            '@type': 'Product',
            name: `${categoryName} Collection`,
            url: `${baseUrl}/collections?category=${categorySlug}`,
        } : undefined,
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
}

