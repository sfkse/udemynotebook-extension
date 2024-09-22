import List from "./List";
import NothingFoundContainer from "./NothingFoundContainer";
import { ICourse } from "../utils/types";
import React from "react";

const AllNotesTabContent: React.FC<{
  courses: ICourse[];
  handleClickCourse: (courseID: string) => void;
}> = ({ courses, handleClickCourse }) => {
  return (
    <>
      {courses.length > 0 ? (
        courses.map((course) => (
          <List.Item
            key={course.idcourses}
            title={course.title}
            options={null}
            handleClick={() => handleClickCourse(course.idcourses)}
          />
        ))
      ) : (
        <NothingFoundContainer>
          <img src="https://iili.io/d8jz6HN.png" alt="Nothing found" />
          <div>No courses found</div>
        </NothingFoundContainer>
      )}
    </>
  );
};

export default AllNotesTabContent;

