import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/home";
import About from "./components/About";
import Lists from "./components/lists"
import "./components/NavBar.css";
import "./Modal.css";

const App = () => {

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  const BASE_URL = "http://localhost:3000/api";

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("signIn"); // Default content
  const [email, setEmail] = useState(""); // Email input state
  const [username, setUsername] = useState(""); // Username state
  const [password, setPassword] = useState(""); // Password input state
  const [loginError, setLoginError] = useState(""); // Login error message
  const [registrationError, setRegistrationError] = useState("");
  const [currentUsername, setCurrentUsername] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Track if the user is an admin



  const openPasswordModal = () => {
    setIsPasswordModalOpen(true);
    setPasswordUpdateMessage(""); // Clear previous messages
};

const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setNewPassword(""); // Clear input
};

const handleUpdatePassword = async () => {
  if (!newPassword.trim()) {
      setPasswordUpdateMessage("Password cannot be empty.");
      return;
  }

  alert("This functionality doesn't work");
  /** 

  try {
      const response = await fetch(`${BASE_URL}/updatePassword`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword }),
      });

      if (!response.ok) {
          throw new Error("Failed to update password.");
      }

      setPasswordUpdateMessage("Password updated successfully!");
      closePasswordModal();
  } catch (error) {
      console.error("Error updating password:", error);
      setPasswordUpdateMessage("Failed to update password. Please try again.");
  }*/
};



  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setModalContent("signIn"); // Reset to Sign In content
    setIsModalOpen(false);
  };

  const showCreateAccount = () => setModalContent("createAccount");

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission
    setLoginError(""); // Clear any previous error messages

    if (!emailRegex.test(email)) {
      setLoginError("Invalid email format. Please enter a valid email address.");
      return;
    }

    try {
      if (password === "admin") {
        // Special admin login
        setCurrentUsername("Admin");
        setIsAdmin(true);
        handleCloseModal();
        return;
      }

      // Regular user login
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();

      // Fetch the username from Firestore
      const emailKey = data.email.replace(/\./g, ","); // Replace dots for Firestore compatibility
      const userResponse = await fetch(`${BASE_URL}/getUsername?emailKey=${emailKey}`);
      if (!userResponse.ok) {
        throw new Error("Failed to fetch username");
      }

      const userData = await userResponse.json();
      setCurrentUsername(userData.username); // Set the username in state
      setIsAdmin(false); // Ensure admin is false for regular users
      handleCloseModal(); // Close the modal on successful login
    } catch (error) {
      console.error("Login error:", error.message);
      setLoginError("Invalid email or password. Please try again.");
    }
  };


  

const handleRegister = async (e) => {
  e.preventDefault();
  setRegistrationError(""); // Clear any previous errors

  if (!emailRegex.test(email)) {
      setRegistrationError("Invalid email format. Please enter a valid email address.");
      return;
  }

  try {
      // Register the user with email and password
      const response = await fetch(`${BASE_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          if (errorData.error === "The email address is already in use by another account.") {
              throw new Error("Email is already in use. Please use a different email.");
          }
          throw new Error("Failed to create account");
      }

      const registerData = await response.json();

      // Associate the email with the username in Firestore
      const associateResponse = await fetch(`${BASE_URL}/associate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: registerData.email, username }),
      });

      if (!associateResponse.ok) {
          const errorData = await associateResponse.json();
          throw new Error(errorData.error || "Failed to associate email with username");
      }

      const associateData = await associateResponse.json();
      console.log("Association successful:", associateData);

      // Notify the user and switch back to Sign In
      alert(`Account created successfully! Your username is: ${username}`);
      setModalContent("signIn");
  } catch (error) {
      console.error("Registration error:", error.message);
      setRegistrationError(error.message); // Display the specific error message
  }
};
  

const handleLogout = () => {
  setCurrentUsername(null); // Clear the username state
  setEmail(""); // Clear any other stored user info
  setPassword(""); // Clear the password state if stored
  setIsAdmin(false); // Reset admin status
  alert("You have successfully logged out.");
};
  
  
  
  
  
  

  return (
    <Router>
      <div>
      <nav className="navbar">
  <ul>
    <li>
      <Link to="/">Home</Link>
    </li>
    <li>
      <Link to="/about">About</Link>
    </li>
    <li>
      <Link to="/lists">All Lists</Link>
    </li>
  </ul>
  {currentUsername ? (
    <div className="navbar-logged-in">
    <span className="navbar-username">Hello, {currentUsername}!</span>
    <button onClick={openPasswordModal} className="password-button">Update Password</button>
    <button onClick={handleLogout} className="logout-button">Log Out</button>
</div>
  ) : (
    <button onClick={handleOpenModal}>Sign in</button>
  )}
</nav>


        <Routes>
          <Route path="/" element={<Home currentUsername = {currentUsername}/>} />
          <Route path="/about" element={<About />} />
          <Route path="/lists" element={<Lists currentUsername = {currentUsername}/>}/>
        </Routes>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <button className="close-button" onClick={handleCloseModal}>
                X
              </button>

              {/* Render Content Dynamically */}
              {modalContent === "signIn" && (
                <div>
                  <h2>Sign In</h2>
                  <form onSubmit={handleLogin}>
                    <label>
                      Email:
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </label>
                    <br />
                    <label>
                      Password:
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </label>
                    <br />
                    <button type="submit">Sign In</button>
                  </form>
                  {loginError && <p className="error-message">{loginError}</p>}
                  <button onClick={showCreateAccount}>Create New Account</button>
                </div>
              )}

{
  modalContent === "createAccount" && (
    <div>
      <h2>Create New Account</h2>
      <form onSubmit={handleRegister}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Register</button>
      </form>
      {registrationError && <p className="error-message">{registrationError}</p>}
      <button onClick={() => setModalContent("signIn")}>Back to Sign In</button>
    </div>
  )
}
            </div>
          </div>
        )}
      </div>

      {isPasswordModalOpen && (
    <div className="modal-overlay" onClick={closePasswordModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Update Password</h2>
            <label>
                New Password:
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
            </label>
            <button onClick={handleUpdatePassword}>Update Password</button>
            <button onClick={closePasswordModal}>Cancel</button>
            {passwordUpdateMessage && <p>{passwordUpdateMessage}</p>}
        </div>
    </div>
)}
    </Router>
  );
};

export default App;
