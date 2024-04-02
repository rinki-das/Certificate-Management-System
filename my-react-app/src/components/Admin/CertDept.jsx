import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaTachometerAlt, FaFileAlt, FaUserGraduate, FaUniversity, FaSignOutAlt } from 'react-icons/fa';
import './admin.css';

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

const CertDept = () => {
  const navigate = useNavigate();

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

  useEffect(() => {
    // Add any necessary logic to fetch and update total visits
    // For now, let's set it to a random number
    setTotalVisits(Math.floor(Math.random() * 100));
  }, []);

  const setTotalVisits = (visits) => {
    // Implement the logic to set total visits
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
            <Link to="/certdept">
              <FaTachometerAlt /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/certtable">
              <FaFileAlt /> Certificate Number
            </Link>
          </li>
          <li>
            <Link to="/printcert">
              <FaFileAlt /> Print Certificates
            </Link>
          </li>
          <li>
            <Link to="#">
              <FaUserGraduate /> Student Status
            </Link>
          </li>
          <li>
            <Link to="#">
              <FaUniversity /> Store Certificates
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
        <h1 className="welcome-header">Welcome to Certificate Department</h1>

        <div className="card">
          <div className="content">
            <p className="heading">Your Exams </p>
            <p className="para">See the details of your recent exams</p>
            <button className="btn">Check</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CertDept;
