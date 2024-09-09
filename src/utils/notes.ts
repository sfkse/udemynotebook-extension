import { INote } from "./types";

export const fetchSections = (courseNotes: INote[]) => {
  const sections = courseNotes.reduce((acc: string[], note) => {
    if (!acc.includes(note.section)) {
      acc.push(note.section);
    }
    return acc;
  }, []);
  console.log(sections);
  return sections;
};

