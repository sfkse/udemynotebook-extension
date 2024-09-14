import React from "react";
import styled from "styled-components";

interface NoteOptionsProps {
  isPublic: boolean;
  onDelete: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const NoteOptions: React.FC<NoteOptionsProps> = ({ isPublic, onDelete }) => {
  return (
    <OptionsContainer>
      <Icon
        src={
          isPublic
            ? "https://iili.io/dwml9Pn.png"
            : "https://iili.io/dwmldcG.png"
        }
        alt={isPublic ? "Public" : "Private"}
      />
      <Icon src="https://iili.io/dwmAbZg.png" alt="Delete" onClick={onDelete} />
    </OptionsContainer>
  );
};

const OptionsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Icon = styled.img`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

export default NoteOptions;

