import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "fontsource-roboto";
import styled from "styled-components";
import { Button } from "../components/Button";
import "./popup.css";
import { IUser } from "../utils/types";
import { getUserProfileInfo } from "../api/user";
import { authenticateUser } from "api/auth";

const App: React.FC<{}> = () => {
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [user, setUser] = React.useState<IUser>({ userID: "", email: "" });

  useEffect(() => {
    chrome.storage.sync.get(["userID", "email"], (result) => {
      setUser({ userID: result.userID, email: result.email });
    });
  }, []);

  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    // Send message to background script to start login flow
    chrome.runtime.sendMessage({ action: "login" }, async (response) => {
      if (response.success) {
        console.log("Logged in successfully:", response.token);
        try {
          const { id: googleID, email } = await fetchUserProfile(
            response.token
          );
          // Save user info db
          const res = await authenticateUser(googleID, email);

          if (!res.ok) {
            alert("Something went wrong. Please try again.");
            setIsLoggingIn(false);
            return;
          }
          const data = await res.json();
          console.log(data);
          chrome.storage.sync.set({ userID: data.userID, email });
          setUser({ userID: data.userID, email });
          setIsLoggingIn(false);

          // Send the login message to the active tab's content script
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
              chrome.tabs.sendMessage(
                tabs[0].id,
                {
                  message: "login",
                  data: { userID: data.userID, email },
                },
                (response) => {
                  console.log("Message sent to content script:", response);
                }
              );
            }
          });
        } catch (error) {
          setIsLoggingIn(false);
          return alert(`Failed to fetch user profile: ${error}`);
        }
      } else {
        setIsLoggingIn(false);
        return alert(`Login failed: ${response.error}`);
      }
    });
  };

  function fetchUserProfile(token) {
    return getUserProfileInfo(token);
  }

  return (
    <Container>
      <Heading>Udemy Notebook App</Heading>
      {user.userID ? (
        <p>Welcome back, {user.email}</p>
      ) : (
        <>
          <LoginText>
            Login to save your notes and access them from any device
          </LoginText>
          <Button
            disabled={isLoggingIn}
            icon="https://iili.io/d8umXF2.png"
            title="Login with Google"
            handleClick={handleGoogleLogin}
          >
            Login with Google
          </Button>
        </>
      )}
      <LearnMore href="#">Learn more about the app</LearnMore>
    </Container>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container!);
root.render(<App />);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  font-family: "Roboto", sans-serif;
  padding: 1rem 2rem;
  height: 200px;
  width: 300px;
  color: var(--notebook-secondary-color);
`;

const Heading = styled.h1`
  font-size: 18px;
  text-align: center;
`;

const LearnMore = styled.a`
  font-size: 11px;
  color: var(--notebook-green);
  text-decoration: underline;
  cursor: pointer;
`;

const LoginText = styled.p`
  font-size: 14px;
  text-align: center;
  color: var(--notebook-secondary-color);
`;
