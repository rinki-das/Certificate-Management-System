import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify'; // Add this import
import 'react-toastify/dist/ReactToastify.css';
import TablePrint from './tableprint'; // Adjust the path as needed

const CertTable = () => {
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
  const [studentDetails, setStudentDetails] = useState([]);

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
        setBatchCodes(['No batch code found. Create new batch code']);
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
    fetchBatchCodes(selectedInstitute, selectedValue, selectedCourse);
  };

  const handleCourseChange = async (selectedValue) => {
    try {
      const [courseName, courseCode] = selectedValue.split(' - ');

      setSelectedCourse(selectedValue);

      await fetchBatchCodes(selectedInstitute, selectedDistrict, selectedValue);
    } catch (error) {
      console.error('Error handling course change:', error);
    }
  };

  const handleBatchCodeChange = (selectedValue) => {
    setSelectedBatchCode(selectedValue);
  };

  const handleFetchData = async () => {
    try {
      if (!startDate || !endDate || !selectedBatchCode) {
        toast.error('Please fill in all the required fields.');
        return;
      }
  
      const response = await axios.get(`/getStudentDetails?batchCode=${selectedBatchCode}`);
      const studentDetailsFromDB = response.data.studentDetails;
  
      let updatedStudentDetails;
  
      if (studentDetailsFromDB.length === 0) {
        toast.error('No student details found for the selected batch code. Add new certificate numbers.');
        updatedStudentDetails = [];
      } else {
        updatedStudentDetails = studentDetailsFromDB.map((student) => ({
          courseName: student.courseName,
          startDate: student.startDate,
          endDate: student.endDate,
          regNo: student.reg_no,
          studentName: student.student_name,
          marksTheory: student.marks_obtained_theory,
          marksProject: student.marks_obtained_project,
          totalMarks: student.marks_obtained_theory,
          marksProject: student.marks_obtained_project,
          totalMarks: student.total_marks,
          grade: student.grade,
          percentageMarks: student.percent_of_marks,
          certificateNumber: student.certificate_no || '', // Use certificate_no if present, otherwise an empty string
          isNew: false, // Existing entries are not new
        }));
      }
  
      // Set student details only if there are details to show
      setStudentDetails(updatedStudentDetails);
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Error fetching student details. Please try again.');
    }
  };

  return (
    <div>
      <div className="image-container">
        <img src="http://localhost:3000/images/new.png" alt="Image Description" style={{ width: '100%', height: 'auto' }} />
      </div>
      <div className="form-container">
        <h2>Add Certificate Numbers</h2>
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

        <div
        >
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
          {batchCodes.length === 1 && batchCodes[0] === 'No batch code found. Create new batch code' && (
            <p className="no-batch-code-message">No batch codes found. Create a new batch code.</p>
          )}
        </div>

        <button type="button" onClick={handleFetchData} disabled={!selectedBatchCode}>
          Fetch Student Data
        </button>
      </div>
      <div className="student-details-container">
        {studentDetails.length > 0 && (
          <TablePrint
            studentDetails={studentDetails}
            onSave={(updatedStudentDetails) => setStudentDetails(updatedStudentDetails)}
            onSendNotification={() => console.log('Send notification')}
          />
        )}
      </div>

      {/* ToastContainer for displaying messages */}
      <ToastContainer />

      <div className="go-back-button-container">
        <button className="go-back-button" onClick={() => (window.location.href = '/admin')}>
          Go back to dashboard
        </button>
      </div>
    </div>
  );
};

export default CertTable;

