export function isStringOnlyDigits(value: string): boolean {
  return /^\d+$/.test(value);
}
