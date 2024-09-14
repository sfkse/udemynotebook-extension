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

export const getLectureNotes = async (lectureName: string, userID: string) => {
  try {
    const response = await fetch(
      `${API_URL}/notes/lecture?lectureName=${lectureName}&userID=${userID}`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching lecture notes:", error);
    return [];
  }
};

export const updateNote = async (note: INote): Promise<void> => {
  const response = await fetch(`${API_URL}/notes/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error("Failed to update note");
  }
};

export const deleteNote = async (noteId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/notes/delete?noteID=${noteId}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to delete note");
    }
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

