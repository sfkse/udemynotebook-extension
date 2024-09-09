export type Note = {
  id: number;
  title: string;
  lectureID: number;
  content: string;
  isPublic: boolean;
  timestamp: string;
};

type Pages = {
  allNotes: string;
  lectureNotes: string;
  settings: string;
};

export const PAGES: Pages = {
  allNotes: "All Notes",
  lectureNotes: "Lecture Notes",
  settings: "Settings",
};

export const NOTES: Note[] = [
  {
    id: 1,
    title: "Introduction to the Course",
    lectureID: 3,
    content: "This is the introduction to the course",
    isPublic: false,
    timestamp: "00:00",
  },
  {
    id: 2,
    title: "First Lecture",
    lectureID: 3,
    content: "This is the first lecture",
    isPublic: false,
    timestamp: "01:00",
  },
  {
    id: 3,
    title: "Second Lecture",
    lectureID: 3,
    content: "This is the second lecture",
    isPublic: true,
    timestamp: "02:00",
  },
  {
    id: 4,
    title: "Third Lecture",
    lectureID: 3,
    content: "This is the third lecture",
    isPublic: false,
    timestamp: "03:00",
  },
  {
    id: 5,
    title: "Fourth Lecture",
    lectureID: 3,
    content: "This is the fourth lecture",
    isPublic: false,
    timestamp: "04:00",
  },
  {
    id: 6,
    title: "Fifth Lecture",
    lectureID: 3,
    content: "This is the fifth lecture",
    isPublic: true,
    timestamp: "05:00",
  },
  {
    id: 7,
    title: "Sixth Lecture",
    lectureID: 3,
    content: "This is the sixth lecture",
    isPublic: false,
    timestamp: "06:00",
  },
  {
    id: 8,
    title: "Seventh Lecture",
    lectureID: 3,
    content: "This is the seventh lecture",
    isPublic: false,
    timestamp: "07:00",
  },
  {
    id: 9,
    title: "Eighth Lecture",
    lectureID: 3,
    content: "This is the eighth lecture",
    isPublic: true,
    timestamp: "08:00",
  },
  {
    id: 10,
    title: "Ninth Lecture",
    lectureID: 3,
    content: "This is the ninth lecture",
    isPublic: false,
    timestamp: "09:00",
  },
  {
    id: 11,
    title: "Tenth Lecture",
    lectureID: 3,
    content: "This is the tenth lecture",
    isPublic: false,
    timestamp: "10:00",
  },
  {
    id: 12,
    title: "Eleventh Lecture",
    lectureID: 3,
    content: "This is the eleventh lecture",
    isPublic: true,
    timestamp: "11:00",
  },
  {
    id: 13,
    title: "Twelfth Lecture",
    lectureID: 3,
    content: "This is the twelfth lecture",
    isPublic: false,
    timestamp: "12:00",
  },
  {
    id: 14,
    title: "Thirteenth Lecture",
    lectureID: 3,
    content: "This is the thirteenth lecture",
    isPublic: false,
    timestamp: "13:00",
  },
  {
    id: 15,
    title: "Fourteenth Lecture",
    lectureID: 3,
    content: "This is the fourteenth lecture",
    isPublic: true,
    timestamp: "14:00",
  },
];

