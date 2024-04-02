import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Logins.css';


const LoginPage = () => {
  const departmentRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const adminDepartmentRef = useRef(null);
  const adminPasswordRef = useRef(null);
  const [loginMessage, setLoginMessage] = useState('');
  const [adminLoginMessage, setAdminLoginMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  const setUserDetails = (details) => {
    // Define your setUserDetails logic here
    console.log('Setting user details:', details);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginMessage('');

    const loginData = {
      department: departmentRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const { department, name, email, phone } = await response.json();
        setLoginMessage(`Login successful! Welcome, ${name}, to ${department} department.`);
        setIsLoggedIn(true);

        setUserDetails({
          name,
          email,
          phone,
        });

        if (department === 'Certificate Department') {
          navigate('/CertDept');
        } else if (department === 'User Department') {
          navigate('/admin');
        }
      } else {
        const errorMessage = await response.json();
        setLoginMessage(`Error: ${errorMessage.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoginMessage('Error during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminLoginMessage('');

    const adminLoginData = {
      department: adminDepartmentRef.current.value,
      password: adminPasswordRef.current.value,
    };

    try {
      if (adminLoginData.password === 'admin1') {
        setAdminLoginMessage('Admin login successful!');
        setIsLoggedIn(true);

        if (adminLoginData.department === 'Certificate Department') {
          navigate('/CertDept');
        } else if (adminLoginData.department === 'User Department') {
          navigate('/admins');
        }
      } else {
        setAdminLoginMessage('Invalid admin credentials');
      }
    } catch (error) {
      console.error('Error:', error);
      setAdminLoginMessage('Error during admin login. Please try again.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Redirect to the ForgetPass component when "Forgot Password" is clicked
    navigate('/forgetpass');
  };

  return (
    <div className="login-page-container">
      {!isLoggedIn && (
        <div className="login-form-container">
          <form onSubmit={handleLogin}>
            <label>Department:</label>
            <select ref={departmentRef} defaultValue="">
              <option value="" disabled>Select Department</option>
              <option value="User Department">User Department</option>
              <option value="Certificate Department">Certificate Department</option>
            </select>

            <label>Email:</label>
            <input type="text" ref={emailRef} />

            <label>Password:</label>
            <input type="password" ref={passwordRef} />

            <button type="submit" className="login-button" disabled={loading}>
              <div className="button-content">
                {loading && <div className="spinner"></div>}
                {!loading && 'Login'}
              </div>
            </button>
          </form>

          {loginMessage && (
            <div className="login-message" style={{ color: 'green' }}>
              {loginMessage}
            </div>
          )}

          <button onClick={handleForgotPassword} className="forgot-password-button">
            Forgot Password
          </button>
        </div>
      )}

      {!isLoggedIn && (
        <div className="login-form-container">
          <form onSubmit={handleAdminLogin}>
            <label>Admin Department:</label>
            <select ref={adminDepartmentRef} defaultValue="">
              <option value="" disabled>Select Department</option>
              <option value="User Department">User Department</option>
              <option value="Certificate Department">Certificate Department</option>
            </select>

            <label>Password:</label>
            <input type="password" ref={adminPasswordRef} />

            <button type="submit" className="button" disabled={adminLoading}>
              <div className="button-content">
                {adminLoading && <div className="spinner"></div>}
                {!adminLoading && 'Login as Admin'}
              </div>
            </button>
          </form>

          {adminLoginMessage && (
            <div className="admin-login-message" style={{ color: 'green' }}>
              {adminLoginMessage}
            </div>
          )}
        </div>
      )}


    </div>
  );
};

export default LoginPage;
