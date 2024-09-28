import { INote } from "../utils/types";
import { apiClient } from "./apiClient";

export const getCourseNotes = async (courseID: string, userID: string) => {
  try {
    const response = await apiClient(
      `/notes/course?courseID=${courseID}&userID=${userID}`
    );
    return await response;
  } catch (error) {
    console.error("Error fetching course notes:", error);
    return [];
  }
};

export const getLectureNotes = async (lectureName: string, userID: string) => {
  try {
    const response = await apiClient(
      `/notes/lecture?lectureName=${lectureName}&userID=${userID}`
    );
    return await response;
  } catch (error) {
    console.error("Error fetching lecture notes:", error);
    return [];
  }
};

export const getCourseCommunityNotes = async (courseID: string) => {
  try {
    const response = await apiClient(
      `/notes/courseCommunity?courseID=${courseID}`
    );
    return await response;
  } catch (error) {
    console.error("Error fetching course community notes:", error);
    return [];
  }
};
export const createNote = async (newNote: INote) => {
  try {
    const response = await apiClient(`/notes/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newNote),
    });
    return await response;
  } catch (error) {
    console.error("Error creating note:", error);
    return {};
  }
};

export const updateNote = async (note: INote): Promise<void> => {
  const response = await apiClient(`/notes/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });
};

export const deleteNote = async (
  noteId: string,
  userID: string
): Promise<void> => {
  try {
    const response = await apiClient(
      `/notes/delete?noteID=${noteId}&userID=${userID}`,
      {
        method: "POST",
      }
    );
    return await response;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

export const exportToGdocs = async (
  title: string,
  content: string,
  authToken: string
) => {
  try {
    const response = await apiClient(`/googledocs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ title, content }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("first", response.json());
    return await response.json();
  } catch (error) {
    console.error("Error exporting to Google Docs:", error);
    throw error;
  }
};

