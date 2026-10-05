/**
 * Validasi Kata Sandi Pengelola Dapur Nia:
 * - Panjang: 8 - 12 karakter
 * - Memiliki minimal 1 huruf kapital (A-Z)
 * - Memiliki minimal 1 angka (0-9)
 * - Memiliki minimal 1 simbol / karakter khusus
 */
export interface PasswordValidationResult {
  isValid: boolean;
  hasLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  message?: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  const hasLength = password.length >= 8 && password.length <= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const isValid = hasLength && hasUppercase && hasNumber && hasSymbol;

  let message: string | undefined = undefined;

  if (!hasLength) {
    message = 'Kata sandi harus terdiri dari 8 sampai 12 karakter.';
  } else if (!hasUppercase) {
    message = 'Kata sandi harus mengandung minimal 1 huruf kapital (A-Z).';
  } else if (!hasNumber) {
    message = 'Kata sandi harus mengandung minimal 1 angka (0-9).';
  } else if (!hasSymbol) {
    message = 'Kata sandi harus mengandung minimal 1 karakter simbol (contoh: @, #, $, !, %, &, *).';
  }

  return {
    isValid,
    hasLength,
    hasUppercase,
    hasNumber,
    hasSymbol,
    message,
  };
}
