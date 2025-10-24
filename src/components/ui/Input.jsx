import { forwardRef, useId } from 'react'
import './Input.css'

const Input = forwardRef(({
    label,
    id,
    className = '',
    error,
    as = 'input',
    ...props
}, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const Component = as

    return (
        <div className={`input-field ${className}`}>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                </label>
            )}
            <Component
                id={inputId}
                ref={ref}
                className="input"
                style={{ fontSize: '16px' }}
                aria-invalid={error ? 'true' : 'false'}
                {...props}
            />
            {error && (
                <span className="input-error" role="alert">
                    {error}
                </span>
            )}
        </div>
    )
})

Input.displayName = 'Input'

export default Input