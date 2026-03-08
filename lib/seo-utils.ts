/**
 * SEO Utilities for JSON-LD Schemas
 */

export interface BreadcrumbItem {
    name: string
    item: string
}

/**
 * Generates BreadcrumbList JSON-LD schema
 * @param items Array of breadcrumb items
 * @returns JSON-LD object
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': items.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name,
            'item': item.item.startsWith('http') ? item.item : `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.aurerxa.com'}${item.item}`
        }))
    }
}
