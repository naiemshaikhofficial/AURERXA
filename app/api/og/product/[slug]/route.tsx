import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = await params

        // Fetch product details
        const { data: product, error } = await supabase
            .from('products')
            .select('name, price, image_url')
            .eq('slug', slug)
            .single()

        if (error || !product) {
            return new Response('Product not found', { status: 404 })
        }

        const formatCurrency = (v: number) =>
            new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(v)

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0a0a0a',
                        backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #0a0a0a 100%)',
                    }}
                >
                    {/* Background Logo Watermark */}
                    <div style={{ position: 'absolute', opacity: 0.03, fontSize: 300, top: -100, fontWeight: 900, color: 'white' }}>
                        AURERXA
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 60,
                            padding: 60,
                        }}
                    >
                        {/* Product Image */}
                        <div style={{ display: 'flex', position: 'relative', width: 450, height: 450, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                            <img
                                src={product.image_url}
                                width="450"
                                height="450"
                                style={{ objectFit: 'cover' }}
                            />
                        </div>

                        {/* Product Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 500 }}>
                            <div style={{ fontSize: 16, color: '#D4AF37', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20 }}>
                                Bespoke Jewelry
                            </div>
                            <div style={{ fontSize: 60, color: 'white', fontWeight: 700, lineHeight: 1.1, marginBottom: 20 }}>
                                {product.name}
                            </div>
                            <div style={{ fontSize: 40, color: '#D4AF37', fontWeight: 600 }}>
                                {formatCurrency(product.price)}
                            </div>

                            <div style={{ display: 'flex', marginTop: 40, padding: '12px 24px', backgroundColor: '#D4AF37', color: 'black', fontSize: 20, fontWeight: 700, borderRadius: 4 }}>
                                DISCOVER MORE AT AURERXA.COM
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    } catch (e) {
        return new Response('Failed to generate image', { status: 500 })
    }
}
