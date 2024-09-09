import React from "react";
import styled from "styled-components";

type Tab = {
  title: string;
  activeTab: string;
  handleClick: () => void;
};

type TabsProps = {
  children?: React.ReactNode;
};

const TabsContainer = styled.div`
  display: flex;
  margin-top: 20px;
  justify-content: space-between;
  font-family: "Roboto", sans-serif;
  margin-left: 20px !important;
  margin-right: 20px !important;
`;
const TabItem = styled.div<{ $isActive: boolean }>`
  width: 50%;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid
    ${(props) => (props.$isActive ? "var(--notebook-green)" : "transparent")};
  font-size: 18px;
  padding: 5px 20px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 3px;
  &:hover {
    border-bottom: 1px solid var(--notebook-green);
  }
`;
const SubTabs = ({ children }: TabsProps) => {
  return <TabsContainer>{children}</TabsContainer>;
};

const Tab = ({ title, activeTab, handleClick }: Tab) => {
  console.log("Tab", title, activeTab);
  return (
    <TabItem onClick={handleClick} $isActive={activeTab === title}>
      {title}
    </TabItem>
  );
};

SubTabs.Tab = Tab;

export default SubTabs;

