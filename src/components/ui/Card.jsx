import styles from './Card.module.css'

export default function Card({
  children,
  className = '',
  hover = false,
  ...props
}) {
  return (
    <div
      className={`${styles.card} ${hover ? styles.cardHover : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`${styles.cardHeader} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`${styles.cardTitle} ${className}`} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`${styles.cardDescription} ${className}`} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`${styles.cardContent} ${className}`} {...props}>
      {children}
    </div>
  )
}