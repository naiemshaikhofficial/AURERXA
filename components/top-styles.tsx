import { getFilteredProducts } from '@/app/actions'
import { TopStylesClient } from './top-styles-client'

export async function TopStyles() {
    // Parallel fetch for all curated filters to enable instant switching
    const [all, chains, rings, bracelets] = await Promise.all([
        getFilteredProducts({ sortBy: 'popular' }),
        getFilteredProducts({ sub_category: 'chains', tag: 'chains', sortBy: 'popular' }),
        getFilteredProducts({ sub_category: 'rings', tag: 'rings', sortBy: 'popular' }),
        getFilteredProducts({ sub_category: 'bracelates', tag: 'bracelets', sortBy: 'popular' })
    ])

    const dataMap = {
        all: all ? all.slice(0, 8) : [],
        chains: chains ? chains.slice(0, 8) : [],
        rings: rings ? rings.slice(0, 8) : [],
        bracelets: bracelets ? bracelets.slice(0, 8) : []
    }

    return (
        <TopStylesClient
            dataMap={dataMap as any}
        />
    )
}
