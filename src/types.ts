export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
}

export interface UserInfoResponse {
  sub: string;
  email_verified: boolean;
  name: string;
  locale: object;
  given_name: string;
  family_name: string;
  email: string;
  picture: string;
}

export interface ShareResult {
  success: boolean;
  postId?: string | null;
}
