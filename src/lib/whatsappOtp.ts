type SendOtpResult = {
  success: boolean;
  message?: string;
};

type VerifyOtpResult = {
  success: boolean;
  message?: string;
};

function normalizeIndianPhoneNumber(input: string) {
  const digits = input.replace(/\D/g, '');

  if (/^[6-9]\d{9}$/.test(digits)) return digits;
  if (/^91[6-9]\d{9}$/.test(digits)) return digits.slice(2);

  return digits;
}

function toWhatsappAddress(input: string) {
  const normalized = normalizeIndianPhoneNumber(input);
  return `whatsapp:+91${normalized}`;
}

function getVerifyConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    return null;
  }

  return { accountSid, authToken, serviceSid };
}

function getAuthHeader(accountSid: string, authToken: string) {
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
}

export function normalizeWhatsappOtpPhone(input: string) {
  return normalizeIndianPhoneNumber(input);
}

export async function sendWhatsappOtp(input: string): Promise<SendOtpResult> {
  const config = getVerifyConfig();

  if (!config) {
    return {
      success: false,
      message: 'WhatsApp OTP service is not configured on the server.',
    };
  }

  const response = await fetch(`https://verify.twilio.com/v2/Services/${config.serviceSid}/Verifications`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(config.accountSid, config.authToken),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: toWhatsappAddress(input),
      Channel: 'whatsapp',
    }),
    cache: 'no-store',
  });

  const data = await response.json() as { status?: string; message?: string };

  if (!response.ok) {
    return {
      success: false,
      message: data.message || 'Failed to send WhatsApp OTP.',
    };
  }

  return {
    success: true,
    message: data.status ? `OTP status: ${data.status}` : 'OTP sent successfully.',
  };
}

export async function verifyWhatsappOtp(input: string, code: string, demoCode?: string): Promise<VerifyOtpResult> {
  const config = getVerifyConfig();

  if (!config) {
    return {
      success: false,
      message: 'WhatsApp OTP service is not configured on the server.',
    };
  }

  const response = await fetch(`https://verify.twilio.com/v2/Services/${config.serviceSid}/VerificationCheck`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(config.accountSid, config.authToken),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: toWhatsappAddress(input),
      Code: code,
    }),
    cache: 'no-store',
  });

  const data = await response.json() as { status?: string; valid?: boolean; message?: string };

  if (!response.ok) {
    return {
      success: false,
      message: data.message || 'Failed to verify OTP.',
    };
  }

  return {
    success: data.status === 'approved' || data.valid === true,
    message: data.status === 'approved' || data.valid === true ? 'OTP verified.' : 'Invalid OTP code.',
  };
}
