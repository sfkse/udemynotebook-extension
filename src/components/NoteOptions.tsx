import React from "react";

type Note = {
  isPublic: boolean;
};

const NoteOptions: React.FC<Note> = ({ isPublic }: Note) => {
  return (
    <>
      {isPublic ? (
        <img src="https://iili.io/dwml9Pn.png" alt="public" title="Public" />
      ) : (
        <img src="https://iili.io/dwmldcG.png" alt="private" title="Private" />
      )}
      <img src="https://iili.io/dwmAbZg.png" alt="delete" title="Delete" />
    </>
  );
};

export default NoteOptions;

