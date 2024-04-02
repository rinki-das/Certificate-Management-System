import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FindStudent = () => {
  const [instituteOptions, setInstituteOptions] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [courseOptions, setCourseOptions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseYear, setCourseYear] = useState('');
  const [courseMonth, setCourseMonth] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  const cyr = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  useEffect(() => {
    fetchInstituteOptions();
  }, []);

  const fetchInstituteOptions = async () => {
    try {
      const response = await axios.get('/getInstituteNames');
      setInstituteOptions(response.data.instituteNames);
    } catch (error) {
      console.error('Error fetching institute options:', error);
    }
  };

  const fetchCourseOptions = async (selectedValue) => {
    try {
      const mobcode = selectedValue.split(' - ')[1];
      const response = await axios.get(`/getCourseOptions?mobcode=${mobcode}`);
      setCourseOptions(response.data.courseOptions);
    } catch (error) {
      console.error('Error fetching course options:', error);
    }
  };

  const handleInstituteChange = async (selectedValue) => {
    setSelectedInstitute(selectedValue);
    fetchCourseOptions(selectedValue);
  };

  const handleCourseChange = (selectedValue) => {
    setSelectedCourse(selectedValue);
  };

  const handleYearChange = (e) => {
    setCourseYear(e.target.value);
  };

  const handleMonthChange = (e) => {
    setCourseMonth(e.target.value);
  };

  const handleviewData = async () => {
    try {
      const mobcode = selectedInstitute.split(' - ')[1];
      const distCode = mobcode.substring(0, 2);
      const courseCode = mobcode.substring(2, 5);

      const searchParams = {
        mobcode,
        distCode,
        courseCode,
        courseYear,
        courseMonth,
      };

      const studentDetailsResponse = await fetchStudentDetails(searchParams);

      if (studentDetailsResponse.success) {
        setStudentDetails(studentDetailsResponse.studentDetails);
      } else {
        toast.error('Student data not found for the selected criteria');
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const fetchStudentDetails = async (searchParams) => {
    try {
      const response = await axios.post('/checkStudent', searchParams);
      return response.data;
    } catch (error) {
      console.error('Error fetching student details:', error);
      return { success: false };
    }
  };

  return (
    <div>
      <div className="image-container">
        <img
          src="http://localhost:3000/images/new.png"
          alt="Image Description"
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
      <div className="form-container">
        <h2>Search Student Batch Details</h2>
        <label htmlFor="instituteSelect">Select Institute:</label>
        <select
          id="instituteSelect"
          onChange={(e) => handleInstituteChange(e.target.value)}
          value={selectedInstitute}
        >
          <option value="">Select an institute</option>
          {instituteOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <div>
          <label htmlFor="courseSelect">Select Course:</label>
          <select
            id="courseSelect"
            onChange={(e) => handleCourseChange(e.target.value)}
            value={selectedCourse}
          >
            <option value="">Select a course</option>
            {courseOptions.map((course) => (
              <option key={course.courseCode} value={`${course.courseName} - ${course.courseCode}`}>
                {`${course.courseName} - ${course.courseCode}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="courseYear">Select Course Year:</label>
          <input
            type="number"
            id="courseYear"
            value={courseYear}
            onChange={handleYearChange}
            placeholder="e.g., 2024"
          />
        </div>

        <div>
          <label htmlFor="coursemonth">Select Course Month:</label>
          <select
            id="coursemonth"
            onChange={handleMonthChange}
            value={courseMonth}
          >
            <option value="" disabled>Select Your Course Month</option>
            {months.map((month, index) => (
              <option key={cyr[index]} value={cyr[index]}>
                {`${month} - ${cyr[index]}`}
              </option>
            ))}
          </select>
        </div>

        <br />
        <br />
        <div className="mb-3">
          <input
            type="submit"
            className="btn btn-success uploadBtn"
            name="submit"
            value="View Student Data"
            onClick={handleviewData}
          />
        </div>
      </div>
      <button className="go-back-button" onClick={() => window.location.href = '/admin'}>
        Go back to dashboard
      </button>
      <ToastContainer />
    </div>
  );
};

export default FindStudent;
