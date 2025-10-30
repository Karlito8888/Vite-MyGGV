import { motion } from 'framer-motion'

/**
 * PageTransition - Wrapper component for page animations
 * Replaces the CSS animation on .page-content with Framer Motion
 * 
 * Usage:
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 */
function PageTransition({ children, className = '', style = {} }) {
  return (
    <motion.div
      className={`page-content ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] // easeOut
      }}
      style={{
        willChange: 'opacity, transform',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        ...style // Merge custom styles
      }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
