import React, { useState } from 'react';
import './ForgetPass.css';

const ForgetPass = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    setMessage('');
  
    try {
      // Check if the email exists in the users collection
      const userResponse = await fetch(`http://localhost:3000/userexists/${email}`);
      const userExists = await userResponse.json();
  
      // Check if the email exists in the certificate collection
      const certificateResponse = await fetch(`http://localhost:3000/certificateexists/${email}`);
      const certificateExists = await certificateResponse.json();
  
      if (userExists.exists) {
        // Call your server endpoint to send OTP to the provided email
        const response = await fetch('http://localhost:3000/forgotpassword', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
  
        if (response.ok) {
          setMessage('OTP sent successfully. Check your email.');
        } else {
          const errorMessage = await response.json();
          setMessage(`Error: ${errorMessage.message}`);
        }
      } else if (certificateExists.exists) {
        // Call your server endpoint to send OTP to the provided email
        const response = await fetch('http://localhost:3000/forgotpassword', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
  
        if (response.ok) {
          setMessage('OTP sent successfully. Check your email.');
        } else {
          const errorMessage = await response.json();
          setMessage(`Error: ${errorMessage.message}`);
        }
      } else {
        setMessage('This email is not registered. Please enter a registered email.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error during sending OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleVerifyOtp = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Call your server endpoint to verify the entered OTP
      const response = await fetch('http://localhost:3000/verifyotp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        setMessage('OTP verified successfully. Enter a new password.');
      } else {
        const errorMessage = await response.json();
        setMessage(`Error: ${errorMessage.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error during OTP verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setMessage('');
  
    try {
      // Call your server endpoint to change the password for users
      const userResponse = await fetch('http://localhost:3000/updatepassword/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });
  
      // Call your server endpoint to change the password for certificates
      const certificateResponse = await fetch('http://localhost:3000/updatepassword/certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });
  
      if (userResponse.ok && certificateResponse.ok) {
        setMessage('Password changed successfully. You can now log in with the new password.');
      } else {
        const errorMessage = await userResponse.json() || await certificateResponse.json();
        setMessage(`Error: ${errorMessage.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error during password change. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="forget-pass-container">
      <h2>Forgot Password</h2>
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={handleSendOtp} disabled={loading}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </div>

      <div>
        <label>OTP:</label>
        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
        <button onClick={handleVerifyOtp} disabled={loading}>
          {loading ? 'Verifying OTP...' : 'Verify OTP'}
        </button>
      </div>

      <div>
        <label>New Password:</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button onClick={handleChangePassword} disabled={loading}>
          {loading ? 'Changing Password...' : 'Change Password'}
        </button>
      </div>

      {message && <div className="forget-pass-message">{message}</div>}
    </div>
  );
};

export default ForgetPass;
