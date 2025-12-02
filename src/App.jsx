import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import CoursePage from "./pages/CoursePage";

// Add this configuration block to your main application entry point (e.g., _app.js)

// main.jsx or index.jsx (Your App Root File)

import { Amplify } from "aws-amplify"; // <-- Simple import from top-level package
import ProfilePage from "./pages/ProfilePage";

// 1. Configuration Block (Must execute first)
Amplify.configure({
  Auth: {
    // V6 REQUIRES the nested 'Cognito' object
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,

      // Property name changed from userPoolWebClientId to userPoolClientId
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,

      region: import.meta.env.VITE_AWS_REGION,
      // Note: identityPoolId is optional, omitted for simplicity here
    },
  },
});
// ... rest of the file ...
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <Dashboard />
            </motion.div>
          }
        />
        <Route
          path="/signup"
          element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <SignUpPage />
            </motion.div>
          }
        />
        <Route
          path="/login"
          element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <LoginPage />
            </motion.div>
          }
        />
        <Route
          path="/course/:slug"
          element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <CoursePage />
            </motion.div>
          }
        />
        <Route
          path="/profile"
          element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <ProfilePage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
