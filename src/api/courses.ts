import { apiClient } from "./apiClient";

export const getCourses = async (userID: string) => {
  try {
    const response = await apiClient(`/courses/${userID}`);
    return response;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

export const createCourse = async (courseName: string) => {
  try {
    const response = await apiClient("/courses", {
      body: JSON.stringify({ title: courseName }),
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error("Error creating course:", error);
    return null;
  }
};

