import { forwardRef, useId } from "react";
import styles from "./Select.module.css";

const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      placeholder = "Select an option",
      className = "",
      required = false,
      disabled = false,
      id,
      name,
      autoComplete = "off",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const selectName = name || props.name;

    return (
      <div className="form-group">
        {label && (
          <label htmlFor={selectId} className="form-label">
            {label}
            {required && <span className={styles.requiredIndicator}> *</span>}
          </label>
        )}
        <select
          id={selectId}
          name={selectName}
          ref={ref}
          className={`${styles.selectInput} ${error ? styles.selectError : ""} ${disabled ? styles.selectDisabled : ""
            } ${className}`}
          disabled={disabled}
          autoComplete={autoComplete}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="error-text">{error}</span>}
        {helperText && !error && (
          <small className={styles.helperText}>{helperText}</small>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
