import React from 'react';

const Certificate = ({ student, instituteName }) => {
  return (
    <div style={{ fontFamily: 'Arial', textAlign: 'center' }}>
      <h1>Computer Education Programme</h1>
      <h2>Certificate</h2>
      <p style={{ textAlign: 'center' }}>
        Aadhaar No.: {student.aadhaarNo}<br />
        Name: {student.studentName}<br />
        Father's Name: {student.fatherName}<br />
        Mother's Name: {student.motherName}<br />
        Institute Name: {instituteName}<br />
        Course Start Date: {student.startDate}<br />
        Course End Date: {student.endDate}<br />
      </p>
      <p>
        This is to certify that the above-mentioned candidate has successfully passed
        <br />
        (Selected Course Name)
        <br />
        examination conducted by National Institute of Electronics and Information Technology (NIELIT), Kolkata during {student.startDate} and secured Grade "{student.grade}".
      </p>
      <hr />
      <p style={{ fontStyle: 'italic' }}>
        Signed,
        <br />
        Rashmi Mandal Vijayvergiya<br />
        Project Co-ordinator<br />
        V. Krishnamurthy<br />
        Executive Director<br />
      </p>
      <p>
        Date of Issue: {new Date().toLocaleDateString()}<br />
        Place of Issue: Kolkata<br />
      </p>
      <p>
        Grading Criteria:<br />
        Grade A+: 90% & Above<br />
        Grade B+: 70% to 79%<br />
        Grade C+: 50% to 59%<br />
        Grade A: 80% to 89%<br />
        Grade B: 60% to 69%<br />
        Grade C: 40% to 49%<br />
        Less than 40%: Fail<br />
      </p>
    </div>
  );
};

export default Certificate;
