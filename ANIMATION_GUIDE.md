# Performance-Optimized Animation Guide

## 🚀 Key Features
- GPU-accelerated animations
- Intersection Observer for scroll reveals
- Framer Motion parallax effects
- Zero layout shift
- 60fps smooth animations

## 📦 Components

### 1. ParallaxScroll (Enhanced)
```tsx
import { ParallaxScroll } from '@/components/parallax-scroll'

// Basic parallax
<ParallaxScroll offset={100} direction="up">
  <YourContent />
</ParallaxScroll>

// Advanced with rotation and blur
<ParallaxScroll 
  offset={80}
  direction="down"
  scaleOffset={0.1}
  rotateOffset={5}
  blur={true}
>
  <YourContent />
</ParallaxScroll>
```

### 2. ScrollReveal (New)
```tsx
import { ScrollReveal, ScrollRevealStagger } from '@/components/scroll-reveal'

// Single element reveal
<ScrollReveal animation="slide-up" delay={0.2}>
  <YourContent />
</ScrollReveal>

// Staggered children
<ScrollRevealStagger animation="fade" staggerDelay={0.1}>
  {items.map(item => <Item key={item.id} {...item} />)}
</ScrollRevealStagger>
```

## 🎨 CSS Animation Classes

### Basic Animations
```tsx
// Fade in
<div className="animate-fade-in">Content</div>

// Slide up
<div className="animate-slide-up">Content</div>

// Scale in
<div className="animate-scale-in">Content</div>

// Rotate in
<div className="animate-rotate-in">Content</div>

// Blur in
<div className="animate-blur-in">Content</div>
```

### Continuous Animations
```tsx
// Floating effect
<div className="animate-float">Floating element</div>

// Pulse glow
<div className="animate-pulse-glow">Glowing element</div>
```

### Staggered Delays
```tsx
<div className="animate-slide-up animate-delay-100">Item 1</div>
<div className="animate-slide-up animate-delay-200">Item 2</div>
<div className="animate-slide-up animate-delay-300">Item 3</div>
```

### Hover Effects
```tsx
// Scale on hover
<div className="hover-scale">Hover me</div>

// Glow on hover
<div className="hover-glow">Hover me</div>

// Lift on hover
<div className="hover-lift transition-luxury">Hover me</div>
```

## 🎯 Performance Utilities

### GPU Acceleration
```tsx
// Force GPU acceleration
<div className="gpu-accelerated">Fast content</div>

// Parallax layers
<div className="parallax-near">Near layer</div>
<div className="parallax-mid">Mid layer</div>
<div className="parallax-far">Far layer</div>
```

### Content Visibility (Performance Boost)
```tsx
// Lazy render off-screen content
<div className="content-visibility-auto">
  Large content that's off-screen
</div>
```

### Intersection Observer
```tsx
// CSS-based reveal
<div className="reveal-on-scroll">
  Content reveals when scrolled into view
</div>

// Staggered items
<div className="stagger-item">Item 1</div>
<div className="stagger-item">Item 2</div>
<div className="stagger-item">Item 3</div>
```

## 🪝 Custom Hooks

### useScrollAnimation
```tsx
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

function MyComponent() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 })
  
  return (
    <div ref={ref} className={isVisible ? 'opacity-100' : 'opacity-0'}>
      Content
    </div>
  )
}
```

### useScrollProgress
```tsx
import { useScrollProgress } from '@/hooks/use-scroll-animation'

function ProgressBar() {
  const progress = useScrollProgress()
  
  return (
    <div className="fixed top-0 left-0 h-1 bg-primary" 
         style={{ width: `${progress}%` }} />
  )
}
```

### useElementScrollProgress
```tsx
import { useElementScrollProgress } from '@/hooks/use-scroll-animation'

function ParallaxElement() {
  const ref = useRef(null)
  const progress = useElementScrollProgress(ref)
  
  return (
    <div ref={ref} style={{ transform: `translateY(${progress * 100}px)` }}>
      Content
    </div>
  )
}
```

## 🎭 Animation Types

### Available Animations
- `fade` - Simple fade in
- `slide-up` - Slide from bottom
- `slide-right` - Slide from left
- `slide-left` - Slide from right
- `scale` - Scale up
- `rotate` - Rotate and scale
- `blur` - Blur to clear

### Timing Functions
- `transition-luxury` - 400ms smooth
- `transition-luxury-slow` - 600ms smooth
- `transition-smooth` - 300ms refined
- `ease-luxury` - Custom cubic-bezier
- `ease-luxury-bounce` - Bouncy easing

## 💡 Best Practices

1. **Use GPU Acceleration**: Add `gpu-accelerated` class to animated elements
2. **Lazy Load**: Use `content-visibility-auto` for off-screen content
3. **Stagger Animations**: Use delays for multiple items (100-200ms apart)
4. **Reduce Motion**: Respect user preferences with `prefers-reduced-motion`
5. **Will-Change**: Already included in utility classes, don't add manually
6. **Transform over Position**: Always use `transform` instead of `top/left`

## 🔥 Performance Tips

- All animations use `transform` and `opacity` (GPU-accelerated)
- `will-change` is automatically applied
- `backface-visibility: hidden` prevents flickering
- Intersection Observer reduces unnecessary calculations
- Spring physics for natural motion
- Passive event listeners for scroll

## 📊 Example: Product Card with All Effects

```tsx
<ScrollReveal animation="slide-up" delay={0.1}>
  <ParallaxScroll offset={30} scaleOffset={0.05}>
    <div className="hover-lift hover-glow transition-luxury gpu-accelerated">
      <div className="glass-luxury shadow-luxury-lg p-6">
        <h3 className="font-serif-display text-gradient-gold">
          Product Name
        </h3>
        <p className="font-body-refined">Description</p>
      </div>
    </div>
  </ParallaxScroll>
</ScrollReveal>
```

## 🎨 Combining Effects

```tsx
// Hero section with multiple layers
<section className="relative overflow-hidden">
  <ParallaxScroll offset={100} direction="down" className="parallax-far">
    <div className="absolute inset-0 bg-gradient-luxury" />
  </ParallaxScroll>
  
  <ParallaxScroll offset={50} className="parallax-mid">
    <div className="container-luxury section-padding">
      <ScrollReveal animation="blur" delay={0.2}>
        <h1 className="font-serif-display text-6xl text-gradient-gold">
          Luxury Title
        </h1>
      </ScrollReveal>
      
      <ScrollRevealStagger animation="slide-up" staggerDelay={0.15}>
        {features.map(feature => (
          <FeatureCard key={feature.id} {...feature} />
        ))}
      </ScrollRevealStagger>
    </div>
  </ParallaxScroll>
</section>
```

Performance: 60fps, no jank, smooth as butter! 🧈
