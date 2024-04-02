import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaBars, FaTimes, FaTachometerAlt, FaFileAlt, FaEdit, FaUserGraduate, FaUniversity, FaSignOutAlt } from 'react-icons/fa';
import './admin.css'; // Updated CSS file name

const FloatingContainer = ({ isVisible, children }) => {
  const containerStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    background: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    display: isVisible ? 'block' : 'none',
    zIndex: 9999,
  };

  return <div style={containerStyle}>{children}</div>;
};

const UserDept = () => {
  const navigate = useNavigate();
  const { path } = useParams();

  const [loggedInUser, setLoggedInUser] = useState({
    name: '',
    imageUrl: 'https://static.thenounproject.com/png/5034901-200.png',
  });

  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = () => {
    clearAuthenticationStatus();
    setShowLogoutConfirmation(false);
    navigate('/logins');
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const clearAuthenticationStatus = () => {
    setLoggedInUser({
      name: '',
      imageUrl: 'https://static.thenounproject.com/png/5034901-200.png',
    });
  };

  return (
    <div>
      <input type="checkbox" id="check" />
      <label htmlFor="check">
        <FaBars className="btn" />
        <FaTimes className="cancel" />
      </label>

      <div className="sidebar">
        <header>NIELIT</header>

        <div className="profile-section">
          <div className="profile-image-container">
            <img src={loggedInUser.imageUrl} alt="Profile" />
          </div>
          <div className="profile-info">
            <p>{loggedInUser.name}</p>
          </div>
        </div>

        <ul>
          <li>
            <Link to="/pro">
              <FaTachometerAlt /> My Profile
            </Link>
          </li>
          <li>
            <Link to="/admin">
              <FaTachometerAlt /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/addinst">
              <FaUniversity /> Add Institutes
            </Link>
          </li>
          <li>
            <Link to="/batch">
              <FaUserGraduate /> Batch Code
            </Link>
          </li>
          <li>
            <Link to="/data-entry">
              <FaFileAlt /> Data Import
            </Link>
          </li>
          <li>
            <Link to="/UserForm">
              <FaEdit /> Edit & Notify
            </Link>
          </li>
          <li>
            <Link to="/findstudent">
              <FaUserGraduate /> Student Status
            </Link>
          </li>
         
          <li>
            <Link to="#" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </Link>
          </li>
        </ul>
      </div>

      <FloatingContainer isVisible={showLogoutConfirmation}>
        <p>Are you sure you want to logout?</p>
        <button onClick={confirmLogout}>Yes</button>
        <button onClick={cancelLogout}>Cancel</button>
      </FloatingContainer>

      <section className="main-content">
        <div className="image-container">
          <img
            src="http://localhost:3000/images/new.png"
            alt="Image Description"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        <div className="card">
          <div className="content">
            <p className="heading">Your Exams </p>
            <p className="para">
              See the details of your recent exams
            </p>
            <button className="btn">Check</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserDept;
