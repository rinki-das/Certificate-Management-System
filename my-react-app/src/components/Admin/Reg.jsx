import React, { useState } from 'react';
import './Reg.css';


const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check password strength on password field change
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    const strengthMapping = [
      'Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'
    ];

    const passwordScore = password.length > 7 ? Math.floor(Math.random() * 5) + 1 : 0;

    setPasswordStrength({
      score: passwordScore,
      feedback: strengthMapping[passwordScore],
    });
  };

  const handleSendOtp = async () => {
    if (!formData.name || !formData.department || !formData.phoneNumber || !formData.email || !formData.password || !formData.confirmPassword) {
      setRegistrationMessage('Please fill in all fields');
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setRegistrationMessage('Invalid email format');
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      setRegistrationMessage('Passwords do not match');
      return;
    }
  
    if (passwordStrength.score < 2) {
      setRegistrationMessage('Weak password. Please choose a stronger password.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: formData.email }),
      });
    
      if (response.ok) {
        setIsOtpSent(true);
        setRegistrationMessage('OTP sent successfully! Please check your email.');
        alert('OTP sent successfully! Please check your email.');
      } else {
        const errorMessage = await response.text();
        setRegistrationMessage(`Error sending OTP: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setRegistrationMessage('Error sending OTP. Please try again.');
    }
  };  // Add this closing brace
  

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch('http://localhost:3000/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: formData.email, otp: formData.otp }),
      });
    
      if (response.ok) {
        setRegistrationMessage('OTP verified successfully! You are now registered. Please Go to Login Page');
    
        try {
          const registerResponse = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.name,
              department: formData.department,
              phoneNumber: formData.phoneNumber,
              email: formData.email,
              password: formData.password,
            }),
          });
    
          if (registerResponse.ok) {
            console.log('User registration saved successfully');
            // You can perform additional actions after successful registration
          } else {
            console.error('Error saving user registration:', await registerResponse.text());
          }
        } catch (registerError) {
          console.error('Error saving user registration:', registerError);
        }
      } else {
        const errorMessage = await response.text();
        setRegistrationMessage(`Error verifying OTP: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setRegistrationMessage('Error verifying OTP. Please try again.');
    }
  };
    
  return (


    <div className="registration-container">
       
      <div className="image-container">
        <img src="http://localhost:3000/images/new.png" alt="Image Description" style={{ width: '100%', height: 'auto' }} />
      </div>
    <div className="registration-header">
      <h1>Registration</h1>
    </div>
    <div className="registration-form-container">
      <label>Name:</label>
      <input type="text" name="name" value={formData.name} onChange={handleChange} />

      <label>Department:</label>
      <select name="department" value={formData.department} onChange={handleChange}>
        <option value="">Select Department</option>
        <option value="User Department">User Department</option>
        <option value="Certificate Department">Certificate Department</option>
      </select>

      <label>Phone Number:</label>
      <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />

      <label>Email:</label>
      <input type="email" name="email" value={formData.email} onChange={handleChange} />

      <label>Password:</label>
      <input type="password" name="password" value={formData.password} onChange={handleChange} />
      <div className="password-strength">
        <span>Password Strength: {passwordStrength.feedback}</span>
        <div className={`strength-indicator strength-${passwordStrength.score}`} />
      </div>

      <label>Confirm Password:</label>
      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />

      {isOtpSent ? (
        <div>
          <label>Enter OTP:</label>
          <input type="text" name="otp" value={formData.otp} onChange={handleChange} />
          <button className="verify-otp-button" onClick={handleVerifyOtp}>
            Verify OTP
          </button>
        </div>
      ) : (
        <button className="send-otp-button" onClick={handleSendOtp}>
          Send OTP
        </button>
      )}

      {registrationMessage && (
        <div style={{ color: 'green' }}>
          {registrationMessage}
        </div>
      )}
    </div>
    </div>
  );
};



export default RegistrationForm;
