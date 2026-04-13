export interface JwtAccessPayload {
  sub: string;
  role: 'seeker' | 'employer';
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
}
