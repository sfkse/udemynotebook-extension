import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 60px;
  img {
    width: 50%;
  }
`;
const NothingFoundContainer = ({ children }: { children: React.ReactNode }) => {
  return <Container>{children}</Container>;
};

export default NothingFoundContainer;
