import { API_URL } from "../utils/config";

export const getCourses = async (userID: string) => {
  try {
    const response = await fetch(`${API_URL}/courses/${userID}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};
