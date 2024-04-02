import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StudentTable from './StudentTable';

const UserForm = () => {
  const [instituteOptions, setInstituteOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [batchCodes, setBatchCodes] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBatchCode, setSelectedBatchCode] = useState('');
  const [fetchingData, setFetchingData] = useState(false);
  const [studentDetails, setStudentDetails] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  
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

  const handleInstituteChange = async (selectedValue) => {
    try {
      setSelectedInstitute(selectedValue);

      const responseDistrict = await axios.get(`/getDistrictOptions?user=${selectedValue}`);
      setDistrictOptions(responseDistrict.data.districtOptions);

      const mobcode = selectedValue.split(' - ')[1];
      const responseCourse = await axios.get(`/getCourseOptions?mobcode=${mobcode}`);
      setCourseOptions(responseCourse.data.courseOptions);

      // Fetch batch codes based on selected values
      await fetchBatchCodes(selectedValue, selectedDistrict, selectedCourse);
    } catch (error) {
      console.error('Error handling institute change:', error);
    }
  };

  const fetchBatchCodes = async (selectedInstitute, selectedDistrict, selectedCourse) => {
    try {
      const mobcode = selectedInstitute.split(' - ')[1];
      const dist_code = selectedDistrict.split(' - ')[1];
      const course_code = selectedCourse.split(' - ')[1];

      const prefix = mobcode + dist_code + course_code;

      const response = await axios.get(`/getBatchCodes?prefix=${prefix}`);
      const fetchedBatchCodes = response.data.batchCodes;

      if (fetchedBatchCodes.length === 0) {
        setBatchCodes(['No batch code found. Create a new batch code']);
        setSelectedBatchCode('');
      } else {
        const sortedBatchCodes = fetchedBatchCodes.sort((a, b) =>
          parseInt(a.batchcode.slice(-2)) - parseInt(b.batchcode.slice(-2))
        );
        setBatchCodes(sortedBatchCodes.map((code) => code.batchcode));
      }
    } catch (error) {
      console.error('Error fetching batch codes:', error);
      toast.error('Error fetching batch codes. Please try again.');
    }
  };

  const handleDistrictChange = (selectedValue) => {
    setSelectedDistrict(selectedValue);

    // Fetch batch codes based on selected values
    fetchBatchCodes(selectedInstitute, selectedValue, selectedCourse);
  };

  const handleCourseChange = async (selectedValue) => {
    try {
      // Extract course name and code from the selectedValue
      const [courseName, courseCode] = selectedValue.split(' - ');

      // Set the state variables with the extracted values
      setSelectedCourse(selectedValue);

      // Fetch batch codes based on selected values
      await fetchBatchCodes(selectedInstitute, selectedDistrict, selectedValue);
    } catch (error) {
      console.error('Error handling course change:', error);
    }
  };

  const handleBatchCodeChange = (selectedValue) => {
    setSelectedBatchCode(selectedValue);
  };

  const fetchStudentDetails = async () => {
    try {
      // Check if start date and end date are provided
      if (!startDate || !endDate) {
        toast.error('Please enter both start date and end date.');
        return;
      }

      const response = await axios.get(`/getStudentDetails?batchCode=${selectedBatchCode}`);
      const studentDetailsFromDB = response.data.studentDetails;

      // Check if the batch code exists
      if (studentDetailsFromDB.length === 0) {
        toast.error('No student details found for the selected batch code.');
        return;
      }

      // Check if the entered start date and end date match with the stored values
      const firstStudent = studentDetailsFromDB[0]; // Assuming details for the first student are representative
      if (startDate !== firstStudent.startDate || endDate !== firstStudent.endDate) {
        toast.error('Entered start date or end date does not match with the stored values.');
        return;
      }

      const simplifiedStudentDetails = studentDetailsFromDB.map((student) => ({
        courseName: student.courseName,
        startDate: student.startDate,
        endDate: student.endDate,
        regNo: student.reg_no,
        studentName: student.student_name,
        marksTheory: String(student.marks_obtained_theory),
        marksProject: String(student.marks_obtained_project),
        totalMarks: String(student.total_marks),
        grade: student.grade,
        percentageMarks: String(student.percent_of_marks),
        isEditing: false,
      }));

      // Set the state and indicate that data has been fetched
      setStudentDetails(simplifiedStudentDetails);
      setIsFetched(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Error fetching student details. Please try again.');
    }
  };

  const handleFetchData = async () => {
    setFetchingData(true);
    await fetchStudentDetails();
    setFetchingData(false);
  };

 
  const handleEdit = (row, editedName) => {
    try {
      const updatedStudentDetails = [...studentDetails];
      const studentToUpdate = updatedStudentDetails[row.index];
  
      if (studentToUpdate) {
        studentToUpdate.studentName = editedName; // Update the student name
        setStudentDetails(updatedStudentDetails);
        setEditingIndex(-1); // Reset editing index after editing
      } else {
        console.error(`Student at index ${row.index} not found.`);
      }
    } catch (error) {
      console.error('Error handling edit:', error);
    }
  };
  

  const handleSave = async (index) => {
    try {
      const updatedStudentDetails = [...studentDetails];
      updatedStudentDetails[index].isEditing = false;
      setStudentDetails(updatedStudentDetails);

      const {
        regNo,
        studentName,
        marksTheory,
        marksProject,
        totalMarks,
        grade,
        percentageMarks,
      } = updatedStudentDetails[index];

      // Call the server endpoint to update the student details in the database
      const response = await axios.post('/updateStudentDetails', {
        regNo,
        studentName,
        marksTheory,
        marksProject,
        totalMarks,
        grade,
        percentageMarks,
        /* add other fields as needed */
      });

      if (response.data.success) {
        // Show success toast
        toast.success('Student details updated successfully!');
        setEditingIndex(null); // Reset editing index after saving
      } else {
        // Show error toast
        toast.error('Failed to update student details. Please try again.');
      }
    } catch (error) {
      // Handle the error
      console.error('Error saving student details:', error);
      toast.error('Error saving student details. Please try again.');
    }
  };

  const handleSendNotification = async () => {
    try {
      if (!selectedBatchCode || !startDate || !endDate) {
        toast.error('Please select a batch code and enter start and end dates.');
        return;
      }

      const response = await axios.post('/sendNotification', {
        batchCode: selectedBatchCode,
        courseName: selectedCourse.split(' - ')[0],
        startDate,
        endDate,
      });

      if (response.data.success) {
        toast.success('Notification sent successfully!');
      } else {
        toast.error('Failed to send notification. Please try again.');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Error sending notification. Please try again.');
    }
  };

  return (
    <div>
      <div className="image-container">
        <img src="http://localhost:3000/images/new.png" alt="Image Description" style={{ width: '100%', height: 'auto' }} />
      </div>
      <div className="form-container">
        <h2>Edit & Notify</h2>
        <label htmlFor="instituteSelect">Select Institute:</label>
        <select id="instituteSelect" onChange={(e) => handleInstituteChange(e.target.value)} value={selectedInstitute}>
          <option value="">Select an institute</option>
          {instituteOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <div>
          <label htmlFor="districtSelect">Select District:</label>
          <select id="districtSelect" onChange={(e) => handleDistrictChange(e.target.value)} value={selectedDistrict}>
            <option value="">Select a district</option>
            {districtOptions.map((district) => (
              <option key={district.distCode} value={`${district.distName} - ${district.distCode}`}>
                {`${district.distName} - ${district.distCode}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="courseSelect">Select Course:</label>
          <select id="courseSelect" onChange={(e) => handleCourseChange(e.target.value)} value={selectedCourse}>
            <option value="">Select a course</option>
            {courseOptions.map((course) => (
              <option key={course.courseCode} value={`${course.courseName} - ${course.courseCode}`}>
                {`${course.courseName} - ${course.courseCode}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startDate">Course Start Date:</label>
          <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div>
          <label htmlFor="endDate">Course End Date:</label>
          <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <div>
          <label htmlFor="batchCodeSelect">Select Batch Code:</label>
          <select id="batchCodeSelect" value={selectedBatchCode} onChange={(e) => handleBatchCodeChange(e.target.value)}>
            <option value="">Select a batch code</option>
            {batchCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          {batchCodes.length === 1 && batchCodes[0] === 'No batch code found. Create a new batch code' && (
            <p className="no-batch-code-message">No batch codes found. Create a new batch code.</p>
          )}
        </div>

        <button type="button" onClick={handleFetchData} disabled={!selectedBatchCode || fetchingData}>
          {fetchingData ? <div className="loading-spinner">Loading...</div> : 'Fetch Student Data'}
        </button>
      </div>
      {studentDetails.length > 0 && (
        <div>
          <StudentTable
            studentDetails={studentDetails}
            onEdit={(row, editedName) => {
              handleEdit(row, editedName);
              setEditingIndex(row.index); // Set editing index when clicking on Edit
            }}
            onSave={handleSave}
            editingIndex={editingIndex}
            onSendNotification={handleSendNotification}
          />
        </div>
      )}
      {/* ToastContainer for displaying messages */}
      <ToastContainer />

      <button className="go-back-button" onClick={() => (window.location.href = '/users')}>
        Go back to dashboard
      </button>
    </div>
  );
};

export default UserForm;
