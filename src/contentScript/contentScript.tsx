import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import styled from "styled-components";
import "fontsource-roboto";

import Tabs from "../components/Tabs";
import List from "../components/List";
import { Button } from "../components/Button";
import SubTabs from "../components/SubTabs";
import NoteOptions from "../components/NoteOptions";
import AddNote from "../components/AddNote";

import { PAGES } from "../utils/data";
import { INote } from "../utils/types";
import { fetchSections, getLectureName } from "../utils/notes";

import useFetchCourses from "../hooks/useFetchCourses";
import useFetchCourseNotes from "../hooks/useFetchCourseNotes";

import { getLectureNotes } from "../api/notes";

import "./contentScript.css";
const App: React.FC<{}> = () => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(PAGES.allNotes);
  const [subTab, setSubTab] = React.useState("My notes");
  const [isAddingNote, setIsAddingNote] = React.useState(false);
  const [loggedInUser, setLoggedInUser] = React.useState<string>(null);

  const [showCourseSections, setShowCourseSections] = React.useState(false);
  const [isOutsideOfLecture, setIsOutsideOfLecture] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<string>(null);
  const [selectedSection, setSelectedSection] = React.useState<string>(null);
  const [displayedSectionNotes, setDisplayedSectionNotes] = React.useState<
    INote[]
  >([]);

  const { courses, isFetchingCourses } = useFetchCourses();
  const { courseNotes, isFetchingCourseNotes, fetchCourseNotes } =
    useFetchCourseNotes();

  const sortedNotes =
    subTab === "My notes"
      ? displayedSectionNotes.filter((note) => !note.isPublic)
      : displayedSectionNotes.filter((note) => note.isPublic);

  useEffect(() => {
    chrome.storage.sync.get(["userID", "email"], (result) => {
      if (result.userID && result.email) {
        setLoggedInUser(result.userID);
      }
    });
  }, []);

  // Use useEffect to listen for messages from the popup
  useEffect(() => {
    // Listener for messages sent by the popup
    const messageListener = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.message === "login") {
        console.log("Login data received:", message.data);
        setLoggedInUser(message.data.userID); // Update the state with the logged-in username

        sendResponse({ status: "received" });
      }
    };

    // Add the message listener
    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup listener when the component unmounts
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
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
        const notes = await getLectureNotes(lectureName, loggedInUser);
        setDisplayedSectionNotes(notes);
        setSelectedSection(lectureName);
      }
    }
    setActiveTab(tab);
    setShowCourseSections(false);
  };

  const handleAddNote = () => {
    setIsAddingNote(true);
  };

  const handleClickCourse = async (courseID: string) => {
    await fetchCourseNotes(courseID, loggedInUser);
    setShowCourseSections(true);
    const course = courses.find((course) => course.idcourses === courseID);
    setSelectedCourse(course.title);
  };

  const handleClickSection = (section: INote) => {
    const notes = courseNotes.filter(
      (note) => note.lecture === section.lecture
    );
    setDisplayedSectionNotes(notes);
    setActiveTab(PAGES.lectureNotes);
    setSelectedSection(section.lecture);
  };

  const handleClickNote = (note: string) => {
    console.log(note);
  };

  const fetchCourseOptions = (id: string) => {
    return (
      <OptionsWrapper>
        {/* <img src="https://iili.io/dwmAbZg.png" alt="delete" title="Delete" /> */}
        12 notes
      </OptionsWrapper>
    );
  };

  const fetchNoteOptions = (noteID: string) => {
    const note = courseNotes.find((note: INote) => note.idnotes === noteID);
    return (
      <OptionsWrapper>
        <NoteOptions isPublic={note?.isPublic} />
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
          {loggedInUser ? (
            <>
              <LogoContainer>Welcome Sefa Köse!</LogoContainer>
              <ButtonContainer>
                {!isAddingNote && (
                  <Button
                    title="Add Note"
                    handleClick={handleAddNote}
                    icon="https://iili.io/d8XK7i7.png"
                  />
                )}
              </ButtonContainer>
              {isAddingNote ? (
                <AddNote
                  courses={courses}
                  userID={loggedInUser}
                  setIsAddingNote={setIsAddingNote}
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
                      <TitleContainer>
                        <BackButton
                          onClick={() => setActiveTab(PAGES.allNotes)}
                        >
                          &lsaquo;
                        </BackButton>
                        <Title title={selectedSection}>{selectedSection}</Title>
                      </TitleContainer>
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
                                <TitleContainer>
                                  <BackButton
                                    onClick={() => {
                                      setActiveTab(PAGES.allNotes);
                                      setShowCourseSections(false);
                                    }}
                                  >
                                    &lsaquo;
                                  </BackButton>
                                  <Title title={selectedCourse}>
                                    {selectedCourse}
                                  </Title>
                                </TitleContainer>
                                {fetchSections(courseNotes).map((section) => (
                                  <List.Item
                                    key={section.idnotes}
                                    title={section.lecture}
                                    options={null}
                                    handleClick={() =>
                                      handleClickSection(section)
                                    }
                                  />
                                ))}
                              </>
                            ) : (
                              <>
                                {courses.map((course) => (
                                  <List.Item
                                    key={course.idcourses}
                                    title={course.title}
                                    options={null}
                                    handleClick={() =>
                                      handleClickCourse(course.idcourses)
                                    }
                                  />
                                ))}
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
                                  key={note.idnotes}
                                  timestamp={note.timestamp}
                                  content={extractPlainText(note.content)}
                                  options={fetchNoteOptions(note.idnotes)}
                                  handleClick={() =>
                                    handleClickCourse(note.idcourses)
                                  }
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

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 28px;
`;

const Title = styled.div``;

const BackButton = styled.span`
  font-size: 16px;
  line-height: 0.5;
  padding: 5px;
  margin-right: 8px;
  border-radius: 3px;
  background-color: var(--notebook-dark-secondary-color);
  cursor: pointer;
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

