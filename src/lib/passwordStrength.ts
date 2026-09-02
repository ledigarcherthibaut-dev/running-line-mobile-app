export type PasswordStrengthColor = 'danger' | 'energy' | 'success';

export function passwordStrength(pw: string): { label: string; color: PasswordStrengthColor } | null {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Faible', color: 'danger' };
  if (score <= 2) return { label: 'Moyen', color: 'energy' };
  return { label: 'Fort', color: 'success' };
}
