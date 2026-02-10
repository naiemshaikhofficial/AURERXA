import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function GET(request: NextRequest) {
    const tag = request.nextUrl.searchParams.get('tag')
    const secret = request.nextUrl.searchParams.get('secret')

    // Security check - add REVALIDATE_SECRET to your environment variables
    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    if (tag) {
        revalidateTag(tag)
        return NextResponse.json({ revalidated: true, now: Date.now() })
    }

    return NextResponse.json({
        message: 'Missing tag',
    })
}

// Support POST for webhooks
export async function POST(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get('secret')

    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    const body = await request.json()
    // Handle Supabase Webhook payload
    // table = products or categories
    const table = body.table || 'products'

    revalidateTag(table)

    return NextResponse.json({ revalidated: true, table, now: Date.now() })
}
