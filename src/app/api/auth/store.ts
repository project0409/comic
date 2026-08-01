type OtpRecord = {
  email: string;
  otp: string;
  ipAddress: string;
  expiresAt: number;
};

type LoginAudit = {
  email: string;
  loginTime: number;
  ipAddress: string;
  userAgent: string;
};

const globalStore = globalThis as typeof globalThis & {
  __fypOtpRequests?: Map<string, OtpRecord>;
  __fypLoginAudits?: LoginAudit[];
};

export const otpRequests = globalStore.__fypOtpRequests ?? new Map<string, OtpRecord>();
export const loginAudits = globalStore.__fypLoginAudits ?? [];

globalStore.__fypOtpRequests = otpRequests;
globalStore.__fypLoginAudits = loginAudits;

export function getIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
    .split(",")[0]
    .trim();
}