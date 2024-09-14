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

const Tabs = ({ children }: TabsProps) => {
  return <TabsContainer>{children}</TabsContainer>;
};

const Tab = ({ title, activeTab, handleClick }: Tab) => {
  return (
    <TabItem onClick={handleClick} $isActive={activeTab === title}>
      {title}
    </TabItem>
  );
};

Tabs.Tab = Tab;

export default Tabs;

const TabsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: "Roboto", sans-serif;
  margin-left: 20px !important;
  margin-right: 20px !important;
  margin-bottom: 16px !important;
`;

const TabItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  background-color: ${(props) =>
    props.$isActive ? "var(--notebook-green)" : "transparent"};
  font-size: 18px;
  padding: 5px 20px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  font-size: 14px;
  border-radius: 3px;
  &:hover {
    background-color: var(--notebook-green);
  }
`;

