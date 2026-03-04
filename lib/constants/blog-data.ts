export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    cover_image: string;
    category: string;
    author: string;
    published_at: string;
    tags: string[];
}

export const STATIC_BLOG_POSTS: BlogPost[] = [
    {
        id: '1',
        slug: 'what-is-bis-hallmark-in-gold-jewellery',
        title: 'What is BIS Hallmark in Gold Jewellery?',
        excerpt: 'Learn why BIS hallmark certification is the most important check when buying gold in India.',
        content: `When buying gold jewellery in India, BIS hallmark certification is one of the most important things to check. BIS stands for the Bureau of Indian Standards, the national authority that certifies gold purity.

## What Does BIS Hallmark Mean?

A BIS hallmark confirms:
- Gold purity (22K, 18K etc.)
- Assaying centre mark
- Jeweller identification mark
- Year of marking

This ensures the gold you buy is genuine and meets government standards.

## Why is BIS Hallmark Important?

✔ Protects buyers from fraud
✔ Ensures correct purity
✔ Improves resale value
✔ Builds trust

At Aurerxa, we provide BIS hallmarked gold jewellery so you shop with confidence.`,
        cover_image: '/photo_6066572646712807064_y.jpg',
        category: 'Guide',
        author: 'Naiem Shaikh',
        published_at: '2026-03-04T10:00:00Z',
        tags: ['Gold', 'Purity', 'Hallmark', 'Investment']
    },
    {
        id: '2',
        slug: 'how-to-clean-silver-jewellery-at-home',
        title: 'How to Clean Silver Jewellery at Home',
        excerpt: 'Restore the shine of your silver jewelry with these simple home cleaning methods.',
        content: `Silver jewellery can lose shine over time due to oxidation. But you can safely clean it at home.

## Method 1: Baking Soda & Foil

- Line a bowl with foil
- Add hot water
- Add 1 tbsp baking soda
- Dip silver jewellery for 5–10 minutes

Rinse and dry gently.

## Method 2: Mild Soap

Use mild soap + warm water. Avoid harsh chemicals.

Always store silver jewellery in airtight boxes to prevent tarnishing.

Aurerxa’s 925 silver jewellery is crafted for durability and long-lasting shine.`,
        cover_image: '/closeup-shot-female-wearing-beautiful-silver-necklace-with-pendant.jpg',
        category: 'Care Tips',
        author: 'Naiem Shaikh',
        published_at: '2026-03-04T11:00:00Z',
        tags: ['Silver', 'Care', 'DIY', 'Cleaning']
    },
    {
        id: '3',
        slug: 'how-to-check-gold-purity-before-buying',
        title: 'How to Check Gold Purity Before Buying',
        excerpt: 'Essential tips to verify gold purity before making an online or offline purchase.',
        content: `Buying gold jewellery online in India? Here’s how to verify purity:

## 1️⃣ Check for Hallmark

Look for BIS stamp + purity mark (22K916 etc.)

## 2️⃣ Magnet Test

Pure gold is not magnetic.

## 3️⃣ Buy from Trusted Brands

Always purchase from reputed jewellery brands with clear return policy.

At Aurerxa, we ensure certified gold purity with transparent pricing.`,
        cover_image: '/photo_6066572646712807069_y.jpg',
        category: 'Guide',
        author: 'Naiem Shaikh',
        published_at: '2026-03-04T12:00:00Z',
        tags: ['Gold', 'Trust', 'Purity', 'Shopping']
    },
    {
        id: '4',
        slug: 'lightweight-gold-jewellery-perfect-for-daily-wear',
        title: 'Lightweight Gold Jewellery – Perfect for Daily Wear',
        excerpt: 'Discover why modern women prefer lightweight gold pieces for everyday elegance.',
        content: `Modern women prefer lightweight gold jewellery for everyday elegance.

## Why Lightweight Jewellery?

- Comfortable
- Budget friendly
- Easy to style
- Suitable for office & daily wear

Look for:
- 22K gold rings
- Minimal gold earrings
- Simple gold pendants

Aurerxa offers daily wear gold jewellery designed for comfort and style.`,
        cover_image: '/long-earring-with-violet-precious-stones-hang-from-woman-s-ear.jpg',
        category: 'Trends',
        author: 'Naiem Shaikh',
        published_at: '2026-03-04T13:00:00Z',
        tags: ['Daily Wear', 'Gold', 'Trends', 'Minimalism']
    },
    {
        id: '5',
        slug: 'how-to-store-gold-jewellery-safely-at-home',
        title: 'How to Store Gold Jewellery Safely at Home',
        excerpt: 'Protect your investment by learning the right way to store your gold and silver pieces.',
        content: `Proper storage increases jewellery lifespan.

## Storage Tips:

✔ Store separately to avoid scratches
✔ Use soft cloth pouches
✔ Avoid moisture
✔ Remove before perfume or hairspray

Never mix gold and silver jewellery in the same box.

Aurerxa jewellery is crafted for durability, but proper care keeps it shining longer.`,
        cover_image: '/heritage-rings.jpg',
        category: 'Care Tips',
        author: 'Naiem Shaikh',
        published_at: '2026-03-04T14:00:00Z',
        tags: ['Gold', 'Storage', 'Care', 'Maintenance']
    }
];
