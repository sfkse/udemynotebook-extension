import { API_URL } from "../utils/config";

export const authenticateUser = async (googleID: string, email: string) => {
  try {
    const response = await fetch(`${API_URL}/users/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ googleID, email }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error authenticating user:", error);
    return {};
  }
};

