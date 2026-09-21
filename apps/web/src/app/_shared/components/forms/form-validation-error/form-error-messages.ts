import { ValidationErrors } from "@angular/forms";

/**
 * Map of form validation error messages.
 *
 * Each key maps to the name of an Angular error (e.g. "required",
 * "minlength"). The function receives the field label and the arguments
 * attached to the error (e.g. `requiredLength`, `min`, `max`) and returns the
 * text shown to the user.
 */
type ErrorMessageBuilder = (
  label: string,
  args: ValidationErrors[string],
) => string;

export const ERROR_MESSAGES: Record<string, ErrorMessageBuilder> = {
  required: (label) => `${label} es obligatorio.`,
  email: () => "Ingresa un correo electrónico válido.",
  minlength: (label, args) =>
    `${label} debe tener al menos ${args.requiredLength} caracteres.`,
  maxlength: (label, args) =>
    `${label} no puede exceder ${args.requiredLength} caracteres.`,
  min: (label, args) => `${label} debe ser al menos ${args.min}.`,
  max: (label, args) => `${label} no puede ser mayor a ${args.max}.`,
  pattern: (label) => `El formato de ${label} es inválido.`,
  mismatch: () => "La contraseña y su confirmación no coinciden.",
};
