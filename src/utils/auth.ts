export function fetchUserProfile(token) {
  return fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((userInfo) => userInfo)
    .catch((error) => {
      console.error("Error fetching user info:", error);
    });
}

