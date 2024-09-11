import React, { useCallback, useState } from "react";
import { createEditor, Editor, Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import isHotkey from "is-hotkey";
import styled from "styled-components";

import { Button } from "./Button";
import { Element, Leaf } from "./EditorBlocks";
import MarkButton from "./MarkButton";

import { INote } from "../utils/types";
import { HOTKEYS } from "../utils/editor";
import { createNote } from "api/notes";

type AddNoteProps = {
  courses: any[];
  userID: string;
  setIsAddingNote: React.Dispatch<React.SetStateAction<boolean>>;
};

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

const AddNote = ({ courses, userID, setIsAddingNote }: AddNoteProps) => {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editor] = useState(() => withReact(createEditor()));
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const initialValue: Descendant[] = [
    {
      type: "paragraph",
      children: [
        { text: "This is editable " },
        { text: "rich", bold: true },
        { text: " text, " },
        { text: "much", italic: true },
        { text: " better than a " },
        { text: "<textarea>", code: true },
        { text: "!" },
      ],
    },
  ];

  const handleSaveNote = async (e) => {
    e.preventDefault();
    // Get element with the attribute data-purpose="current-time"
    const currentTimeElement = document.querySelector(
      '[data-purpose="current-time"]'
    );
    const currentTime = currentTimeElement?.textContent;
    // Save the note
    const newNote: INote = {
      title: noteTitle,
      content: noteContent,
      isPublic,
      idcourses: getCourseId(),
      idusers: userID,
      lecture: getLectureName(),
      timestamp: currentTime,
    };
    console.log(newNote);

    try {
      setIsSaving(true);
      await createNote(newNote);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
      setIsAddingNote(false);
      setNoteTitle("");
      setNoteContent("");
    }
  };

  const getCourseId = () => {
    const courseName = document.querySelector(
      '[class*="curriculum-item-view--course-title"]'
    )?.textContent;
    console.log(courseName, courses);
    // Find the course in the courses array
    const course = courses.find((course) => course.title === courseName);
    if (!course) {
      return "";
    }

    return course.idcourses;
  };

  const getLectureName = () => {
    // Step 1: Find all elements that have a class matching "curriculum-item-link--is-current"
    const currentItems = document.querySelectorAll(
      '[class*="curriculum-item-link--is-current"]'
    );
    let text = "";
    // Step 2: Iterate over the found items to find the text "13. Chrome Notifications API"
    currentItems.forEach((item) => {
      // Step 3: Find the nested element containing the title using 'data-purpose' attribute
      const titleElement = item.querySelector('[data-purpose="item-title"]');
      text = titleElement.textContent.trim();
    });

    return text;
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

  console.log(noteContent);
  return (
    <EditorContainer>
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
        <Button
          outlined
          title="Cancel"
          handleClick={() => setIsAddingNote(false)}
        />
        <Button title="Save" handleClick={handleSaveNote} disabled={isSaving} />
      </ButtonContainer>
    </EditorContainer>
  );
};

export default AddNote;

