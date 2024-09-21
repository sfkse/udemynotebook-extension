import React, { useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import styled from "styled-components";
import "fontsource-roboto";

import Tabs from "../components/Tabs";
import List from "../components/List";
import { Button } from "../components/Button";
import SubTabs from "../components/SubTabs";
import NoteOptions from "../components/NoteOptions";
import AddNote from "../components/AddNote";
import PageTitle from "../components/PageTitle";

import { PAGES } from "../utils/data";
import { INote } from "../utils/types";
import { fetchSections, getLectureName } from "../utils/notes";

import useFetchCourses from "../hooks/useFetchCourses";
import useFetchCourseNotes from "../hooks/useFetchCourseNotes";

import { getLectureNotes, updateNote, deleteNote } from "../api/notes";

import "./contentScript.css";
import { setAuthToken } from "../api/apiClient";

const App: React.FC<{}> = () => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(PAGES.allNotes);
  const [subTab, setSubTab] = React.useState("My notes");
  const [isAddingNote, setIsAddingNote] = React.useState(false);
  const [loggedInUser, setLoggedInUser] = React.useState<{
    userID: string;
    email: string;
  }>({ userID: null, email: null });

  const [showCourseSections, setShowCourseSections] = React.useState(false);
  const [isOutsideOfLecture, setIsOutsideOfLecture] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<string>(null);
  const [selectedSection, setSelectedSection] = React.useState<string>(null);
  const [displayedSectionNotes, setDisplayedSectionNotes] = React.useState<
    INote[]
  >([]);

  const [isNoteDetailPage, setIsNoteDetailPage] = React.useState(false);
  const [noteToEdit, setNoteToEdit] = React.useState<INote | null>(null);

  const { courses, isFetchingCourses, fetchCourses } = useFetchCourses();
  const { courseNotes, fetchCourseNotes } = useFetchCourseNotes();

  const sortedNotes =
    subTab === "My notes"
      ? displayedSectionNotes.filter((note) => !note.isPublic)
      : displayedSectionNotes.filter((note) => note.isPublic);

  useEffect(() => {
    chrome.storage.sync.get(["userID", "email", "token"], (result) => {
      if (result.userID && result.email && result.token) {
        setLoggedInUser({ userID: result.userID, email: result.email });
        setAuthToken(result.token);
        fetchCourses();
      }
    });
  }, []);

  useEffect(() => {
    const messageListener = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.message === "login") {
        console.log("Login data received:", message.data);
        setLoggedInUser(message.data);
        sendResponse({ status: "received" });
      } else if (message.message === "logout") {
        console.log("Logout message received");
        handleLogout();
        sendResponse({ status: "received" });
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleLogout = useCallback(() => {
    setLoggedInUser(null);
    setIsDrawerOpen(false);
    setActiveTab(PAGES.allNotes);
    setSubTab("My notes");
    setIsAddingNote(false);
    // Reset other state variables as needed
    setShowCourseSections(false);
    setIsOutsideOfLecture(false);
    setSelectedCourse(null);
    setSelectedSection(null);
    setDisplayedSectionNotes([]);
    setIsNoteDetailPage(false);
    setNoteToEdit(null);
  }, []);

  const toggleDrawer = () => {
    setIsDrawerOpen((prevState) => !prevState);
  };

  const handleTabSelect = async (tab: string) => {
    if (tab === PAGES.lectureNotes) {
      const lectureName = getLectureName();
      if (!lectureName) {
        setIsOutsideOfLecture(true);
      } else {
        const notes = await getLectureNotes(lectureName, loggedInUser.userID);
        setDisplayedSectionNotes(notes);
        setSelectedSection(lectureName);
        setIsOutsideOfLecture(false);
      }
    }
    setActiveTab(tab);
    setShowCourseSections(false);
  };

  const handleAddNote = () => {
    setIsAddingNote(true);
  };

  const handleClickCourse = async (courseID: string) => {
    await fetchCourseNotes(courseID, loggedInUser.userID);
    setShowCourseSections(true);
    const course = courses.find((course) => course.idcourses === courseID);
    setSelectedCourse(course.title);
    setIsOutsideOfLecture(false);
  };

  const handleClickSection = (section: INote) => {
    const notes = courseNotes.filter(
      (note) => note.lecture === section.lecture
    );
    setDisplayedSectionNotes(notes);
    setActiveTab(PAGES.lectureNotes);
    setSelectedSection(section.lecture);
    setIsOutsideOfLecture(false);
  };

  const handleClickNote = (note: INote) => {
    setNoteToEdit(note);
    setIsNoteDetailPage(true);
    setIsAddingNote(true);
  };

  const handleUpdateNote = useCallback(
    async (updatedNote: INote) => {
      try {
        await updateNote(updatedNote);
        // Refresh the notes list after updating
        if (activeTab === PAGES.lectureNotes) {
          const updatedNotes = await getLectureNotes(
            selectedSection,
            loggedInUser.userID
          );
          setDisplayedSectionNotes(updatedNotes);
        } else if (selectedCourse) {
          await fetchCourseNotes(selectedCourse, loggedInUser.userID);
        }
      } catch (error) {
        console.error("Error updating note:", error);
      }
    },
    [activeTab, selectedSection, loggedInUser, selectedCourse, fetchCourseNotes]
  );

  console.log("selectedSection", selectedSection);

  const handleDeleteNote = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>, noteId: string) => {
      e.stopPropagation();
      if (window.confirm("Are you sure you want to delete this note?")) {
        try {
          await deleteNote(noteId, loggedInUser.userID);
          // Refresh the notes list after deleting
          if (activeTab === PAGES.lectureNotes) {
            console.log("selectedSection", selectedSection);
            const updatedNotes = await getLectureNotes(
              selectedSection,
              loggedInUser.userID
            );
            setDisplayedSectionNotes(updatedNotes);
          } else if (selectedCourse) {
            await fetchCourseNotes(selectedCourse, loggedInUser.userID);
          }
        } catch (error) {
          console.error("Error deleting note:", error);
        }
      }
    },
    [activeTab, selectedSection, loggedInUser, selectedCourse, fetchCourseNotes]
  );

  const handleAddNoteComplete = useCallback(() => {
    setIsAddingNote(false);
    setIsNoteDetailPage(false);
    setNoteToEdit(null);
    setActiveTab(PAGES.lectureNotes);
  }, []);

  const fetchSectionOptions = (lectureName: string) => {
    const sectionNotes = courseNotes.filter(
      (note: INote) => note.lecture === lectureName
    );

    return (
      <OptionsWrapper>{`${sectionNotes.length} ${
        sectionNotes.length === 1 ? "note" : "notes"
      }`}</OptionsWrapper>
    );
  };

  const fetchNoteOptions = (note: INote) => {
    return (
      <OptionsWrapper>
        <NoteOptions
          isPublic={note.isPublic}
          onDelete={(e) => handleDeleteNote(e, note.idnotes)}
        />
      </OptionsWrapper>
    );
  };

  const extractPlainText = (content: string): string => {
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent
        .map((node) => node.children.map((child) => child.text).join(""))
        .join("\n");
    } catch (error) {
      console.error("Error parsing note content:", error);
      return content; // Return original content if parsing fails
    }
  };

  return (
    <>
      <DrawerHandle $isOpen={isDrawerOpen} onClick={toggleDrawer}>
        {isDrawerOpen ? ">" : "<"}
      </DrawerHandle>
      <DrawerContainer $isOpen={isDrawerOpen}>
        <Container>
          {loggedInUser.userID ? (
            <>
              <LogoContainer>Welcome {loggedInUser.email}!</LogoContainer>
              <ButtonContainer>
                {!isAddingNote && (
                  <Button
                    title="Add Note For Current Lecture"
                    handleClick={handleAddNote}
                    icon="https://iili.io/d8XK7i7.png"
                  />
                )}
              </ButtonContainer>
              {isAddingNote || isNoteDetailPage ? (
                <AddNote
                  isNoteDetailPage={isNoteDetailPage}
                  setIsNoteDetailPage={setIsNoteDetailPage}
                  courses={courses}
                  userID={loggedInUser.userID}
                  setIsAddingNote={setIsAddingNote}
                  noteToEdit={noteToEdit}
                  onUpdateNote={handleUpdateNote}
                  onComplete={handleAddNoteComplete}
                />
              ) : (
                <>
                  <Tabs>
                    <Tabs.Tab
                      handleClick={() => handleTabSelect(PAGES.allNotes)}
                      title={PAGES.allNotes}
                      activeTab={activeTab}
                    />
                    <Tabs.Tab
                      handleClick={() => handleTabSelect(PAGES.lectureNotes)}
                      title={PAGES.lectureNotes}
                      activeTab={activeTab}
                    />
                    <Tabs.Tab
                      handleClick={() => handleTabSelect(PAGES.settings)}
                      title={PAGES.settings}
                      activeTab={activeTab}
                    />
                  </Tabs>
                  {activeTab === PAGES.lectureNotes && !isOutsideOfLecture && (
                    <>
                      <PageTitle
                        handleBackClick={() => setActiveTab(PAGES.allNotes)}
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
                    </>
                  )}

                  <List>
                    {activeTab === PAGES.allNotes && (
                      <>
                        {isFetchingCourses ? (
                          <div>Fetching courses...</div>
                        ) : (
                          <>
                            {showCourseSections ? (
                              <>
                                <PageTitle
                                  handleBackClick={() => {
                                    setActiveTab(PAGES.allNotes);
                                    setShowCourseSections(false);
                                  }}
                                  selectedSection={selectedCourse}
                                />

                                {fetchSections(courseNotes).map((section) => (
                                  <List.Item
                                    key={section.idnotes}
                                    title={section.lecture}
                                    options={fetchSectionOptions(
                                      section.lecture
                                    )}
                                    handleClick={() =>
                                      handleClickSection(section)
                                    }
                                  />
                                ))}
                              </>
                            ) : (
                              <>
                                {courses.length > 0 ? (
                                  courses.map((course) => (
                                    <List.Item
                                      key={course.idcourses}
                                      title={course.title}
                                      options={null}
                                      handleClick={() =>
                                        handleClickCourse(course.idcourses)
                                      }
                                    />
                                  ))
                                ) : (
                                  <NothingFoundContainer>
                                    <img
                                      src="https://iili.io/d8jz6HN.png"
                                      alt="Nothing found"
                                    />
                                    <div>No courses found</div>
                                  </NothingFoundContainer>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {activeTab === PAGES.lectureNotes && (
                      <>
                        {isOutsideOfLecture ? (
                          <div>Go back to lecture</div>
                        ) : (
                          <>
                            {sortedNotes.length > 0 ? (
                              sortedNotes.map((note) => (
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
                                <img
                                  src="https://iili.io/d8jz6HN.png"
                                  alt="Nothing found"
                                />
                                <div>No notes found</div>
                              </NothingFoundContainer>
                            )}
                          </>
                        )}
                      </>
                    )}
                    {activeTab === PAGES.settings && <p>Settings</p>}
                  </List>
                </>
              )}
            </>
          ) : (
            <>
              <Image src="https://iili.io/d8jz6HN.png" alt="Login" />
              <LoginText>
                Login to save your notes and access them from any device
              </LoginText>
            </>
          )}
        </Container>
      </DrawerContainer>
    </>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container!);
root.render(<App />);

// Drawer handle component
const DrawerHandle = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 50%;
  right: ${({ $isOpen }) =>
    $isOpen ? "49rem" : "0px"}; /* Adjust this value based on drawer width */
  transform: translateY(-50%);
  width: 25px;
  height: 44px;
  background-color: var(--notebook-dark-primary-color);
  border-radius: 5px 0px 0px 5px;
  cursor: pointer;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: right 0.3s ease-in-out;
  color: white;
`;

// Main container for the sliding drawer
const DrawerContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 10%;
  right: ${({ $isOpen }) =>
    $isOpen ? "0" : "-49rem"}; /* Adjust based on drawer width */
  padding: 2rem;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  height: 85vh;
  width: 49rem;
  border-radius: 0 10px 10px 0;
  background-color: var(--notebook-dark-primary-color);
  font-family: "Roboto", sans-serif;
  transition: right 0.3s ease-in-out;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 85vh;
  width: 45rem;
  border-radius: 10px;
  background-color: var(--notebook-dark-primary-color);
  font-family: "Roboto", sans-serif;
  overflow-y: scroll;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none;
  }
`;

const LogoContainer = styled.div`
  font-size: 16px;
  margin-bottom: 20px;
  font-weight: bold;
`;

const Logo = styled.img`
  width: 30px;
  margin-right: 10px;
`;

const OptionsWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  img {
    cursor: pointer;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  width: 100%;
`;

const LoginText = styled.p`
  font-size: 14px;
  text-align: center;
  color: var(--notebook-secondary-color);
`;

const Image = styled.img`
  width: 50%;
  align-self: center;
`;

const NothingFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 60px;
  img {
    width: 50%;
  }
`;

