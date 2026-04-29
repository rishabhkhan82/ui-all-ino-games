export interface Game {
  id: number;
  name: string;
  gameType: number;
  active: boolean;
  openTime: string;
  openNumber: string;
  closeTime: string;
  closeNumber: string;
  createdAt: string;
}

export interface User {
  username: string;
  password?: string;
  token?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  success: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}