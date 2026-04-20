import { client } from "./client";

export interface LoginResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user_id: string;
  username: string;
  email: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CurrentUserResponse {
  success: boolean;
  user: User;
}

export interface RefreshTokenResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Register a new user
 */
export async function register(
  username: string,
  email: string,
  password: string,
): Promise<RegisterResponse> {
  const response = await client.post<RegisterResponse>("/auth/register", {
    username,
    email,
    password,
  });
  return response as unknown as RegisterResponse;
}

/**
 * Login user
 */
export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  try {
    const response = await client.post("/auth/login", {
      username,
      password,
    });

    // Ensure response has the expected structure
    if (response && typeof response === 'object' && 'success' in response) {
      return response as unknown as LoginResponse
    }

    throw new Error("Invalid response format from login endpoint");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Get current user information
 */
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }

  const response = await client.get<CurrentUserResponse>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response as unknown as CurrentUserResponse;
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<RefreshTokenResponse> {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }

  const response = await client.post<RefreshTokenResponse>(
    "/auth/refresh",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response as unknown as RefreshTokenResponse;
}

/**
 * Logout user
 */
export function logout(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("access_token");
}

/**
 * Get stored user information
 */
export function getStoredUser(): User | null {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return null;
  }
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}
