import { forwardRef, useId } from 'react'
import styles from './Input.module.css'

const Input = forwardRef(({
    label,
    id,
    name,
    className = '',
    error,
    helperText,
    as = 'input',
    autoComplete,
    required,
    ...props
}, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const inputName = name || props.name
    const Component = as

    // Auto-detect autocomplete based on name or type if not provided
    const getAutoComplete = () => {
        if (autoComplete !== undefined) return autoComplete;
        
        // Common autocomplete mappings
        const autoCompleteMap = {
            'email': 'email',
            'username': 'username',
            'phone': 'tel',
            'tel': 'tel',
            'address': 'street-address',
            'city': 'address-level2',
            'province': 'address-level1',
            'postal_code': 'postal-code',
            'url': 'url',
        };

        if (inputName && autoCompleteMap[inputName]) {
            return autoCompleteMap[inputName];
        }

        if (props.type && autoCompleteMap[props.type]) {
            return autoCompleteMap[props.type];
        }

        return 'off';
    };

    return (
        <div className={`${styles.inputField} ${className}`}>
            {label && (
                <label htmlFor={inputId} className={styles.inputLabel}>
                    {label}
                    {required && <span className="required-indicator"> *</span>}
                </label>
            )}
            <Component
                id={inputId}
                name={inputName}
                ref={ref}
                className={styles.input}
                style={{ fontSize: '16px' }}
                aria-invalid={error ? 'true' : 'false'}
                autoComplete={getAutoComplete()}
                required={required}
                {...props}
            />
            {helperText && !error && (
                <span className="input-helper" style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                    {helperText}
                </span>
            )}
            {error && (
                <span className={styles.inputError} role="alert">
                    {error}
                </span>
            )}
        </div>
    )
})

Input.displayName = 'Input'

export default Input