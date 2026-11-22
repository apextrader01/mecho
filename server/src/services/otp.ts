import crypto from 'crypto';

/**
 * Generate a 4-digit numeric verification OTP
 */
export function generate4DigitOtp(): string {
  const number = crypto.randomInt(1000, 10000); // 1000 to 9999
  return number.toString();
}
