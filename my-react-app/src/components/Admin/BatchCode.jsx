import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BatchCode.css';

const BatchCodeForm = () => {
  const [instituteOptions, setInstituteOptions] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [districtOptions, setDistrictOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [generatedBatchCode, setGeneratedBatchCode] = useState('');

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
    setSelectedInstitute(selectedValue);

    try {
      const response = await axios.get(`/getDistrictOptions?user=${selectedValue}`);
      setDistrictOptions(response.data.districtOptions);
    } catch (error) {
      console.error('Error fetching district options:', error);
    }

    try {
      const mobcode = selectedValue.split(' - ')[1];
      const response = await axios.get(`/getCourseOptions?mobcode=${mobcode}`);
      setCourseOptions(response.data.courseOptions);
    } catch (error) {
      console.error('Error fetching course options:', error);
    }
  };

  const handleDistrictChange = (selectedValue) => {
    setSelectedDistrict(selectedValue);
  };

  const handleCourseChange = (selectedValue) => {
    setSelectedCourse(selectedValue);
  };

  const handleGenerateBatchCode = async () => {
    try {
      const response = await axios.post('/generate-batch-code', {
        mobcode: selectedInstitute.split(' - ')[1],
        distCode: selectedDistrict.split(' - ')[1],
        courseCode: selectedCourse.split(' - ')[1],
      });

      const generatedBatchCode = response.data.batchCode;

      const formData = {
        batchcode: generatedBatchCode,
        course_code: selectedCourse.split(' - ')[1],
        mobcode: selectedInstitute.split(' - ')[1],
        dist_code: selectedDistrict.split(' - ')[1],
        start_date: startDate,
        end_date: endDate,
        regby: 'admin',
        regtime: new Date().toISOString(),
        invoice_no: invoiceNo || 'NA',
        invoice_by: 'jc123',
        invoice_time: new Date().toISOString(),
        payment_amount: paymentAmount || 'NA',
        payment_note: 'Not Given',
        certificate_despatch: 'Not Done',
      };

      await axios.post('/store-batch-data', formData);

      setGeneratedBatchCode(generatedBatchCode);

      toast.success('Batch data stored successfully');
    } catch (error) {
      console.error('Error generating batch code:', error);
      toast.error('Error generating batch code. Please try again.');
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
        <h2>Batch Creation</h2>
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
          <label htmlFor="districtSelect">Select District:</label>
          <select
            id="districtSelect"
            onChange={(e) => handleDistrictChange(e.target.value)}
            value={selectedDistrict}
          >
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
          <label htmlFor="startDate">Course Start Date:</label>
          <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div>
          <label htmlFor="endDate">Course End Date:</label>
          <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <div>
          <label htmlFor="invoiceNo">Invoice No:</label>
          <input type="text" id="invoiceNo" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
        </div>

        <div>
          <label htmlFor="paymentAmount">Payment Amount:</label>
          <input
            type="text"
            id="paymentAmount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
        </div>

        <button
          onClick={handleGenerateBatchCode}
          disabled={!selectedCourse || !selectedInstitute || !selectedDistrict}
        >
          Generate Batch Code
        </button>

        {generatedBatchCode && (
          <div>
            <h3>Generated Batch Code:</h3>
            <p>{generatedBatchCode}</p>
            <p>Details:</p>
            <p>Course Code: {selectedCourse.split(' - ')[1]}</p>
            <p>District Code: {selectedDistrict.split(' - ')[1]}</p>
            <p>Mob Code: {selectedInstitute.split(' - ')[1]}</p>
            <p>Start Date: {startDate}</p>
            <p>End Date: {endDate}</p>
          </div>
        )}

        <ToastContainer />
      </div>
      <button className="go-back-button" onClick={() => (window.location.href = '/admin')}>
        Go back to dashboard
      </button>
    </div>
  );
};

export default BatchCodeForm;
