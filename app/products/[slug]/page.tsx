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

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            images: [
                {
                    url: product.image_url,
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
            images: [product.image_url],
        },
    }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    console.log('🔹 Product Page Slug:', slug)
    const product = await getProductBySlug(slug)
    console.log('🔹 Fetch Result:', product ? 'Found' : 'Not Found')

    if (!product) {
        console.error('❌ Product not found for slug:', slug)
        notFound()
    }

    const related = await getRelatedProducts(product.category_id, product.id)
    const isWishlisted = await isInWishlist(product.id)

    return (
        <ProductClient
            product={product}
            related={related || []}
            isWishlisted={isWishlisted}
        />
    )
}

