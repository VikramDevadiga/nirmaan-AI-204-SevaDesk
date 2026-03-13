type SendOtpResult = {
  success: boolean;
  message?: string;
  code?: string;
};

type VerifyOtpResult = {
  success: boolean;
  message?: string;
};

// In-memory OTP store keyed by normalized phone number
const otpStore = new Map<string, string>();

function normalizeIndianPhoneNumber(input: string) {
  const digits = input.replace(/\D/g, '');

  if (/^[6-9]\d{9}$/.test(digits)) return digits;
  if (/^91[6-9]\d{9}$/.test(digits)) return digits.slice(2);

  return digits;
}

export function normalizeWhatsappOtpPhone(input: string) {
  return normalizeIndianPhoneNumber(input);
}

export async function sendWhatsappOtp(input: string): Promise<SendOtpResult> {
  const phone = normalizeIndianPhoneNumber(input);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phone, code);
  return { success: true, code };
}

export async function verifyWhatsappOtp(input: string, code: string): Promise<VerifyOtpResult> {
  const phone = normalizeIndianPhoneNumber(input);
  const stored = otpStore.get(phone);

  if (!stored) {
    return { success: false, message: 'OTP expired or not found. Please request a new OTP.' };
  }

  if (stored !== code.trim()) {
    return { success: false, message: 'Invalid OTP code.' };
  }

  otpStore.delete(phone);
  return { success: true, message: 'OTP verified.' };
}
