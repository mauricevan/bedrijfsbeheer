import { useState, useCallback } from "react";
import type { ValidationResult } from "../utils/validators";

/**
 * Generic form hook for managing form state, validation, and submission
 * @param initialData - Initial form data
 * @param validator - Validation function that takes form data and returns ValidationResult
 * @returns Form state and handlers
 */
export const useForm = <T extends Record<string, any>>(
  initialData: T,
  validator?: (data: T) => ValidationResult
) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Update a single field in the form
   */
  const handleChange = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Clear error for this field when user starts typing
      if (errors[String(field)]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[String(field)];
          return newErrors;
        });
      }
    },
    [errors]
  );

  /**
   * Update nested field (e.g., formData.items[0].quantity)
   */
  const handleNestedChange = useCallback(
    <K extends keyof T>(field: K, updater: (value: T[K]) => T[K]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: updater(prev[field]),
      }));
    },
    []
  );

  /**
   * Set multiple fields at once
   */
  const setFields = useCallback((updates: Partial<T>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Validate the form
   */
  const validate = useCallback((): boolean => {
    if (!validator) return true;

    const result = validator(formData);
    if (!result.isValid) {
      setErrors({
        _form: result.message || "Formulier bevat fouten",
      });
      return false;
    }

    setErrors({});
    return true;
  }, [formData, validator]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (onSubmit: (data: T) => void | Promise<void>) => {
      setIsSubmitting(true);
      try {
        if (!validate()) {
          setIsSubmitting(false);
          return;
        }

        await onSubmit(formData);
      } catch (error) {
        setErrors({
          _form: (error as Error).message || "Er is een fout opgetreden",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validate]
  );

  /**
   * Reset form to initial data
   */
  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  /**
   * Set a specific error
   */
  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Check if form has errors
   */
  const hasErrors = Object.keys(errors).length > 0;

  return {
    formData,
    errors,
    isSubmitting,
    hasErrors,
    handleChange,
    handleNestedChange,
    setFields,
    validate,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setFormData, // Expose setFormData for advanced use cases
  };
};

