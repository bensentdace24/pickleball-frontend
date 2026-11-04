import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ForwardRefExoticComponent, RefAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: boolean;
}

const Input = ((
  props: InputProps,
  ref: React.Ref<HTMLInputElement>,
) => {
  const { className = "", error, id, ...rest } = props;
  const inputId = id;

  return (
    <input
      ref={ref}
      id={inputId}
      className={`
        w-full rounded-lg border px-3 py-2 text-text-primary
        placeholder:text-text-tertiary
        bg-surface-card
        border-border
        focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none
        disabled:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60
        transition-colors duration-fast
        ${error ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20" : ""}
        ${className}
      `}
      aria-invalid={error ? "true" : "false"}
      {...rest}
    />
  );
}) as ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>;

Input.displayName = "Input";

export { Input };

/* Textarea component */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  error?: boolean;
}

const Textarea = ((
  props: TextareaProps,
  ref: React.Ref<HTMLTextAreaElement>,
) => {
  const { className = "", error, id, ...rest } = props;

  return (
    <textarea
      ref={ref}
      id={id}
      className={`
        w-full rounded-lg border px-3 py-2 text-text-primary
        placeholder:text-text-tertiary
        bg-surface-card
        border-border
        focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none
        disabled:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60
        transition-colors duration-fast resize-y min-h-[80px]
        ${error ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20" : ""}
        ${className}
      `}
      aria-invalid={error ? "true" : "false"}
      {...rest}
    />
  );
}) as ForwardRefExoticComponent<TextareaProps & RefAttributes<HTMLTextAreaElement>>;

Textarea.displayName = "Textarea";

export { Textarea };

/* Select component */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  error?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
}

const Select = ((
  props: SelectProps,
  ref: React.Ref<HTMLSelectElement>,
) => {
  const { className = "", error, placeholder, options, id, ...rest } = props;

  return (
    <select
      ref={ref}
      id={id}
      className={`
        w-full rounded-lg border px-3 py-2 text-text-primary
        bg-surface-card
        border-border
        focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none
        disabled:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60
        transition-colors duration-fast
        appearance-none
        bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")] bg-right-3 bg-no-repeat pr-10
        ${error ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20" : ""}
        ${className}
      `}
      aria-invalid={error ? "true" : "false"}
      {...rest}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((opt: { value: string; label: string }) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}) as ForwardRefExoticComponent<SelectProps & RefAttributes<HTMLSelectElement>>;

Select.displayName = "Select";

export { Select };

/* Checkbox component */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
  className?: string;
}

export function Checkbox({ label, description, className = "", id, ...props }: CheckboxProps) {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        id={checkboxId}
        className={`
          mt-0.5 h-4 w-4 rounded border-border
          text-primary-600
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          transition-colors duration-fast
        `}
        {...props}
      />
      <div>
        <span className="text-sm font-medium text-text-primary">{label}</span>
        {description && <p className="mt-0.5 text-sm text-text-secondary">{description}</p>}
      </div>
    </label>
  );
}

/* Radio group component */
interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
  error?: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  label,
  error,
  className = "",
  orientation = "vertical",
}: RadioGroupProps) {
  return (
    <fieldset className={className}>
      {label && (
        <legend className="text-sm font-medium text-text-primary mb-2">{label}</legend>
      )}
      <div
        className={`
          flex gap-4
          ${orientation === "horizontal" ? "flex-wrap" : "flex-col"}
        `}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => (
          <label key={option.value} className="flex items-start gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={`
                mt-0.5 h-4 w-4 border-border
                text-primary-600
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-50
                transition-colors duration-fast
              `}
            />
            <div>
              <span className="text-sm font-medium text-text-primary">{option.label}</span>
              {option.description && <p className="text-sm text-text-secondary">{option.description}</p>}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400" role="alert">{error}</p>}
    </fieldset>
  );
}

/* Field wrapper for consistent spacing */
import type { ReactNode } from "react";

interface FieldProps {
  children: ReactNode;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export function Field({
  children,
  label,
  error,
  hint,
  required,
  className = "",
  id,
}: FieldProps) {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
          {required && <span className="text-danger-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-danger-600 dark:text-danger-400" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-sm text-text-tertiary">
          {hint}
        </p>
      )}
    </div>
  );
}