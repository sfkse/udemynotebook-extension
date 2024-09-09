import React from "react";
import ReactQuill from "react-quill";
import styled from "styled-components";
import { Button } from "./Button";
import { NOTES, Note } from "../utils/data";

const EditorContainer = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  margin: 10px 0;
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

const AddNote = ({ isAddingNote, setIsAddingNote }) => {
  const [noteTitle, setNoteTitle] = React.useState("");
  const [noteContent, setNoteContent] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(false);

  const handleSaveNote = () => {
    // Get element with the attribute data-purpose="current-time"
    const currentTimeElement = document.querySelector(
      '[data-purpose="current-time"]'
    );
    const currentTime = currentTimeElement?.textContent;
    // Save the note
    const newNote: Note = {
      id: NOTES.length + 1,
      title: noteTitle,
      content: noteContent,
      isPublic,
      lectureID: 3,
      timestamp: currentTime,
    };
    console.log(newNote);
    NOTES.push(newNote);
    setIsAddingNote(false);
    setNoteTitle("");
    setNoteContent("");
  };

  const handleTakeSnapshot = () => {
    // Option 1
    // Get the video element from the page
    const video = document.querySelector("video");

    if (video && video.readyState >= video.HAVE_ENOUGH_DATA) {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame onto the canvas
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert the canvas to a data URL (image)
      const dataURL = canvas.toDataURL("image/png");

      // Create a link to download the image
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "snapshot.png";
      link.click();
    } else {
      console.error("No video element found!");
    }
    // Option 2
    // const canvas = document.createElement("canvas");
    // const context = canvas.getContext("2d");
    // const video = document.createElement("video");

    // try {
    //   const captureStream = await navigator.mediaDevices.getDisplayMedia();
    //   video.srcObject = captureStream;
    //   context.drawImage(video, 0, 0, video.width, video.height);
    //   const frame = canvas.toDataURL("image/png");
    //   captureStream.getTracks().forEach((track) => track.stop());
    //   window.location.href = frame;
    // } catch (err) {
    //   console.error("Error: " + err);
    // Option 3
    // let video = document.querySelector("video");

    // // Use the html2canvas
    // // function to take a screenshot
    // // and append it
    // html2canvas(video).then(function (canvas) {
    //   document.getElementById("output").appendChild(canvas);
    // });
  };

  return (
    <EditorContainer>
      <TitleInput
        type="text"
        placeholder="Note Title (optional)"
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
      />
      <ReactQuill
        value={noteContent}
        onChange={setNoteContent}
        placeholder="Write your note here..."
        modules={{
          toolbar: [
            [{ header: "1" }, { header: "2" }],
            [
              "bold",
              "italic",
              "underline",
              "strike",
              "blockquote",
              "code-block",
            ],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" },
            ],
            ["link", "image"],
            ["clean"],
          ],
        }}
      />
      <div id="output"></div>
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
        <Button title="Save" handleClick={handleSaveNote} />
      </ButtonContainer>
    </EditorContainer>
  );
};

export default AddNote;

