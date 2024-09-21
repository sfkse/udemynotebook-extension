import { API_BASE_URL } from "../utils/config";
import { jwtDecode } from "jwt-decode";

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp < Date.now() / 1000) {
      return true;
    }
    return false;
  } catch (error) {
    return true;
  }
};

const renewToken = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/renew`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to renew token");
  }

  const data = await response.json();
  setAuthToken(data.token);
  // Renew the token in the storage
  chrome.storage.sync.set({ token: data.token });
  return data.token;
};

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
  };

  if (authToken) {
    if (isTokenExpired(authToken)) {
      try {
        authToken = await renewToken();
      } catch (error) {
        // If token renewal fails, clear the token and throw an error
        setAuthToken(null);
        throw new Error("Session expired. Please log in again.");
      }
    }
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  console.log("endpoint", endpoint);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    method: options.method || "GET",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "API request failed");
  }

  return response.json();
};

