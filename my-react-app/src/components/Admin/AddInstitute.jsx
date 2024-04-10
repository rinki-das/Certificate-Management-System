import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddInstitute.css';

const InstituteForm = () => {
  const [districts, setDistricts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    instituteCode: '', 
    ownerName: '',
    organisationName: '',
    mobileNumber: '',
    altMobileNumber: '',
    email: '',
    address: '',
    postOffice: '',
    policeStation: '',
    district: '',
    distCode: '',
    pinCode: '',
    selectedCourses: [], // Store selected courses as an array
  });

  const [districtList, setDistrictList] = useState([]);
  const [lastMobcode, setLastMobcode] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'instituteCode' || name === 'mobileNumber' || name === 'altMobileNumber' || name === 'pinCode') {
      newValue = newValue.replace(/\D/g, '');
    }

     // For the district dropdown
     if (e.target.name === 'district') {
      const [districtName, distCode] = value.split(' - ');
      setFormData({
        ...formData,
        district: districtName,
        distCode: distCode,
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: value,
      });
    }
  };

  const handleCourseSelect = (e) => {
    const { value } = e.target;

    if (formData.selectedCourses.includes(value)) {
      // If the course is already selected, do nothing
      return;
    }

    const selectedCourse = courses.find(course => course.course_code === value);

    if (selectedCourse) {
      setFormData(prevState => ({
        ...prevState,
        selectedCourses: [...prevState.selectedCourses, selectedCourse.course_code],
      }));
    }
  };

  const handleRemoveCourse = (courseCode) => {
    setFormData(prevState => ({
      ...prevState,
      selectedCourses: prevState.selectedCourses.filter(code => code !== courseCode),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
     // Check if any required fields are empty
  if (Object.values(formData).some((value) => value === '' && value !== formData.altMobileNumber)) {
    alert('Please fill in all required fields before submitting.');
    return;
  }
  
    try {
      // Add institute details
      const instituteResponse = await axios.post('http://localhost:3000/addInstitute', formData);
      alert('Institute details added successfully!');
  
      // Reset the form data
      setFormData({
        ...formData,
        instituteCode: lastMobcode + 1,
        selectedCourses: [], // Reset selected courses
      });
    } catch (error) {
      console.error('Error adding institute details:', error);
      alert('Failed to add institute details. Please try again.');
    }
  };
  
  useEffect(() => {
    const fetchLastMobcode = async () => {
      try {
        const response = await axios.get('http://localhost:3000/lastMobcode');
        setLastMobcode(response.data);
        setFormData(prevFormData => ({
          ...prevFormData,
          instituteCode: response.data + 1,
        }));
      } catch (error) {
        console.error('Error fetching last mobcode:', error);
      }
    };

    fetchLastMobcode();
  }, []);
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/distinfo');
        setDistrictList(response.data);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };

    fetchDistricts();
  }, []);

  useEffect(() => {
    const formattedDistricts = districtList.map((district) => ({
      label: `${district.district_name} - ${district.dist_code}`,
      value: district.dist_code,
    }));
    setDistricts(formattedDistricts);
  }, [districtList, setDistricts]);

  return (
    <div>
      <div className="image-container">
        <img src="http://localhost:3000/images/new.png" alt="Image Description" style={{ width: '100%', height: 'auto' }} />
      </div>
      <div className="institute-form-container">
        <form onSubmit={handleSubmit} className="institute-form">
          <h2>Add Institute</h2>

          <div className="form-group">
            <div className="input-box">
              <label htmlFor="instituteCode">Institute Code</label>
              <input
                type="text"
                id="instituteCode"
                name="instituteCode"
                value={formData.instituteCode}
                readOnly
              />
            </div>

            <div className="input-box">
              <label htmlFor="ownerName">Owner Name</label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-box">
              <label htmlFor="organisationName">Organisation Name</label>
              <input
                type="text"
                id="organisationName"
                name="organisationName"
                value={formData.organisationName}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">
              <label htmlFor="mobileNumber">Mobile Number</label>
              <input
                type="text"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-box">
              <label htmlFor="altMobileNumber">Alternative Mobile Number</label>
              <input
                type="text"
                id="altMobileNumber"
                name="altMobileNumber"
                value={formData.altMobileNumber}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="column">
            <div className="input-box">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">
              <label htmlFor="postOffice">Post Office</label>
              <input
                type="text"
                id="postOffice"
                name="postOffice"
                value={formData.postOffice}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-box">
            <label htmlFor="policeStation">Police Station</label>
            <input
              type="text"
              id="policeStation"
              name="policeStation"
              value={formData.policeStation}
              onChange={handleChange}
            />
          </div>

          <div className="input-box">
            <label htmlFor="district">Select District:</label>
            <select
              id="district"
              name="district"
              onChange={(e) => handleChange(e)}
              value={`${formData.district} - ${formData.distCode}`}
            >
              <option value="">Select District</option>
              {districtList.map((district) => (
                <option
                  key={district.dist_code}
                  value={`${district.district_name} - ${district.dist_code}`}
                >
                  {district.district_name} - {district.dist_code}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div className="input-box">
              <label htmlFor="pinCode">Pin code</label>
              <input
                type="text"
                id="pinCode"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-box">
              <label htmlFor="selectedCourse">Select Course:</label>
              <select
                id="selectedCourse"
                name="selectedCourse"
                onChange={handleCourseSelect}
                value={''} // Reset the value to prevent pre-selection
                multiple
              >
                {courses.map(course => (
                  <option key={course.course_code} value={course.course_code}>
                    {`${course.course_name} - ${course.course_code}`}
                  </option>
                ))}
              </select>
            </div>
          </div>


<div>
  <h4>Selected Courses:</h4>
  <ul className="selected-courses">
    {[...formData.selectedCourses].map(courseCode => {
      const selectedCourse = courses.find(course => course.course_code === courseCode);
      return (
        <li key={courseCode}>
          <span>{`${selectedCourse.course_name} - ${selectedCourse.course_code}`}</span>
          <button onClick={() => handleRemoveCourse(courseCode)}>X</button>
        </li>
      );
    })}
  </ul>
</div>

          <button type="submit">Add Institute</button>
        </form>
      </div>
    </div>
  );
};

export default InstituteForm;
