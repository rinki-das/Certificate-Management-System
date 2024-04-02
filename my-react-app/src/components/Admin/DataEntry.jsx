import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BatchCode.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const BatchCodeForm = () => {
  const [instituteOptions, setInstituteOptions] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [districtOptions, setDistrictOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [batchCodes, setBatchCodes] = useState([]);
  const [selectedBatchCode, setSelectedBatchCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sequenceNumbers, setSequenceNumbers] = useState([]);
  const [file, setFile] = useState({});
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [examDate, setExamDate] = useState('');

  useEffect(() => {
    fetchInstituteOptions();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

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

    // Fetch batch codes based on selected values
    fetchBatchCodes(selectedInstitute, selectedValue, selectedCourse);
  };

  const handleCourseChange = async (selectedValue) => {
    try {
      // Extract course name and code from the selectedValue
      const [courseName, courseCode] = selectedValue.split(' - ');

      // Set the state variables with the extracted values
      setCourseName(courseName);
      setCourseCode(courseCode);
      setSelectedCourse(selectedValue);

      // Fetch batch codes based on selected values
      await fetchBatchCodes(selectedInstitute, selectedDistrict, selectedValue);
    } catch (error) {
      console.error('Error handling course change:', error);
    }
  };

  const handleBatchCodeChange = (selectedValue) => {
    setSelectedBatchCode(selectedValue);

    if (!selectedValue.includes('No batch code found')) {
      // Fetch sequence numbers only if a valid batch code is selected
      fetchSequenceNumbers(selectedValue);
    }
  };

  const fetchSequenceNumbers = async (selectedBatchCode) => {
    try {
      // Placeholder for fetching sequence numbers based on batch code
      // Adjust the endpoint and data accordingly
      const response = await axios.post('/checkStudent', {
        batchCode: selectedBatchCode,
      });

      // Assuming response.data.sequenceNumbers contains an array of sequence numbers
      const fetchedSequenceNumbers = response.data.sequenceNumbers;
      setSequenceNumbers(fetchedSequenceNumbers);
    } catch (error) {
      console.error('Error fetching sequence numbers:', error);
      toast.error('Error fetching sequence numbers. Please try again.');
    }
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
  };

  const handleSubmit = async () => {
    try {
      // Validate that start and end dates are selected
      if (!startDate || !endDate) {
        toast.error('Please select both start and end dates.');
        return;
      }

      // Check if a file is selected
      if (!file) {
        toast.error('Please select a file.');
        return;
      }

      setSubmitting(true);

      // Parse course_code from the selected course
      const selectedCourseParts = selectedCourse.split(' - ');
      const course_code = selectedCourseParts[selectedCourseParts.length - 1];

      const formData = new FormData();
      formData.append('excelFile', file);
      formData.append('mobcode', selectedInstitute.split(' - ')[1]);
      formData.append('dist_code', selectedDistrict.split(' - ')[1]);
      formData.append('batchcode', selectedBatchCode);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('course_code', course_code); // Add course_code to form data
      formData.append('courseName', courseName); // Add courseName to form data

      // Send data to the student_details collection
      const response = await axios.post('/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Display success toast message with the selected batch code
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error storing data:', error);
      toast.error('Error storing data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

 
  

  const handleGenerateReport = async () => {
    try {
      // Fetch student details based on selected batch code
      const response = await axios.get(`/getStudentDetails?batchCode=${selectedBatchCode}`);
      const studentDetails = response.data.studentDetails;
  
      // Create a new jsPDF instance with landscape orientation and A4 format
      const pdf = new jsPDF({ orientation: 'landscape', format: 'a4' });
  
      // Add logos, title, and subtitle
      const logosWidth = 30;
      const logosHeight = 30;
      const logosX = 10;
      const logosY = 15;
      pdf.addImage(
        'https://pbs.twimg.com/profile_images/882321654499516416/TbHUUffy_400x400.jpg',
        'JPEG',
        logosX,
        logosY,
        logosWidth,
        logosHeight
      );
      const title = 'National Institute Of Electronics & Information Technology (NIELIT) Kolkata';
      const titleX = logosX + logosWidth + 10;
      const titleY = logosY + 5; // Adjust the vertical position based on your layout
  
      // Use a smaller font size for the title
      pdf.setFontSize(12);
      pdf.text(title, titleX, titleY);
  
      const subTitle = `JU Campus, Kolkata-700032\nCourse: ${courseName}                    Start Date: ${startDate}\nEnd Date: ${endDate}                    Course Code: ${courseCode}                Exam Date: ${examDate}`;
      const subTitleX = titleX;
      const subTitleY = titleY + 10;
  
      // Set up the table headers including 'Sl No.'
      const headers = [
        'Sl No.',
        'Course Name',
        'Start Date',
        'End Date',
        'Registration No',
        'Student Name',
        'Marks Obtained (Theory) (40)',
        'Marks Obtained (Project) (10)',
        '% of Marks',
        'Total Marks',
        'Grade',
      ];
  
      // Extract data from studentDetails and format it into an array of arrays
      const data = studentDetails.map((student, index) => [
        index + 1, // Sl No.
        student.courseName,
        student.startDate,
        student.endDate,
        student.reg_no,
        student.student_name,
        student.marks_obtained_theory,
        student.marks_obtained_project,
        student.percent_of_marks,
        student.total_marks,
        student.grade,
      ]);
  
      // Define a function to add a new page when the table content exceeds a certain height
      const addPageIfNeeded = () => {
        const maxHeight = 780; // Adjust this value based on your layout
        if (pdf.lastAutoTable.finalY > maxHeight) {
          pdf.addPage();
          pdf.text('Continued from previous page...', 10, 10);
          return true;
        }
        return false;
      };
  
      // AutoTable is a plugin for jsPDF that simplifies table creation
      pdf.autoTable({
        startY: 50, // Start the table at a suitable Y position
        head: [headers],
        body: data,
        didDrawPage: addPageIfNeeded, // Check if a new page is needed after drawing each page
      });
  

  
      // Use a smaller font size for the subtitle
      pdf.setFontSize(10);
      pdf.text(subTitle, subTitleX, subTitleY);
  
      // Count the number of times "Absent" appears in "Marks Obtained (Project) (10)"
      const totalStudentsAbsent = data.filter(item => item[7] === 'Absent').length;
      const totalStudentsDiscontinued = data.filter(item => item[6] === '' && item[7] === '').length;
      const totalStudentsFailed = data.filter(
        item => item[7] === 'Failed' || (parseInt(item[6]) < 15 && parseInt(item[7]) < 5)
      ).length;
  
      // Calculate the "Present" value based on total and absent students
      const totalStudentsPresent = data.length - totalStudentsAbsent;
  
      // Add the totals section below the table and line
      pdf.text(
        `Total: ${data.length}              Present: ${totalStudentsPresent}              Absent: ${totalStudentsAbsent}              Fail: ${totalStudentsFailed}              Discontinued: ${totalStudentsDiscontinued}`,
        10,
        pdf.autoTable.previous.finalY + 10
      );
  
      // Add one more text line
      pdf.text('Grade: A+ (90% & above)  A (80%-89%)  B+ (70%-79%) B (60%-69%)  C+ (50%-59%)  C (40%-49%)  Fail (Less than 40%)', 10, pdf.autoTable.previous.finalY + 15);
      pdf.text('Prepared by                      Checked & verified by Course Coordinator                      Exam Dept. Verification                       Executive Director', 10, pdf.autoTable.previous.finalY + 40);
  
      // Save the PDF or open it in a new window
      pdf.save(`report_${selectedBatchCode}.pdf`);
  
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report. Please try again.');
    }
  };
  // Function to handle exam date change
const handleExamDateChange = (value) => {
  setExamDate(value);
};
  
  return (
    <div>
      <div className="image-container">
        <img src="http://localhost:3000/images/new.png" alt="Image Description" style={{ width: '100%', height: 'auto' }} />
      </div>
      <div className="form-container">
        <h2>Upload Excel File</h2>
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
          <input type="date" id="startDate" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)} />
        </div>

        <div>
          <label htmlFor="endDate">Course End Date:</label>
          <input type="date" id="endDate" value={endDate} onChange={(e) => handleEndDateChange(e.target.value)} />
        </div>

        
<div>
  <label htmlFor="examDate">Exam Date:</label>
  <input type="date" id="examDate" value={examDate} onChange={(e) => handleExamDateChange(e.target.value)} />
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

        <div>
          <label>
            Import Excel File:
            <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
          </label>

          {/* Disable the "Submit" button if a valid batch code is not selected */}
          <button type="button" onClick={handleSubmit} disabled={!selectedBatchCode || submitting}>
            {submitting ? <div className="loading-spinner">Loading...</div> : 'Submit'}
          </button>

         
      <button type="button" onClick={handleGenerateReport}>
        Generate Report
      </button>
        </div>

        {/* ToastContainer for displaying messages */}
        <ToastContainer />
      </div>

      


      <button className="go-back-button" onClick={() => (window.location.href = '/admin')}>
        Go back to dashboard
      </button>
    </div>
  );
};

export default BatchCodeForm;
