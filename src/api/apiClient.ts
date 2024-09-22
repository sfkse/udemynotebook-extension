import { API_BASE_URL } from "../utils/config";
import { jwtDecode } from "jwt-decode";

let authToken: string | null = null;
let refreshToken: string | null = null;

interface QueuedRequest {
  endpoint: string;
  options: RequestInit;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

let isRefreshing = false;
let requestQueue: QueuedRequest[] = [];

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const setRefreshToken = (token: string | null) => {
  refreshToken = token;
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
  const response = await fetch(`${API_BASE_URL}/auth/renewToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ refreshToken }),
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

const processQueue = () => {
  requestQueue.forEach(({ endpoint, options, resolve, reject }) => {
    apiClient(endpoint, options).then(resolve).catch(reject);
  });
  requestQueue = [];
};

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
  };

  if (authToken) {
    if (isTokenExpired(authToken)) {
      if (isRefreshing) {
        // If a token refresh is already in progress, add this request to the queue
        return new Promise((resolve, reject) => {
          requestQueue.push({ endpoint, options, resolve, reject });
        });
      }

      isRefreshing = true;
      try {
        authToken = await renewToken();
        isRefreshing = false;
        processQueue(); // Process any queued requests
      } catch (error) {
        isRefreshing = false;
        setAuthToken(null);
        requestQueue.forEach(({ reject }) => reject(error));
        requestQueue = [];
        throw new Error("Session expired. Please log in again.");
      }
    }
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  try {
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
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

