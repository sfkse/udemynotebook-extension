export const getUserProfileInfo = async (token: string) => {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching user info:", error);
    return {};
  }
};
