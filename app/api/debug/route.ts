import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, isInWishlist, getReviewStats, getGoldRates, getGlobalConfig } from "@/app/actions";
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get("slug") || "panorama-ring";
    try {
        const [product, rates, config] = await Promise.all([
            getProductBySlug(slug),
            getGoldRates(),
            getGlobalConfig()
        ]);

        if (!product) return NextResponse.json({ error: "Not found" });

        const [isWishlisted, reviewStats] = await Promise.all([
            isInWishlist(product.id),
            getReviewStats(product.id)
        ]);

        const fullDump = {
            product,
            rates,
            config,
            isWishlisted,
            reviewStats,
            userAgent: request.headers.get('user-agent')
        };

        // Write to a file in the project for permanent inspection
        const dumpPath = path.join(process.cwd(), 'debug_dump.json');
        fs.writeFileSync(dumpPath, JSON.stringify(fullDump, null, 2));

        return NextResponse.json({
            success: true,
            message: "Dump saved to debug_dump.json",
            productId: product.id,
            productName: product.name
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
