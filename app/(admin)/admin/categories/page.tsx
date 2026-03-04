import React from 'react'
import CategoryManager from './category-manager'

export const dynamic = 'force-dynamic'

export default function AdminCategoriesPage() {
    return (
        <div className="min-h-full">
            <CategoryManager />
        </div>
    )
}
