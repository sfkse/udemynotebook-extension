import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "fontsource-roboto";
import styled from "styled-components";
import { Button } from "../components/Button";
import "./popup.css";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

const App: React.FC = () => {
  const { user, login, register, logout, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (user) {
      console.log(user);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      // Send the login message to the active tab's content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              message: "login",
              data: { userID: user?.userID, email: user?.email },
            },
            (response) => {
              console.log("Message sent to content script:", response);
            }
          );
        }
      });
    } catch (error) {
      alert(
        `${isRegistering ? "Registration" : "Login"} failed: ${error.message}`
      );
    }
  };

  const handleLogout = () => {
    logout();
    // Send the logout message to the active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { message: "logout" },
          (response) => {
            console.log("Logout message sent to content script:", response);
          }
        );
      }
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Heading>Udemy Notebook App</Heading>
      {user ? (
        <>
          <p>Welcome back, {user.email}</p>
          <Button title="Logout" handleClick={handleLogout} />
        </>
      ) : (
        <>
          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              disabled={isLoading}
              title={isRegistering ? "Register" : "Login"}
              handleClick={handleSubmit}
            >
              {isRegistering ? "Register" : "Login"}
            </Button>
          </Form>
          <ToggleText onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </ToggleText>
        </>
      )}
      <LearnMore href="#">Learn more about the app</LearnMore>
    </Container>
  );
};

const WrappedApp: React.FC = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container!);
root.render(<WrappedApp />);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  font-family: "Roboto", sans-serif;
  padding: 1rem 2rem;
  height: 300px;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ToggleText = styled.p`
  font-size: 12px;
  color: var(--notebook-green);
  cursor: pointer;
  margin-top: 10px;
`;

