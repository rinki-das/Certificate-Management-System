// NotificationsPage.jsx
import React, { useState } from 'react';
import './NotificationsPage.css'; // Create a CSS file for styling if needed

const NotificationsPage = ({ handleSendNotification }) => {
  const [recipientEmail, setRecipientEmail] = useState('');

  const handleSubmit = () => {
    // Call the function passed from AdminForm to handle notification sending
    handleSendNotification(recipientEmail);
  };

  return (
    <div className="send-notification-page">
      <h5>Send Notification</h5>
      <div className="form-group">
        <label>
          Recipient Email:
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
        </label>
        <button type="button" onClick={handleSubmit} className="send-notification-button">
          Send Notification
        </button>
      </div>
    </div>
  );
};

export default NotificationsPage;
