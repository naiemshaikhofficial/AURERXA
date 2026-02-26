# Database Optimization Best Practices for AURERXA

To reduce database pressure and improve performance, follow these best practices:

## 1. Deduplicate Server-Side Calls
Use `react.cache` to wrap functions that fetch data from Supabase. This ensures that if the same data is requested multiple times during a single page render (e.g., in `layout.tsx` and a sub-component), ONLY ONE database call is made.

**Implemented in `actions.ts`:**
```typescript
export const getCurrentUserProfile = cache(async () => {
  // ... fetch logic
})
```

## 2. select Only Necessary Fields
Avoid `select('*')`. Fetching columns you don't use wastes bandwidth and DB resources. Always specify exactly what you need.

**Implemented in `AuthContext`:**
```typescript
supabase.from('profiles').select('id, full_name, email, phone_number, is_banned')
```

## 3. Leverage Client-Side Context
Instead of multiple components fetching the same user session, fetch it once at the root layout and pass it down via React Context (like `AuthContext`). This prevents "flickering" and reduces redundant API calls.

## 4. Polling & Real-time
Only poll if absolutely necessary. For admin notifications, use a reasonable interval (e.g., 60s) or transition to Supabase Real-time subscriptions for better efficiency.

## 5. Middleware Optimization
Ensure middleware only runs on necessary routes. Avoid running complex logic or DB checks in middleware for static assets or public pages.

## 6. Durable Caching (`unstable_cache`)
For public data that doesn't change on every request (like product details, collections, or site settings), use `unstable_cache`. This persists data across different users and requests, significantly reducing Vercel execution time.

**Implemented for Site Settings:**
```typescript
export async function getSiteSetting<T>(key: string) {
  return unstable_cache(
    async () => fetchFromDB(key),
    [`setting-${key}`],
    { revalidate: 3600, tags: ['settings'] }
  )()
}
```

## 7. Vercel Edge Config (Pro Tip)
For high-frequency global settings like **Maintenance Mode** or **Promotion Banners**, use Vercel Edge Config. It reads data at the "Edge" in <1ms without hitting the Supabase database at all, making it free and nearly instantaneous.

## 8. CDN Caching
Add `stale-while-revalidate` headers to public API responses. This allows Vercel to serve a cached version of the data immediately while fetching the update in the background.

## 9. Avoid N+1 Queries
When fetching a list of items (e.g., Orders) and their relations (e.g., Order Items), use Supabase's `inner join` syntax (`select('*, order_items(*)')`) instead of fetching items in a loop.
