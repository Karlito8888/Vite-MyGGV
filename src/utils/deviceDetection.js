/**
 * Détecte le type d'appareil et retourne le niveau de zoom approprié pour la carte
 * @returns {number} Le niveau de zoom recommandé
 */
export function getDeviceZoom() {
    const width = window.innerWidth

    // Smartphone (< 768px)
    if (width < 768) {
        return 15
    }

    // Tablet (768px - 1024px)
    if (width >= 768 && width < 1024) {
        return 16
    }

    // Laptop (1024px - 1440px)
    if (width >= 1024 && width < 1440) {
        return 16
    }

    // Desktop (>= 1440px)
    return 16
}

/**
 * Détecte le type d'appareil basé sur la largeur de l'écran
 * @returns {'smartphone' | 'tablet' | 'laptop' | 'desktop'}
 */
export function getDeviceType() {
    const width = window.innerWidth

    if (width < 768) return 'smartphone'
    if (width >= 768 && width < 1024) return 'tablet'
    if (width >= 1024 && width < 1440) return 'laptop'
    return 'desktop'
}
