export interface Student {
  first_name: string;
  last_name: string;
  email: string;
  roll_no: string;
}

export interface APITokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ShareTokenResponse {
  shareToken: string;
}