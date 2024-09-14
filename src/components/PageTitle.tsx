import React from "react";
import styled from "styled-components";

type PageTitleProps = {
  selectedSection: string;
  handleBackClick: () => void;
};

const PageTitle: React.FC<PageTitleProps> = ({
  handleBackClick,
  selectedSection,
}) => {
  return (
    <TitleContainer>
      <BackButton onClick={handleBackClick}>&lsaquo;</BackButton>
      <Title title={selectedSection}>{selectedSection}</Title>
    </TitleContainer>
  );
};

export default PageTitle;

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

