import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import html2pdf from 'html2pdf.js';

const PrintCert = () => {
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

  const fetchStudentDetails = async () => {
    try {
      if (!startDate || !endDate) {
        toast.error('Please enter both start date and end date.');
        return;
      }
  
      const response = await axios.get(`/getStudentDetails?batchCode=${selectedBatchCode}`);
      const studentDetailsFromDB = response.data.studentDetails;
  
      if (studentDetailsFromDB.length === 0) {
        toast.error('No student details found for the selected batch code.');
        return;
      }
  
      const firstStudent = studentDetailsFromDB[0];
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
        marksTheory: student.marks_obtained_theory,
        marksProject: student.marks_obtained_project,
        totalMarks: student.total_marks,
        grade: student.grade,
        percentageMarks: student.percent_of_marks,
        certificateNumber: student.certificate_no,
        // Additional details
        aadhaarNo: student.aadhar, // Use aadhar field for Aadhaar number
        fatherName: student.father_name,
        motherName: student.mother_name,
        // Add any other additional details you want to fetch
      }));
  
      setStudentDetails(simplifiedStudentDetails);
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Error fetching student details. Please try again.');
    }
  };
  
  
  
  const handleFetchData = () => {
    fetchStudentDetails();
  };

  const handlePrintCertificate = async (student) => {
    const monthYear = getFormattedDate(student.startDate);
    const certificateContent = `
    <div style="font-family: Arial, sans-serif; margin-top: 30px;">
    <p style="font-size: 0.5em; margin-right: -50px; margin-bottom: 15px;"><strong>Certificate No:</strong> NIELIT/KOL/EX-CR/CCWD/1111020230701/001</p>
    <h2 style="text-align: center; margin-top: 0; margin-bottom: 5px;">Computer Education Programme</h2>
    <h3 style="text-align: center; margin-top: 0; margin-bottom: 5px;">Certificate</h3>
    <div style="margin-bottom: 20px;">
      <p><strong>Aadhaar No. :</strong> ${student.aadhaarNo}</p>
      <p><strong>Name :</strong> ${student.studentName}</p>
      <p><strong>Father's Name :</strong> ${student.fatherName}</p>
      <p><strong>Mother's Name :</strong> ${student.motherName}</p>
      <p><strong>Institute Name :</strong> ${selectedInstitute}</p>
      <p><strong>Course Start Date :</strong> ${student.startDate}</p>
      <p><strong>Course End Date :</strong> ${student.endDate}</p>
    </div>
  </div>
  
        <p style="text-align: center;">This is to certify that the above-mentioned candidate has successfully passed</p>
        <p style="text-align: center;"><strong>${student.courseName}</strong></p>
        <p style="text-align: center;">____________________________________________________________________________</p>
        <p style="text-align: center;">examination conducted by National Institute of Electronics and Information Technology (NIELIT), Kolkata during <strong>${monthYear}</strong> and secured Grade "${student.grade}".</p>
        <div style="margin-top: 50px;">
          <div style="display: flex; justify-content: space-between;">
            <div style="text-align: center;">
              <p>${certificateSignatory}</p>
              <p>${certificateSignatoryDesignation}</p>
              <p>${certificateSignatoryInstitute}</p>
            </div>
            <div style="text-align: center;">
              <p>${certificateSecondSignatory}</p>
              <p>${certificateSecondSignatoryDesignation}</p>
              <p>${certificateSecondSignatoryInstitute}</p>
            </div>
          </div>
        </div>
        <div style="margin-top: 50px;">
          <p style="text-align: center;">Date of Issue: ${getCurrentDate()}</p>
          <p style="text-align: center;">Place of Issue: ${certificatePlace}</p>
        </div>
        <p style="text-align: center;"><strong>Grade A+ : 90% & Above     Grade B+ : </strong>70% to 79%      <strong> Grade C+ : </strong>50% to 59%</p>
        <p style="text-align: center;"><strong>Grade A : </strong>80% to 89%      <strong> Grade B : </strong>60% to 69%      <strong> Grade C : </strong>40% to 49%      <strong> Less than 40% : </strong>Fail</p>
      </div>
    `;
  
    const opt = {
      margin: 1,
      filename: 'certificate.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
  
    html2pdf().from(certificateContent).set(opt).save();
  };
  
  const getCurrentDate = () => {
    const date = new Date();
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  
  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  const certificateSignatory = 'Rashmi Mandal Vijayvergiya';
  const certificateSignatoryDesignation = 'Project Co-ordinator';
  const certificateSignatoryInstitute = 'NIELIT Kolkata';
  const certificateSecondSignatory = 'V. Krishnamurthy';
  const certificateSecondSignatoryDesignation = 'Executive Director';
  const certificateSecondSignatoryInstitute = 'NIELIT Kolkata';
  const certificatePlace = 'Kolkata';
  
  
  return (
    <div>
      <div className="image-container">
        <img src="http://localhost:3000/images/new.png" alt="Image Description" style={{ width: '100%', height: 'auto' }} />
      </div>
      <div className="form-container">
        <h2>Print Certificates</h2>
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
          {batchCodes.length === 1 && batchCodes[0] === 'No batch code found. Create new batch code' && (
            <p className="no-batch-code-message">No batch codes found. Create a new batch code.</p>
          )}
        </div>

        <button type="button" onClick={handleFetchData} disabled={!selectedBatchCode || fetchingData}>
          {fetchingData ? <div className="loading-spinner">Loading...</div> : 'Fetch Student Data'}
        </button>
      </div>

      <div className="student-details-container">
        {studentDetails.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Registration No</th>
                <th>Student Name</th>
                <th>Theory Marks</th>
                <th>Project Marks</th>
                <th>Total Marks</th>
                <th>Grade</th>
                <th>Percentage Marks</th>
                <th>Certificate Number</th>
                <th>Print Certificate</th>
              </tr>
            </thead>
            <tbody>
              {studentDetails.map((student, index) => (
                <tr key={index}>
                  <td>{student.courseName}</td>
                  <td>{student.startDate}</td>
                  <td>{student.endDate}</td>
                  <td>{student.regNo}</td>
                  <td>{student.studentName}</td>
                  <td>{student.marksTheory}</td>
                  <td>{student.marksProject}</td>
                  <td>{student.totalMarks}</td>
                  <td>{student.grade}</td>
                  <td>{student.percentageMarks}</td>
                  <td>{student.certificateNumber}</td>
                  <td>
  <button onClick={() => handlePrintCertificate(student)}>Print Certificate</button>
</td>

                </tr>
              ))}
            </tbody>
          </table>
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

export default PrintCert;
