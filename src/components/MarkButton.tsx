import React from "react";
import { Editor } from "slate";
import { useSlate } from "slate-react";
import styled from "styled-components";

type IconProps = {
  children: React.ReactNode;
};

type MarkButtonProps = {
  format: string;
  icon: string;
  toggleMark: (editor: Editor, format: string) => void;
};

const Button = styled.button<{ $active: boolean }>`
  border: ${({ $active }) =>
    $active ? "2px solid var(--notebook-green)" : "none"};
  cursor: pointer;
  margin-right: 0.5rem;
  width: 25px;
  height: 20px;
  border-radius: 2px;
`;

const Icon = styled.img`
  max-width: 40%;
`;

const MarkButton = ({ format, icon, toggleMark }: MarkButtonProps) => {
  const editor = useSlate();

  const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  return (
    <Button
      $active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon src={icon} alt="Mark button" />
    </Button>
  );
};

export default MarkButton;

