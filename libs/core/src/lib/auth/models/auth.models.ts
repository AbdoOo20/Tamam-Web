export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  businessName: string;
  ownerName: string;
  phone: string;
  countryCode: string;
  email: string;
  password: string;
}

/** Response of `POST /auth/login` and `POST /auth/register`. */
export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  userId: number;
  merchantId: number | null;
  fullName: string;
  role: string;
}

/** Response of `GET /auth/me`. */
export interface CurrentUser {
  userId: number | null;
  merchantId: number | null;
  role: string | null;
}

/** What is kept (encrypted) in the browser storage after a login. */
export type UserSession = AuthResponse;
