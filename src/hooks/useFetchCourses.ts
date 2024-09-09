import React from "react";
import { API_URL } from "../utils/config";
import { ICourse } from "../utils/types";

const useFetchCourses = () => {
  const [courses, setCourses] = React.useState<ICourse[]>([]);
  const [isFetchingCourses, setIsFetchingCourses] = React.useState(true);

  React.useEffect(() => {
    chrome.storage.sync.get(["userID", "email"], (result) => {
      if (result.userID && result.email) {
        fetch(`${API_URL}/courses/${result.userID}`)
          .then((response) => response.json())
          .then((data) => {
            setCourses(data);
            setIsFetchingCourses(false);
          })
          .catch((error) => {
            setIsFetchingCourses(false);
            console.error("Error fetching courses:", error);
          });
      }
    });
  }, []);

  React.useEffect(() => {}, []);

  return { courses, isFetchingCourses };
};

export default useFetchCourses;

