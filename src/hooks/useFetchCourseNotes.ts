import React from "react";
import { INote } from "../utils/types";
import { getCourseNotes } from "../api/notes";

const useFetchLectureNotes = () => {
  const [courseNotes, setCourseNotes] = React.useState<INote[]>([]);
  const [isFetchingCourseNotes, setIsFetchingCourseNotes] =
    React.useState(true);

  const fetchCourseNotes = async (lectureID: string, userID: string) => {
    try {
      const fetchedCourseNotes = await getCourseNotes(lectureID, userID);
      setCourseNotes(fetchedCourseNotes);
    } catch (error) {
      console.error("Error fetching course notes:", error);
    } finally {
      setIsFetchingCourseNotes(false);
    }
  };
  return { courseNotes, isFetchingCourseNotes, fetchCourseNotes };
};

export default useFetchLectureNotes;

