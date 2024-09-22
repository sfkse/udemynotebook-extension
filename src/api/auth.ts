import { apiClient, setAuthToken, setRefreshToken } from "./apiClient";

interface AuthResponse {
  userID: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export const authenticateUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const data = await apiClient("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

export const registerUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const data = await apiClient("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.accessToken);
    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

