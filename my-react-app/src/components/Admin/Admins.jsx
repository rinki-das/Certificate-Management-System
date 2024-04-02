import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './admin.css';

const UserDept = () => {
  const [loggedInUser, setLoggedInUser] = useState({
    name: '', // Initialize with an empty name
    imageUrl: 'https://static.thenounproject.com/png/5034901-200.png', // Default profile image
  });

  const [totalVisits, setTotalVisits] = useState(0);

  useEffect(() => {
    // Add any necessary logic to fetch and update total visits
    // For now, let's set it to a random number
    setTotalVisits(Math.floor(Math.random() * 100));
  }, []);

  const handleLogout = () => {
    // Implement your logout logic here
    console.log('Logout clicked');
    // You may want to redirect the user to the login page or perform any necessary cleanup
  };



  return (
    <div>
      <input type="checkbox" id="check" />
      <label htmlFor="check">
        <i className="fas fa-bars" id="btn"></i>
        <i className="fas fa-times" id="cancel"></i>
      </label>

      <div className="sidebar">
        <header>NIELIT</header>

        {/* Profile section */}
        <div className="profile-section">
          <div className="profile-image-container">
            <img src={loggedInUser.imageUrl} alt="Profile" />
          </div>
          <div className="profile-info">
            <p>{loggedInUser.name}</p>
            {/* You can add more user details here, like role or department */}
          </div>
        </div>

        <ul>
          <li>
            <Link to="/admins">
              <i className="fas fa-tachometer-alt"></i>Dashboard
            </Link>
          </li>
          <li>
            <Link to="/batch">
              <i className="fas fa-file-alt"></i>Batch Code
            </Link>
          </li>
          <li>
            <Link to="/data-entry">
              <i className="fas fa-file-alt"></i>Data Import
            </Link>
          </li>
          <li>
            <Link to="/AdminForm">
              <i className="fas fa-edit"></i>Edit & Notify
            </Link>
          </li>
          <li>
            <Link to="/addinst">
              <i className="fas fa-edit"></i>Add Institute
            </Link>
          </li>
          <li>
            <Link to="#">
              <i className="fas fa-user-graduate"></i>Student Status
            </Link>
          </li>
          <li>
            <Link to="#" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>Logout
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserDept;