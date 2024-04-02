// ProPage.js

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ProPage.css';

const ProPage = () => {
  const location = useLocation();
  const [userDetails, setUserDetails] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [editMode, setEditMode] = useState(false); // Track whether in edit mode
  const [address, setAddress] = useState('');
  const [designation, setDesignation] = useState('');

  useEffect(() => {
    const { state } = location;
    if (state && state.name && state.phoneNumber && state.email) {
      setUserDetails(state);
      // Fetch the user's profile picture (you might need to implement this)
      // Example: You can make a separate API request to fetch the user's profile picture.
    } else {
      // If not available, fetch user details and profile picture from the server (you might need to implement this)
      // Example: You can make a separate API request to fetch user details and profile picture based on the authenticated user.
    }

    // Set default values for address and designation
    setAddress(state?.address || '');
    setDesignation(state?.designation || '');
  }, [location]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setProfilePicture(file);
  };

  const handleImageClick = () => {
    // Trigger the file input when the default photo is clicked
    document.getElementById('profile-picture-input').click();
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = () => {
    // Implement logic to save address and designation (you might need to make an API request)
    // For demonstration purposes, we'll log the values to the console
    console.log('Address:', address);
    console.log('Designation:', designation);

    // Exit edit mode
    setEditMode(false);
  };

  return (
    <div>
      {/* Image Container */}
      <div className="image-container">
        <img
          src="http://localhost:3000/images/new.png"
          alt="Image Description"
          style={{ width: '100%', height: 'auto' }}
        />
      </div>

      {/* Profile Container */}
      <div className="profile-container">
        {/* Left Column: Profile Picture */}
        <div className="left-column">
          <div className="profile-picture-container" onClick={handleImageClick}>
            <input
              id="profile-picture-input"
              className="profile-picture-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {profilePicture ? (
              <img className="profile-picture" src={URL.createObjectURL(profilePicture)} alt="Profile" />
            ) : (
              <label htmlFor="profile-picture-input" className="default-profile-picture-label">
                <img
                  className="default-profile-picture"
                  src="https://as2.ftcdn.net/v2/jpg/00/64/67/63/1000_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg" // Replace with the path to your default image
                  alt="Default Profile"
                />
              </label>
            )}
          </div>
        </div>

        {/* Right Column: Contact Preferences */}
        <div className="right-column">
          <h2 className="section-header">Contact Preferences</h2>
          <p className="profile-details">Name: {userDetails.name}</p>
          <p className="profile-details">Email: {userDetails.email}</p>
          <p className="profile-details">Phone Number: {userDetails.phoneNumber}</p>

          {/* Address and Designation Editing */}
          {editMode ? (
            <>
              <label>
                Address:
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
              </label>
              <br />
              <label>
                Designation:
                <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} />
              </label>
              <br />
              <button onClick={handleSave}>Save</button>
            </>
          ) : (
            <>
              <p className="profile-details">Address: {address}</p>
              <p className="profile-details">Designation: {designation}</p>
              <button onClick={handleEdit}>Edit</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProPage;
