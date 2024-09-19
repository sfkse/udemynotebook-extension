import React, { useCallback, useState } from "react";
import { createEditor, Editor, Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import { withHistory } from "slate-history";
import isHotkey from "is-hotkey";
import styled from "styled-components";

import { Button } from "./Button";
import { Element, Leaf } from "./EditorBlocks";
import MarkButton from "./MarkButton";

import { INote } from "../utils/types";
import { HOTKEYS } from "../utils/editor";
import { createNote, exportToGdocs, getLectureNotes } from "../api/notes";
import { exportToWord, getLectureName } from "../utils/notes";

type AddNoteProps = {
  courses: any[];
  userID: string;
  setIsAddingNote: React.Dispatch<React.SetStateAction<boolean>>;
  isNoteDetailPage: boolean;
  setIsNoteDetailPage: React.Dispatch<React.SetStateAction<boolean>>;
  noteToEdit?: INote | null;
  onUpdateNote: (note: INote) => Promise<void>;
  onComplete: () => void;
};

const AddNote = ({
  courses,
  userID,
  setIsAddingNote,
  isNoteDetailPage,
  setIsNoteDetailPage,
  noteToEdit,
  onUpdateNote,
  onComplete,
}: AddNoteProps) => {
  const [noteTitle, setNoteTitle] = useState(noteToEdit?.title || "");
  const [noteContent, setNoteContent] = useState(noteToEdit?.content || "");
  const [isPublic, setIsPublic] = useState(noteToEdit?.isPublic || false);
  const [isSaving, setIsSaving] = useState(false);

  const [editor] = useState(() => withHistory(withReact(createEditor())));
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const initialValue: Descendant[] = noteToEdit
    ? JSON.parse(noteToEdit.content)
    : [
        {
          type: "paragraph",
          children: [{ text: "" }],
        },
      ];

  const getCourseId = useCallback(async () => {
    if (noteToEdit) {
      // If in edit mode, return the course ID from the note being edited
      return noteToEdit.idcourses;
    } else {
      // If in add mode, get the current lecture name and find a note with this lecture
      const lectureName = getLectureName();

      try {
        // Assuming you have a function to get notes by lecture name
        const lectureNotes = await getLectureNotes(lectureName, userID);

        if (lectureNotes.length > 0) {
          // Return the course ID from the first note with this lecture name
          return lectureNotes[0].idcourses;
        } else {
          // If no notes found for this lecture, fall back to the original method
          const courseName = document
            .querySelector(
              'li[class*="curriculum-item-link--is-current-"] span[data-purpose="item-title"]'
            )
            ?.textContent?.trim();

          if (courseName) {
            const course = courses.find((c) => c.title === courseName);
            return course ? course.idcourses : "";
          }
        }
      } catch (error) {
        console.error("Error fetching lecture notes:", error);
      }
    }

    return ""; // Return empty string if no course ID could be determined
  }, [noteToEdit, courses, userID]);

  const handleSaveNote = async (e) => {
    e.preventDefault();
    const currentTimeElement = document.querySelector(
      '[data-purpose="current-time"]'
    );
    const currentTime = currentTimeElement?.textContent;

    const courseId = await getCourseId();

    const newNote: INote = {
      title: noteTitle,
      content: noteContent,
      isPublic,
      idcourses: courseId,
      idusers: userID,
      lecture: getLectureName(noteToEdit),
      timestamp: currentTime,
    };
    console.log(newNote);
    try {
      setIsSaving(true);
      if (noteToEdit) {
        await onUpdateNote({ ...newNote, idnotes: noteToEdit.idnotes });
      } else {
        await createNote(newNote);
      }
      onComplete();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMark = (editor, format) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  const handleExport = async (format: string) => {
    try {
      switch (format) {
        case "word":
          await exportToWord(noteTitle, noteContent);
          break;
        case "gdocs":
          chrome.runtime.sendMessage({ action: "login" }, async (response) => {
            if (response.success) {
              console.log("Logged in successfully:", response.token);
              try {
                const { docUrl } = await exportToGdocs(
                  noteTitle,
                  noteContent,
                  response.token
                );

                window.open(docUrl, "_blank");
              } catch (error) {
                console.error("Error exporting to Google Docs:", error);
                // Handle error (e.g., show an error message to the user)
              }
            }
          });
          break;
      }
    } catch (error) {
      console.error("Error exporting document:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  return (
    <EditorContainer>
      <ExportButton>
        Export
        <ExportDropdown>
          <ExportOption onClick={() => handleExport("pdf")}>PDF</ExportOption>
          <ExportOption onClick={() => handleExport("word")}>Word</ExportOption>
          <ExportOption onClick={() => handleExport("gdocs")}>
            Google Docs
          </ExportOption>
        </ExportDropdown>
      </ExportButton>
      <TitleInput
        type="text"
        placeholder="Note Title (optional)"
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
      />
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(value) => setNoteContent(JSON.stringify(value))}
      >
        <Toolbar>
          <MarkButton
            toggleMark={toggleMark}
            format="bold"
            icon="https://iili.io/dUku4l2.png"
          />
          <MarkButton
            toggleMark={toggleMark}
            format="italic"
            icon="https://iili.io/dUkOpqv.png"
          />
          <MarkButton
            toggleMark={toggleMark}
            format="underline"
            icon="https://iili.io/dUk4HOl.png"
          />
          <MarkButton
            toggleMark={toggleMark}
            format="code"
            icon="https://iili.io/dUkDyEQ.png"
          />
        </Toolbar>
        <Editable
          id="slate-editor"
          style={{ padding: "1rem" }}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Write your note here..."
          autoFocus
          onChange={(value) => {
            const isAstChange = editor.operations.some(
              (op) => "set_selection" !== op.type
            );
            if (isAstChange) {
              // Save the value to Local Storage.
              // const content = JSON.stringify(value);
              // localStorage.setItem("content", content);
            }
          }}
          onKeyDown={(event) => {
            // if (!event.ctrlKey) {
            //   return;
            // }

            // switch (event.key) {
            //   // When "`" is pressed, keep our existing code block logic.
            //   case "`": {
            //     event.preventDefault();
            //     CustomEditor.toggleCodeBlock(editor);
            //     break;
            //   }

            //   // When "B" is pressed, bold the text in the selection.
            //   case "b": {
            //     event.preventDefault();
            //     CustomEditor.toggleBoldMark(editor);
            //     break;
            //   }
            // }
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event as any)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }
          }}
        />
      </Slate>
      <CheckboxContainer>
        <Checkbox
          id="private"
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        <CheckboxLabel htmlFor="private">Visible to everyone</CheckboxLabel>
      </CheckboxContainer>
      <ButtonContainer>
        <Button outlined title="Cancel" handleClick={onComplete} />
        <Button
          title={noteToEdit ? "Update" : "Save"}
          handleClick={handleSaveNote}
          disabled={isSaving}
        />
      </ButtonContainer>
    </EditorContainer>
  );
};

export default AddNote;

const EditorContainer = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
`;

const TitleInput = styled.input`
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ddd;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 3rem 0;
`;

const Checkbox = styled.input`
  cursor: pointer;
  background-color: var(--notebook-green);
  border-radius: 5px;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 2px;
  background-color: var(--notebook-primary-color);
  margin: 2rem 0 1rem 0;
`;

const ExportButton = styled.div`
  position: relative;
  display: inline-block;
  padding: 10px;
  background-color: var(--notebook-green);
  color: white;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 10px;

  &:hover > div {
    display: block;
  }
`;

const ExportDropdown = styled.div`
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
`;

const ExportOption = styled.a`
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  cursor: pointer;

  &:hover {
    background-color: #f1f1f1;
  }
`;

