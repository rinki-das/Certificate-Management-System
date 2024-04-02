import 'jspdf-autotable'; // Add this import statement
import autoTable from 'jspdf-autotable';
import React, { useMemo, useState } from 'react'; 
import PropTypes from 'prop-types';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, Button, Checkbox, FormControlLabel } from '@mui/material'; 
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send'; // Import SendIcon
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';


import clsx from 'clsx';

const StudentTable = ({ studentDetails, onEdit, onSave, editingIndex, onSendNotification }) => {
  const [isChecked, setIsChecked] = useState(false); // State for checkbox

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked); // Toggle checkbox state
  };
  const columns = useMemo(
    () => [
      {
        accessorKey: 'courseName',
        header: 'Course Name',
        size: 150,
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        size: 150,
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        size: 150,
      },
      {
        accessorKey: 'regNo',
        header: 'Registration Number',
        size: 150,
      },
      {
        accessorKey: 'studentName',
        header: 'Student Name',
        size: 150,
        Cell: ({ row }) => {
          const isEditing = editingIndex === row.index;
      
          return isEditing ? (
            <input
              type="text"
              value={row.original.studentName}
              onChange={(e) => onEdit(row, e.target.value)}
              className="edit-input"
            />
          ) : (
            row.original.studentName
          );
        },
      },
      
      {
        accessorKey: 'marksTheory',
        header: 'Marks (Theory)',
        size: 150,
      },
      {
        accessorKey: 'marksProject',
        header: 'Marks (Project)',
        size: 150,
      },
      {
        accessorKey: 'totalMarks',
        header: 'Total Marks',
        size: 150,
      },
      {
        accessorKey: 'grade',
        header: 'Grade',
        size: 150,
      },
      {
        accessorKey: 'percentageMarks',
        header: 'Percentage Marks',
        size: 150,
      },
      {
        accessorKey: 'action',
        header: 'Action',
        size: 150,
        Cell: ({ row }) => {
          const isEditing = editingIndex === row.index;

          return isEditing ? (
            <button onClick={() => onSave(row.index)}>Save</button>
          ) : (
            <button onClick={() => onEdit(row)}>Edit</button>
          );
        },
      },
    ],
    [onEdit, onSave, editingIndex]
  );

  const table = useMaterialReactTable({
    columns,
    data: studentDetails,
  });

  const handleExportRows = () => {
    if (studentDetails.length === 0) {
      toast.error('No data to export.');
      return;
    }

    const courseDetails = {
      courseName: studentDetails[0].courseName,
      startDate: studentDetails[0].startDate,
      endDate: studentDetails[0].endDate,
      courseCode: studentDetails[0].courseCode,
    };

    const doc = new jsPDF({
      orientation: 'landscape', // Set PDF orientation to landscape
    });

    // Add logos, title, and subtitle
    const logosWidth = 30;
    const logosHeight = 30;
    const logosX = 10;
    const logosY = 15;
    doc.addImage(
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
    doc.setFontSize(12);
    doc.text(title, titleX, titleY);
    const subTitle = `JU Campus, Kolkata-700032\nCourse: ${courseDetails.courseName}                    Start Date: ${courseDetails.startDate}\nEnd Date: ${courseDetails.endDate}                    Course Code: ${courseDetails.courseCode}                Exam Date: ${courseDetails.examDate}`;
    const subTitleX = titleX;
    const subTitleY = titleY + 10;
    doc.text(subTitle, subTitleX, subTitleY);

    // Filter out the 'action' column from the export
    const filteredColumns = columns.filter((col) => col.accessorKey !== 'action');
    const tableData = studentDetails.map((row) => filteredColumns.map((col) => row[col.accessorKey]));
    const tableHeaders = filteredColumns.map((col) => col.header);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: subTitleY + 20, // Adjust the startY position based on the subtitle
    });

    // Add a horizontal line below the table
    const lineY = doc.autoTable.previous.finalY + 5;
    doc.setLineWidth(0.10);
    doc.setDrawColor(0);
    doc.line(10, lineY, 280, lineY);

    // Count the number of times "Absent" appears in "Marks Obtained (Project) (10)"
    const totalStudentsAbsent = studentDetails.filter(item => item[7] === 'Absent').length;
    const totalStudentsDiscontinued = studentDetails.filter(item => item[6] === '' && item[7] === '').length;
    const totalStudentsFailed = studentDetails.filter(
      item => item[7] === 'Failed' || (parseInt(item[6]) < 15 && parseInt(item[7]) < 5)
    ).length;

    // Calculate the "Present" value based on total and absent students
    const totalStudentsPresent = studentDetails.length - totalStudentsAbsent;

    // Add the totals section below the table and line
    const totalsY = lineY + 10;
    doc.text(
      `Total: ${studentDetails.length}              Present: ${totalStudentsPresent}              Absent: ${totalStudentsAbsent}              Fail: ${totalStudentsFailed}              Discontinued: ${totalStudentsDiscontinued}`,
      10,
      totalsY
    );

  

    // Add additional content to the PDF
    const additionalContent = `


    Grade: A+ (90% & above)  A (80%-89%)  B+ (70%-79%) B (60%-69%)  C+ (50%-59%)  C (40%-49%)  Fail (Less than 40%)





    Prepared by                      Checked & verified by Course Coordinator                      Exam Dept. Verification                       Executive Director
    `;

    doc.text(additionalContent, 10, doc.autoTable.previous.finalY + 10);

    doc.save('student-details.pdf');
  };

  return (
    <>
      {/* MaterialReactTable component for displaying the table */}
      <MaterialReactTable table={table} showPagination={true} />

      {/* Checkbox for understanding data importance */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          marginTop: '20px',
        }}
      >
        <FormControlLabel
          control={<Checkbox checked={isChecked} onChange={handleCheckboxChange} />}
          label={<span style={{ fontFamily: 'Arial', fontSize: '14px' }}>All the above information are checked and verified for Certification Purpose</span>}
        />
      </Box>

      {/* Buttons for exporting and sending notification */}
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          padding: '8px',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          marginTop: '20px',
        }}
      >
        {/* Button for exporting student details */}
        <Button
          disabled={studentDetails.length === 0}
          onClick={handleExportRows}
          startIcon={<SaveIcon />}
          className={clsx('custom-export-button')}
        >
          Export Student Details
        </Button>

        {/* Button for sending notification, enabled only if checkbox is checked */}
        <Button
          disabled={studentDetails.length === 0 || !isChecked}
          onClick={onSendNotification}
          startIcon={<SendIcon />}
          className={clsx('custom-notification-button')}
        >
          Send Notification
        </Button>
      </Box>
    </>
  );
};

StudentTable.propTypes = {
  studentDetails: PropTypes.arrayOf(
    PropTypes.shape({
      courseName: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      regNo: PropTypes.string.isRequired,
      studentName: PropTypes.string.isRequired,
      marksTheory: PropTypes.string.isRequired,
      marksProject: PropTypes.string.isRequired,
      totalMarks: PropTypes.string.isRequired,
      grade: PropTypes.string.isRequired,
      percentageMarks: PropTypes.string.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  editingIndex: PropTypes.number.isRequired,
  onSendNotification: PropTypes.func.isRequired,
};

export default StudentTable;