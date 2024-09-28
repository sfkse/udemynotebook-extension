import { apiClient } from "./apiClient";

export const getCourses = async (identifier: string) => {
  try {
    const response = await apiClient(`/courses/${identifier}`);
    return response;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

export const createCourse = async (
  courseName: string,
  identifier: string,
  userID: string
) => {
  try {
    const response = await apiClient("/courses", {
      body: JSON.stringify({ title: courseName, identifier, userID }),
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error("Error creating course:", error);
    return null;
  }
};

