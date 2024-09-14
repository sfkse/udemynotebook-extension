import React from "react";
import styled from "styled-components";

type ListProps = {
  children?: React.ReactNode;
};

type ListItemProps = {
  options: React.ReactNode;
  handleClick: () => void;
  title?: string;
  content?: string;
  timestamp?: string;
};

const List = ({ children }: ListProps) => {
  return <ListContainer>{children}</ListContainer>;
};

const ListItem = ({
  title,
  content,
  timestamp,
  options,
  handleClick,
}: ListItemProps) => {
  if (content && content.length > 45) {
    content = content.slice(0, 45) + "...";
  }

  return (
    <ListItemContainer className="list-item-container" onClick={handleClick}>
      <TitleWrapper $hasOptions={options}>
        {timestamp && <Timestamp>{timestamp}</Timestamp>}
        {title && <Title>{title}</Title>}
        {!title && <Content dangerouslySetInnerHTML={{ __html: content }} />}
      </TitleWrapper>
      {options}
    </ListItemContainer>
  );
};

List.Item = ListItem;

export default List;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ListItemContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  margin-top: 10px;
  background-color: var(--notebook-dark-secondary-color);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  font-size: 14px;
  border-radius: 5px;
  &:hover {
    background-color: var(--notebook-dark-secondary-color);
  }
`;

const Timestamp = styled.div`
  margin-right: 10px;
  font-size: 12px;
  /* color: var(--notebook-gray); */
`;

const TitleWrapper = styled.div<{ $hasOptions: React.ReactNode }>`
  display: flex;
  align-items: center;
  width: ${({ $hasOptions }) => ($hasOptions ? "80%" : "100%")};
`;

const Content = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Title = styled(Content)``;

