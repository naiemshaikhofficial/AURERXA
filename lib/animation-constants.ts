export const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

export const fadeInUp = {
    initial: { opacity: 0, y: 15 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: PREMIUM_EASE }
    }
};

export const fadeIn = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.3, ease: PREMIUM_EASE }
    }
};

export const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05
        }
    }
};

export const scaleIn = {
    initial: { opacity: 0, scale: 0.98 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: PREMIUM_EASE }
    }
};

export const hoverScale = {
    whileHover: {
        scale: 1.01,
        transition: { duration: 0.2, ease: PREMIUM_EASE }
    }
};

export const scrollReveal = {
    initial: { opacity: 0, y: 20 },
    whileInView: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: PREMIUM_EASE }
    },
    viewport: { once: true, margin: "-50px" }
};
