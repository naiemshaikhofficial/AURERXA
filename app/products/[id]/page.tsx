import { getProductById, getRelatedProducts, isInWishlist } from '@/app/actions'
import { ProductClient } from '@/components/product-client'
import { notFound } from 'next/navigation'

export default async function ProductPage({ params }: { params: { id: string } }) {
    const product = await getProductById(params.id)

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

