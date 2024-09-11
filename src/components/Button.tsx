import React from "react";
import styled from "styled-components";

type ButtonProps = {
  title: string;
  outlined?: boolean;
  icon?: string;
  disabled?: boolean;
  handleClick: (e) => void;
};

export const Button: React.FC<ButtonProps> = ({
  outlined,
  title,
  icon,
  disabled,
  handleClick,
}) => {
  return (
    <ButtonContainer
      disabled={disabled}
      $isOutlined={outlined}
      onClick={handleClick}
    >
      {icon && <img src={icon} alt="icon" />}
      {title}
    </ButtonContainer>
  );
};

const ButtonContainer = styled.button<{ $isOutlined?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px 20px;
  background-color: ${(props) =>
    props.$isOutlined ? "transparent" : "var(--notebook-green)"};
  color: var(--notebook-secondary-color);
  font-size: 14px;
  border: ${(props) =>
    props.$isOutlined ? "1px solid var(--notebook-green)" : "none"};
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: var(--notebook-light-green);
  }
`;
