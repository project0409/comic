
export type OtpMode = "login" | "register";
export type UserRole = "reader" | "writer";

export type OtpRequestRecord = {
  email: string;
  otp: string;
  ipAddress: string;
  createdAt: number;
  expiresAt: number;
  mode: OtpMode;
  role: UserRole;
  displayName?: string;
};

export type LoginAuditRecord = {
  email: string;
  loginTime: number;
  ipAddress: string;
  userAgent: string;
};

const OTP_EXPIRY_MS = 5 * 60 * 1000;

type AuthSecurityState = {
  otpRequests: Map<string, OtpRequestRecord>;
  loginAudits: LoginAuditRecord[];
};

const authSecurityState = globalThis as typeof globalThis & {
  __fypAuthSecurityState?: AuthSecurityState;
};

const state =
  authSecurityState.__fypAuthSecurityState ??
  (authSecurityState.__fypAuthSecurityState = {
    otpRequests: new Map<string, OtpRequestRecord>(),
    loginAudits: []
  });

const { otpRequests, loginAudits } = state;

export function extractRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const socketIp =
    (request as unknown as { socket?: { remoteAddress?: string } }).socket?.remoteAddress ||
    (request as unknown as { ip?: string }).ip;

  const rawIp = forwardedFor || realIp || socketIp || "unknown";
  return rawIp.split(",")[0]?.trim() || "unknown";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateOtp() {
  if (process.env.NODE_ENV !== "production") return "123456";
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createOtpRequest({
  email,
  ipAddress,
  mode,
  role,
  displayName
}: {
  email: string;
  ipAddress: string;
  mode: OtpMode;
  role: UserRole;
  displayName?: string;
}) {
  const now = Date.now();
  const normalizedEmail = normalizeEmail(email);
  const record: OtpRequestRecord = {
    email: normalizedEmail,
    otp: generateOtp(),
    ipAddress,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    mode,
    role,
    displayName
  };

  otpRequests.set(normalizedEmail, record);
  return record;
}

export function resendOtp(email: string, ipAddress: string) {
  const existing = otpRequests.get(normalizeEmail(email));
  if (!existing) return null;
  return createOtpRequest({
    email: existing.email,
    ipAddress,
    mode: existing.mode,
    role: existing.role,
    displayName: existing.displayName
  });
}

export function verifyOtpRequest({
  email,
  otp,
  ipAddress,
  userAgent
}: {
  email: string;
  otp: string;
  ipAddress: string;
  userAgent: string;
}) {
  const normalizedEmail = normalizeEmail(email);
  const record = otpRequests.get(normalizedEmail);

  if (!record) return { ok: false as const, reason: "no_pending" as const };
  if (Date.now() > record.expiresAt) {
    otpRequests.delete(normalizedEmail);
    return { ok: false as const, reason: "expired" as const };
  }
  if (record.ipAddress !== ipAddress) {
    return { ok: false as const, reason: "ip_mismatch" as const, expectedIp: record.ipAddress, actualIp: ipAddress };
  }
  if (record.otp !== otp.replace(/\D/g, "").trim()) {
    return { ok: false as const, reason: "invalid" as const };
  }

  otpRequests.delete(normalizedEmail);
  loginAudits.unshift({
    email: record.email,
    loginTime: Date.now(),
    ipAddress,
    userAgent
  });

  return { ok: true as const, record };
}

export function getLoginAudits() {
  return loginAudits.slice(0, 100);
}
