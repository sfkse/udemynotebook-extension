import React, { useCallback } from "react";
import List from "./List";
import NothingFoundContainer from "./NothingFoundContainer";
import { INote } from "utils/types";
import styled from "styled-components";

const AllSectionsTabContent: React.FC<{
  sections: any;
  handleClickSection: any;
  courseNotes: any;
}> = ({ sections, handleClickSection, courseNotes }) => {
  const fetchSectionOptions = useCallback(
    (lectureName: string) => {
      const sectionNotes = courseNotes.filter(
        (note: INote) => note.lecture === lectureName
      );
      return (
        <OptionsWrapper>{`${sectionNotes.length} ${
          sectionNotes.length === 1 ? "note" : "notes"
        }`}</OptionsWrapper>
      );
    },
    [courseNotes]
  );
  return (
    <>
      {sections.length > 0 ? (
        sections.map((section) => (
          <List.Item
            key={section.idnotes}
            title={section.lecture}
            options={fetchSectionOptions(section.lecture)}
            handleClick={() => handleClickSection(section)}
          />
        ))
      ) : (
        <NothingFoundContainer>
          <img src="https://iili.io/d8jz6HN.png" alt="Nothing found" />
          <div>No sections found</div>
        </NothingFoundContainer>
      )}
    </>
  );
};

export default AllSectionsTabContent;

const OptionsWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  img {
    cursor: pointer;
  }
`;

