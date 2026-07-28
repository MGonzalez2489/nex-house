export const ERROR_MESSAGES: Record<
  string,
  (label: string, args: any) => string
> = {
  required: (label) => `${label} is required.`,
  email: () => `Please enter a valid email address.`,
  minlength: (label, args) =>
    `${label} must be at least ${args.requiredLength} characters.`,
  maxlength: (label, args) =>
    `${label} cannot exceed ${args.requiredLength} characters.`,
  min: (label, args) => `${label} must be at least ${args.min}.`,
  pattern: (label) => `${label} format is invalid.`,
  mismatch: () => `Password and Confirm Password are different values.`,
};
