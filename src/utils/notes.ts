import { INote } from "./types";

export const fetchSections = (courseNotes: INote[]) => {
  const sections = courseNotes.reduce((acc: INote[], note) => {
    const section = acc.find((section) => section.lecture === note.lecture);
    if (!section) {
      acc.push(note);
    }

    return acc;
  }, []);
  console.log("sections", sections);
  return sections;
};

export const getLectureName = (noteToEdit: INote | null = null) => {
  if (noteToEdit) {
    // If we're editing a note, return the lecture name from the note
    return noteToEdit.lecture;
  }

  // If we're adding a new note, use the existing logic to get the lecture name from the DOM
  const currentItems = document.querySelectorAll(
    '[class*="curriculum-item-link--is-current"]'
  );
  let text = "";
  currentItems.forEach((item) => {
    const titleElement = item.querySelector('[data-purpose="item-title"]');
    if (titleElement) {
      text = titleElement.textContent?.trim() || "";
    }
  });

  return text;
};

