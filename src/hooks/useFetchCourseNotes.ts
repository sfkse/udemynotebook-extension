import React from "react";
import { API_URL } from "../utils/config";
import { INote } from "../utils/types";

const useFetchLectureNotes = () => {
  const [courseNotes, setCourseNotes] = React.useState<INote[]>([]);
  const [isFetchingCourseNotes, setIsFetchingCourseNotes] =
    React.useState(true);

  const fetchCourseNotes = async (lectureID: string, userID: string) => {
    // return new Promise((resolve, reject) => {
    //   fetch(`${API_URL}/notes/course?courseID=${lectureID}&userID=${userID}`)
    //     .then((response) => response.json())
    //     .then((data) => {
    //       setCourseNotes(data);
    //       setIsFetchingCourseNotes(false);
    //       resolve(data);
    //     })
    //     .catch((error) => {
    //       setIsFetchingCourseNotes(false);
    //       console.error("Error fetching course notes:", error);
    //       reject(error);
    //     });
    // });

    try {
      const response = await fetch(
        `${API_URL}/notes/course?courseID=${lectureID}&userID=${userID}`
      );
      const data = await response.json();
      setCourseNotes(data);
      setIsFetchingCourseNotes(false);
    } catch (error) {
      setIsFetchingCourseNotes(false);
      console.error("Error fetching course notes:", error);
    }
  };
  return { courseNotes, isFetchingCourseNotes, fetchCourseNotes };
};

export default useFetchLectureNotes;

