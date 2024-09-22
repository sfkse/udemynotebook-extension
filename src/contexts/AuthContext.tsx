import React, { createContext, useState, useContext, useEffect } from "react";
import { authenticateUser, registerUser } from "../api/auth";
import { setAuthToken, setRefreshToken } from "../api/apiClient";

interface AuthContextType {
  user: { userID: string; email: string } | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<{ userID: string; email: string } | null>(
    null
  );
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    chrome.storage.sync.get(
      ["userID", "email", "token", "refreshToken"],
      (result) => {
        if (
          result.userID &&
          result.email &&
          result.token &&
          result.refreshToken
        ) {
          setUser({ userID: result.userID, email: result.email });
          setToken(result.token);
          setAuthToken(result.token);
          setRefreshToken(result.refreshToken);
        }
        setIsLoading(false);
      }
    );
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authenticateUser(email, password);
      chrome.storage.sync.set({
        userID: data.userID,
        email: data.email,
        token: data.accessToken,
        refreshToken: data.refreshToken,
      });
      setUser({ userID: data.userID, email: data.email });
      setToken(data.accessToken);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await registerUser(email, password);
      chrome.storage.sync.set({
        userID: data.userID,
        email: data.email,
        token: data.accessToken,
      });
      setUser({ userID: data.userID, email: data.email });
      setToken(data.accessToken);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    chrome.storage.sync.remove(
      ["userID", "email", "token", "refreshToken"],
      () => {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
      }
    );
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

