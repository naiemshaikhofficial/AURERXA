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

    const title = `${product.name} | AURERXA`
    const description = product.description || `Exquisite ${product.name} from AURERXA's heritage collection.`

    const ogImageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/og/product/${product.slug}`

    return {
        title,
        description,
        keywords: [product.name, 'AURERXA Jewelry', 'Luxury Jewelry India', product.material_type || '', 'Handcrafted Jewelry'],
        openGraph: {
            title,
            description,
            type: 'article',
            url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
            images: [
                {
                    url: product.image_url || ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [product.image_url || ogImageUrl],
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

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image_url ? [product.image_url, ...(product.images || [])] : [baseUrl + '/logo.png'],
        description: product.description,
        sku: product.id,
        mpn: product.slug,
        brand: {
            '@type': 'Brand',
            name: 'AURERXA',
        },
        offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'INR',
            price: product.price,
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            itemCondition: 'https://schema.org/NewCondition',
            availability: product.stock && product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
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
                        '@type': 'ShippingDeliveryTime',
                        'minValue': 1,
                        'maxValue': 5,
                        'unitCode': 'DAY',
                    },
                },
            },
        },
        material: product.material_type || 'Jewelry',
        category: Array.isArray(product.categories) ? product.categories[0]?.name : product.categories?.name,
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
            {
                '@type': 'ListItem',
                position: 3,
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

