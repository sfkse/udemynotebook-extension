import { INote } from "../utils/types";
import { API_URL } from "../utils/config";

export const getCourseNotes = async (courseID: string, userID: string) => {
  try {
    const response = await fetch(
      `${API_URL}/notes/course?courseID=${courseID}&userID=${userID}`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching course notes:", error);
    return [];
  }
};

export const createNote = async (newNote: INote) => {
  try {
    const response = await fetch(`${API_URL}/notes/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newNote),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating note:", error);
    return {};
  }
};
