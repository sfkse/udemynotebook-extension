import { INote } from "./types";

export const fetchSections = (courseNotes: INote[]) => {
  const sections = courseNotes.reduce((acc: string[], note) => {
    if (!acc.includes(note.lecture)) {
      acc.push(note.lecture);
    }
    return acc;
  }, []);
  console.log(sections);
  return sections;
};

