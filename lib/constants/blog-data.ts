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
        content: `**BIS Hallmark is a certification given by the Bureau of Indian Standards (BIS) that guarantees the purity and fineness of gold jewellery.** This mandatory hallmark protects buyers in India by ensuring the gold meets the specified fineness (e.g., 22K is 91.6% pure gold).

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
        cover_image: '/blog/bis-hallmark.png',
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
        content: `**To clean silver jewellery at home, line a bowl with aluminum foil, add hot water and one tablespoon of baking soda, then soak the piece for 10 minutes.** This simple electrochemical process removes tarnish and restores shine without harsh polishing.

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
        cover_image: '/blog/silver-cleaning.png',
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
        content: `**To verify gold purity before buying, first check for the 3-digit purity mark (e.g., 916 for 22K) and the official BIS triangular stamp.** You can also perform a simple magnet test, as genuine gold is not magnetic and will not react to a strong magnet.

## 1️⃣ Check for Hallmark

Look for BIS stamp + purity mark (22K916 etc.)

## 2️⃣ Magnet Test

Pure gold is not magnetic.

## 3️⃣ Buy from Trusted Brands

Always purchase from reputed jewellery brands with clear return policy.

At Aurerxa, we ensure certified gold purity with transparent pricing.`,
        cover_image: '/blog/gold-purity.png',
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
        content: `**Lightweight gold jewellery refers to pieces crafted using high-purity gold but with minimalist, efficient designs that weigh less, typically under 10 grams.** These pieces offer the prestige of gold combined with the comfort and affordability required for everyday wear.

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
        cover_image: '/blog/lightweight-gold.png',
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
        content: `**Gold jewellery should be stored in individual soft-lined compartments or cloth pouches to prevent scratches from other hardness levels.** Keeping gold in a dry, dark place away from moisture and perfumes prevents long-term dullness and alloy oxidation.

## Storage Tips:

✔ Store separately to avoid scratches
✔ Use soft cloth pouches
✔ Avoid moisture
✔ Remove before perfume or hairspray

Never mix gold and silver jewellery in the same box.

Aurerxa jewellery is crafted for durability, but proper care keeps it shining longer.`,
        cover_image: '/blog/jewelry-storage.png',
        category: 'Care Tips',
        author: 'Naiem Shaikh',
        published_at: '2026-03-04T14:00:00Z',
        tags: ['Gold', 'Storage', 'Care', 'Maintenance']
    }
];
