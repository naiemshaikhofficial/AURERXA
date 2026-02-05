import { getProductById, getRelatedProducts, isInWishlist } from '@/app/actions'
import { ProductClient } from '@/components/product-client'
import { notFound } from 'next/navigation'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const product = await getProductById(id)

    if (!product) {
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

