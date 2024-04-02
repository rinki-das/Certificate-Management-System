import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DisplayStudent = () => {
  const { batchCode,courseName, courseCode } = useParams();
  const [studentData, setStudentData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('/getStudentDetails', {
          batchCode,
          courseName,
          courseCode
        });

        setStudentData(response.data); // Assuming your API returns an array of student data
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };

    fetchData();
  }, [batchCode, courseName, courseCode]);

  return (
    <div>
      <header>
        <br />
        <br />
        <h2 className="display-3 text-center" style={{ margin: '5rem auto' }}>
          Uploaded Excel Date Sheet Information for Batch no - <b>{batchCode}</b>
        </h2>

        {courseName && courseCode && (
          <h2 className="display-5 text-center" style={{ margin: '5rem auto' }}>
            Course Name with course ID - <b>{courseName} - {courseCode}</b>
          </h2>
        )}
      </header>

      <div>
        {/* Display student information, details, etc. */}
        <ul>
          {studentData.map((student) => (
            <li key={student.id}>{/* Display student details here */}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DisplayStudent;
