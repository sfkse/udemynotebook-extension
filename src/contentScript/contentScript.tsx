import React, { useEffect, useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import styled from "styled-components";
import "fontsource-roboto";

import Tabs from "../components/Tabs";
import { Button } from "../components/Button";
import AddNote from "../components/AddNote";
import LectureTabContent from "../components/LectureTabContent";
import AllNotesTabContent from "../components/AllNotesTabContent";
import AllSectionsTabContent from "../components/AllSectionsTabContent";

import { PAGES } from "../utils/data";
import { INote } from "../utils/types";
import { fetchSections, getCourseName, getLectureName } from "../utils/notes";

import useFetchCourses from "../hooks/useFetchCourses";
import useFetchCourseNotes from "../hooks/useFetchCourseNotes";
import useFetchCourseCommunityNotes from "../hooks/useFetchCourseCommunityNotes";

import { getLectureNotes, updateNote, deleteNote } from "../api/notes";
import { setAuthToken, setRefreshToken } from "../api/apiClient";

import "./contentScript.css";

const App: React.FC<{}> = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(PAGES.allNotes);
  const [subTab, setSubTab] = useState("My notes");
  const [isAddNotePage, setIsAddNotePage] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{
    userID: string;
    email: string;
  }>({ userID: null, email: null });
  const [showCourseSections, setShowCourseSections] = useState(false);
  const [isOutsideOfLecture, setIsOutsideOfLecture] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>(null);
  const [selectedSection, setSelectedSection] = useState<string>(null);
  const [displayedAuthUserNotes, setDisplayedAuthUserNotes] = useState<INote[]>(
    []
  );
  const [sections, setSections] = useState<any>([]);
  const [isNoteDetailPage, setIsNoteDetailPage] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<INote | null>(null);
  const [courseNotes, setCourseNotes] = useState<INote[]>([]);
  const [courseCommunityNotes, setCourseCommunityNotes] = useState<INote[]>([]);
  const { courses, fetchCourses } = useFetchCourses();
  const { fetchCourseNotes } = useFetchCourseNotes();
  const { fetchCourseCommunityNotes } = useFetchCourseCommunityNotes();

  useEffect(() => {
    chrome.storage.sync.get(
      ["userID", "email", "token", "refreshToken"],
      (result) => {
        if (
          result.userID &&
          result.email &&
          result.token &&
          result.refreshToken
        ) {
          setLoggedInUser({ userID: result.userID, email: result.email });
          setAuthToken(result.token);
          setRefreshToken(result.refreshToken);
          fetchCourses();
        }
      }
    );
  }, []);

  useEffect(() => {
    const messageListener = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.message === "login") {
        setLoggedInUser(message.data);
        sendResponse({ status: "received" });
      } else if (message.message === "logout") {
        handleLogout();
        sendResponse({ status: "received" });
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const handleLogout = useCallback(() => {
    setLoggedInUser({ userID: null, email: null });
    setIsDrawerOpen(false);
    setActiveTab(PAGES.allNotes);
    setSubTab("My notes");
    setIsAddNotePage(false);
    setShowCourseSections(false);
    setIsOutsideOfLecture(false);
    setSelectedCourse(null);
    setSelectedSection(null);
    setDisplayedAuthUserNotes([]);
    setIsNoteDetailPage(false);
    setNoteToEdit(null);
  }, []);

  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const handleTabSelect = useCallback(
    async (tab: string) => {
      if (tab === PAGES.lectureNotes) {
        const lectureName = getLectureName();
        if (lectureName) {
          const notes = await getLectureNotes(lectureName, loggedInUser.userID);
          const courseID = notes.length > 0 ? notes[0].idcourses : null;
          const courseCommunityNotes = courseID
            ? await fetchCourseCommunityNotes(courseID)
            : [];
          const lectureCommunityNotes =
            courseCommunityNotes.length > 0
              ? courseCommunityNotes.filter(
                  (note) => note.lecture === lectureName
                )
              : [];

          const displayedNotes =
            subTab === "My notes" ? notes : lectureCommunityNotes;

          setDisplayedAuthUserNotes(displayedNotes);
          setCourseCommunityNotes(lectureCommunityNotes);
          setSelectedSection(lectureName);
          setIsOutsideOfLecture(false);
        } else {
          setIsOutsideOfLecture(true);
        }
      }
      fetchCourses();
      setActiveTab(tab);
      setShowCourseSections(false);
    },
    [loggedInUser, fetchCourses]
  );

  const getLectureToAddNote = () => {
    if (selectedSection) return selectedSection;
    else return getLectureName();
  };

  const handleClickCourse = useCallback(
    async (courseID: string) => {
      const course = courses.find((course) => course.idcourses === courseID);
      const selectedCourseNotes = await fetchCourseNotes(
        courseID,
        loggedInUser.userID
      );
      const courseCommunityNotes = await fetchCourseCommunityNotes(courseID);

      setSelectedCourse(course.title);
      setSections(fetchSections(selectedCourseNotes));
      setShowCourseSections(true);
      setIsOutsideOfLecture(false);
      setCourseNotes(selectedCourseNotes);
      setCourseCommunityNotes(courseCommunityNotes);
    },
    [courses, fetchCourseNotes, loggedInUser]
  );

  const handleClickSection = useCallback(
    (section: INote) => {
      const notes = courseNotes.filter(
        (note) => note.lecture === section.lecture
      );
      setDisplayedAuthUserNotes(notes);
      setActiveTab(PAGES.lectureNotes);
      setSelectedSection(section.lecture);
      setIsOutsideOfLecture(false);
    },
    [courseNotes]
  );

  const handleClickNote = useCallback((note: INote) => {
    setNoteToEdit(note);
    setIsNoteDetailPage(true);
    setIsAddNotePage(true);
  }, []);

  const refreshNotes = async (courseID?: string) => {
    const activeCourseNotes = await fetchCourseNotes(
      courseID,
      loggedInUser.userID
    );
    const activeLecture = getLectureToAddNote();
    const updatedNotes = activeCourseNotes.filter(
      (note) => note.lecture === activeLecture
    );

    setDisplayedAuthUserNotes(updatedNotes);
    setCourseNotes(activeCourseNotes);
    setSections(fetchSections(activeCourseNotes));
  };

  const handleClickAddNote = useCallback(() => setIsAddNotePage(true), []);

  const handleCancelAddNote = useCallback(() => {
    setIsAddNotePage(false);
    setIsNoteDetailPage(false);
    setNoteToEdit(null);
  }, []);

  const handleAddNoteComplete = useCallback(
    async (courseID?: string) => {
      setIsAddNotePage(false);
      setIsNoteDetailPage(false);
      setNoteToEdit(null);
      setActiveTab(PAGES.lectureNotes);
      fetchCourses();
      refreshNotes(courseID);
    },
    [refreshNotes]
  );

  const handleUpdateNote = useCallback(
    async (updatedNote: INote) => {
      try {
        await updateNote(updatedNote);
        await refreshNotes(updatedNote.idcourses);
      } catch (error) {
        console.error("Error updating note:", error);
      }
    },
    [refreshNotes]
  );

  const handleDeleteNote = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>, note: INote) => {
      e.stopPropagation();
      if (window.confirm("Are you sure you want to delete this note?")) {
        try {
          await deleteNote(note.idnotes, loggedInUser.userID);
          await refreshNotes(note.idcourses);
          setShowCourseSections(true);
        } catch (error) {
          console.error("Error deleting note:", error);
        }
      }
    },
    [loggedInUser, refreshNotes]
  );

  const renderContent = () => {
    if (!loggedInUser.userID) {
      return (
        <>
          <Image src="https://iili.io/d8jz6HN.png" alt="Login" />
          <LoginText>
            Login to save your notes and access them from any device
          </LoginText>
        </>
      );
    }

    if (isAddNotePage || isNoteDetailPage) {
      return (
        <AddNote
          isNoteDetailPage={isNoteDetailPage}
          setIsNoteDetailPage={setIsNoteDetailPage}
          courses={courses}
          userID={loggedInUser.userID}
          setIsAddingNote={setIsAddNotePage}
          noteToEdit={noteToEdit}
          lectureToAdd={getLectureToAddNote()}
          onUpdateNote={handleUpdateNote}
          onComplete={handleAddNoteComplete}
          handleCancelAddNote={handleCancelAddNote}
        />
      );
    }

    return (
      <>
        <LogoContainer>Welcome {loggedInUser.email}!</LogoContainer>
        <ButtonContainer>
          {!isAddNotePage && (
            <Button
              title={`Add note for lecture ${
                getLectureToAddNote().split(".")[0]
              }`}
              handleClick={handleClickAddNote}
              icon="https://iili.io/d8XK7i7.png"
            />
          )}
        </ButtonContainer>
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
        {renderTabContent()}
      </>
    );
  };

  const renderTabContent = () => {
    if (activeTab === PAGES.lectureNotes && !isOutsideOfLecture) {
      return (
        <LectureTabContent
          courses={courses}
          setActiveTab={setActiveTab}
          displayedAuthUserNotes={displayedAuthUserNotes}
          setShowCourseSections={setShowCourseSections}
          getCourseName={getCourseName}
          setSelectedCourse={setSelectedCourse}
          fetchCourseNotes={fetchCourseNotes}
          selectedSection={selectedSection}
          subTab={subTab}
          setSubTab={setSubTab}
          loggedInUser={loggedInUser}
          handleDeleteNote={handleDeleteNote}
          handleClickNote={handleClickNote}
        />
      );
    }

    if (activeTab === PAGES.allNotes) {
      return (
        <>
          {showCourseSections && selectedCourse ? (
            <AllSectionsTabContent
              setActiveTab={setActiveTab}
              setShowCourseSections={setShowCourseSections}
              selectedCourse={selectedCourse}
              sections={sections}
              courseNotes={courseNotes}
              handleClickSection={handleClickSection}
            />
          ) : (
            <AllNotesTabContent
              courses={courses}
              handleClickCourse={handleClickCourse}
            />
          )}
        </>
      );
    }

    return null;
  };

  return (
    <>
      <DrawerHandle $isOpen={isDrawerOpen} onClick={toggleDrawer}>
        {isDrawerOpen ? ">" : "<"}
      </DrawerHandle>
      <DrawerContainer $isOpen={isDrawerOpen}>
        <Container>{renderContent()}</Container>
      </DrawerContainer>
    </>
  );
};

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

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container!);
root.render(<App />);

