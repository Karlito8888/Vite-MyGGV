import { forwardRef, useId } from 'react'
import './Input.css'

const Input = forwardRef(({
    label,
    id,
    className = '',
    error,
    ...props
}, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
        <div className={`input-field ${className}`}>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                </label>
            )}
            <input
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