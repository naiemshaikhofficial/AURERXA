import { getProductBySlug, getRelatedProducts, isInWishlist } from '@/app/actions'
import { ProductClient } from '@/components/product-client'
import { notFound } from 'next/navigation'

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

