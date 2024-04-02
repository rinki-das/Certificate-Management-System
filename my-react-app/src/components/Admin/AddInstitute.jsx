import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddInstitute.css';

const InstituteForm = () => {
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    instituteCode: '', // Initialize with an empty string
    ownerName: '',
    organisationName: '',
    mobileNumber: '',
    altMobileNumber: '',
    email: '',
    address: '',
    postOffice: '',
    policeStation: '',
    district: '',
    distCode: '', // Added distCode field
    pinCode: '',
  });

  const [districtList, setDistrictList] = useState([]);
  const [lastMobcode, setLastMobcode] = useState(0);

  const handleChange = (e) => {
    let value = e.target.value;

    if (
      e.target.name === 'instituteCode' ||
      e.target.name === 'mobileNumber' ||
      e.target.name === 'altMobileNumber' ||
      e.target.name === 'pinCode'
    ) {
      value = value.replace(/\D/g, '');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(formData).some((value) => value === '')) {
      alert('Please fill in all fields before submitting.');
      return;
    }

    try {
      await axios.post('http://localhost:3000/addInstitute', formData);
      alert('Institute details added successfully!');
      setFormData({
        ...formData,
        instituteCode: lastMobcode + 1,
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

        <button type="submit" onClick={handleSubmit}>
  Add Institute
</button>

      </form>
    </div>
    </div>
  );
};

export default InstituteForm;
