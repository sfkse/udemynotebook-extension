import React from "react";
import { ICourse } from "../utils/types";
import { getCourses } from "../api/courses";

const useFetchCourses = () => {
  const [courses, setCourses] = React.useState<ICourse[]>([]);
  const [isFetchingCourses, setIsFetchingCourses] = React.useState(true);

  const fetchCourses = async () => {
    chrome.storage.sync.get(["userID", "email"], async (result) => {
      if (result.userID && result.email) {
        const fetchedCourses = await getCourses(result.userID);
        setCourses(fetchedCourses);
        setIsFetchingCourses(false);
      }
    });
  };
  return { courses, isFetchingCourses, fetchCourses };
};

export default useFetchCourses;

