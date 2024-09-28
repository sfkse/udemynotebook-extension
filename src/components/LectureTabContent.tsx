import React, { useCallback } from "react";
import PageTitle from "./PageTitle";
import { PAGES } from "../utils/data";
import SubTabs from "./SubTabs";
import List from "./List";
import styled from "styled-components";
import NothingFoundContainer from "./NothingFoundContainer";
import { INote } from "../utils/types";
import NoteOptions from "./NoteOptions";

const LectureTabContent: React.FC<{
  courses: any;
  setActiveTab: any;
  setShowCourseSections: any;
  getCourseName: any;
  setSelectedCourse: any;
  fetchCourseNotes: any;
  selectedSection: any;
  subTab: any;
  setSubTab: any;
  loggedInUser: any;
  displayedAuthUserNotes: any;
  handleDeleteNote: any;
  handleClickNote: any;
}> = ({
  courses,
  setActiveTab,
  setShowCourseSections,
  getCourseName,
  setSelectedCourse,
  fetchCourseNotes,
  selectedSection,
  subTab,
  setSubTab,
  loggedInUser,
  displayedAuthUserNotes,
  handleDeleteNote,
  handleClickNote,
}) => {
  const notesByTabs =
    subTab === "My notes"
      ? displayedAuthUserNotes
      : displayedAuthUserNotes.filter((note) => note.isPublic);

  const extractPlainText = useCallback((content: string): string => {
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent
        .map((node) => node.children.map((child) => child.text).join(""))
        .join("\n");
    } catch (error) {
      console.error("Error parsing note content:", error);
      return content;
    }
  }, []);

  const fetchNoteOptions = useCallback(
    (note: INote) => {
      return (
        <OptionsWrapper>
          <NoteOptions
            isPublic={note.isPublic}
            onDelete={(e) => handleDeleteNote(e, note)}
          />
        </OptionsWrapper>
      );
    },
    [handleDeleteNote]
  );

  return (
    <>
      <PageTitle
        handleBackClick={() => {
          setActiveTab(PAGES.allNotes);
          setShowCourseSections(true);
          const courseName = getCourseName();
          const courseID = courses.find(
            (course) => course.title === courseName
          )?.idcourses;
          setSelectedCourse(courseName);
          fetchCourseNotes(courseID, loggedInUser.userID);
        }}
        selectedSection={selectedSection}
      />
      <SubTabs>
        <SubTabs.Tab
          handleClick={() => setSubTab("My notes")}
          title="My notes"
          activeTab={subTab}
        />
        <SubTabs.Tab
          handleClick={() => setSubTab("Community notes")}
          title="Community notes"
          activeTab={subTab}
        />
      </SubTabs>
      {displayedAuthUserNotes.length > 0 ? (
        displayedAuthUserNotes.map((note) => (
          <List.Item
            title={note.title}
            key={note.idnotes}
            timestamp={note.timestamp}
            content={extractPlainText(note.content)}
            options={fetchNoteOptions(note)}
            handleClick={() => handleClickNote(note)}
          />
        ))
      ) : (
        <NothingFoundContainer>
          <img src="https://iili.io/d8jz6HN.png" alt="Nothing found" />
          <div>No notes found</div>
        </NothingFoundContainer>
      )}
    </>
  );
};

export default LectureTabContent;

const OptionsWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  img {
    cursor: pointer;
  }
`;

