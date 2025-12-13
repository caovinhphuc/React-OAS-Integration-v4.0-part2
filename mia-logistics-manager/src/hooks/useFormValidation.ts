import { useState, useCallback, useEffect } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface UseFormValidationOptions {
  rules: ValidationRules;
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  options: UseFormValidationOptions
) => {
  const { rules, debounceMs = 300, validateOnChange = true, validateOnBlur = true } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validation function
  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const rule = rules[fieldName];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rule.message || `${fieldName} là bắt buộc`;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `${fieldName} phải có ít nhất ${rule.minLength} ký tự`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `${fieldName} không được vượt quá ${rule.maxLength} ký tự`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${fieldName} không hợp lệ`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  // Validate all fields
  const validateAll = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};
    let hasErrors = false;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setIsValid(!hasErrors);
    return newErrors;
  }, [values, validateField, rules]);

  // Debounced validation
  useEffect(() => {
    if (!validateOnChange) return;

    const timeoutId = setTimeout(() => {
      setIsValidating(true);
      validateAll();
      setTimeout(() => setIsValidating(false), 100);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [values, validateOnChange, debounceMs, validateAll]);

  // Handle input change
  const handleChange = useCallback((fieldName: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((fieldName: string) => {
    if (!validateOnBlur) return;

    setTouched(prev => ({ ...prev, [fieldName]: true }));

    const error = validateField(fieldName, values[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, [validateOnBlur, validateField, values]);

  // Handle form submit
  const handleSubmit = useCallback((onSubmit: (values: T) => void) => {
    return (e: React.FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(rules).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setTouched(allTouched);

      // Validate all fields
      const validationErrors = validateAll();

      // If no errors, submit
      if (Object.keys(validationErrors).length === 0) {
        onSubmit(values);
      }
    };
  }, [values, validateAll, rules]);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValidating(false);
    setIsValid(false);
  }, [initialValues]);

  // Get field props for easy use
  const getFieldProps = useCallback((fieldName: string) => ({
    value: values[fieldName] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      handleChange(fieldName, e.target.value);
    },
    onBlur: () => handleBlur(fieldName),
    error: touched[fieldName] ? errors[fieldName] : undefined,
    hasError: touched[fieldName] && !!errors[fieldName],
    isValid: touched[fieldName] && !errors[fieldName] && values[fieldName],
  }), [values, errors, touched, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    isValidating,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    validateAll,
    reset,
    getFieldProps,
  };
};

// Predefined validation rules
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email không hợp lệ',
  },
  password: {
    required: true,
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
  },
  phone: {
    required: true,
    pattern: /^[0-9]{10,11}$/,
    message: 'Số điện thoại phải có 10-11 chữ số',
  },
  fullName: {
    required: true,
    minLength: 2,
    message: 'Họ tên phải có ít nhất 2 ký tự',
  },
  confirmPassword: {
    required: true,
    message: 'Xác nhận mật khẩu là bắt buộc',
  },
};
