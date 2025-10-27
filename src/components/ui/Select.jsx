import { forwardRef, useId } from "react";
import "./Select.css";

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
            {required && <span className="required-indicator"> *</span>}
          </label>
        )}
        <select
          id={selectId}
          name={selectName}
          ref={ref}
          className={`select-input ${error ? "select-error" : ""} ${disabled ? "select-disabled" : ""
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
          <small className="helper-text">{helperText}</small>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
