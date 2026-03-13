import { AbstractControl, ValidationErrors } from '@angular/forms';

export const optionalPositiveIntegerValidator = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined || value === '') return null;

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return { positiveInteger: true };
  }

  return null;
};

export const nonNegativeIntegerValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return { required: true };
  }

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < 0) {
    return { nonNegativeInteger: true };
  }

  return null;
};

export const optionalUrlValidator = (control: AbstractControl): ValidationErrors | null => {
  const rawValue = control.value;
  const value = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!value) return null;
  if (value.length < 5) return { minlength: true };

  try {
    new URL(value);
    return null;
  } catch {
    return { invalidUrl: true };
  }
};
