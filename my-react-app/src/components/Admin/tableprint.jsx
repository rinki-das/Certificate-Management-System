import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import clsx from 'clsx';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios'; // Import axios

const TablePrint = ({ studentDetails, courseCode, examDate, onSave, onSendNotification }) => {
  const [saving, setSaving] = useState(false);

 
  const generateCertificateNumbers = () => {
    let lastCertificateIndex = 0;
    return studentDetails.map((student) => {
      if (student.grade !== 'Absent' && student.grade !== 'Failed') {
        const certificateNumber = `${student.regNo}/001/${(lastCertificateIndex + 1).toString().padStart(3, '0')}`;
        lastCertificateIndex++;
        return {
          ...student,
          certificateNumber,
        };
      } else {
        return {
          ...student,
          certificateNumber: '',
        };
      }
    });
  };
  
  
  

  const handleAddCertificates = async () => {
    try {
      const updatedStudentDetails = generateCertificateNumbers();
      const response = await axios.post('/generatecertificatenumbers', { studentDetails: updatedStudentDetails });
      if (response.data.success) {
        onSave(response.data.studentDetails);
        toast.success('Certificate numbers generated successfully.');
      } else {
        toast.error(response.data.message || 'Failed to generate certificate numbers.');
      }
    } catch (error) {
      console.error('Error generating certificate numbers:', error);
      toast.error('Error generating certificate numbers. Please try again.');
    }
  };

  const onSaveCertificates = async () => {
    try {
      setSaving(true);
      const response = await axios.post('/savecertificate', { studentDetails });
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error saving certificate numbers:', error);
      toast.error('Error saving certificate numbers. Please try again.');
    } finally {
      setSaving(false);
    }
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
          return <span>{row.original.studentName}</span>;
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
        accessorKey: 'certificateNumber',
        header: 'Certificate Number',
        size: 150,
      },
    ],
    []
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
  
    let startY = subTitleY + 20; // Start Y position after the subtitle
  
    let totalStudentsPresent = studentDetails.length;
    let totalStudentsAbsent = 0;
    let totalStudentsFailed = 0;
    let totalStudentsDiscontinued = 0;
  
    // Count the number of students with different statuses
    for (const student of studentDetails) {
      if (student.grade === 'Absent') {
        totalStudentsAbsent++;
      } else if (student.grade === 'Failed' || (parseInt(student.marksProject) < 15 && parseInt(student.grade) < 5)) {
        totalStudentsFailed++;
      } else if (student.marksProject === '' && student.grade === '') {
        totalStudentsDiscontinued++;
      }
    }
  
    // Add table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData.slice(0, 15), // Show only first 15 students
      startY,
    });
  
    // Calculate remaining space on the page after adding the table
    const remainingSpace = doc.internal.pageSize.height - (doc.lastAutoTable.finalY + 10);
  
    // Add the totals and additional content if there's enough space
    if (remainingSpace >= 100) { // Adjust the value according to your content height
      const totalContent = `Total: ${totalStudentsPresent} Present: ${totalStudentsPresent - totalStudentsAbsent} Absent: ${totalStudentsAbsent} Fail: ${totalStudentsFailed} Discontinued: ${totalStudentsDiscontinued}`;
      const gradeContent = `Grade: A+ (90% & above) A (80%-89%) B+ (70%-79%) B (60%-69%) C+ (50%-59%) C (40%-49%) Fail (Less than 40%)`;
      const additionalContent = `
        Prepared by                      Checked & verified by Course Coordinator                      Exam Dept. Verification                       Executive Director
      `;
  
      doc.text(totalContent, 10, doc.lastAutoTable.finalY + 10);
      doc.text(gradeContent, 10, doc.lastAutoTable.finalY + 20);
      doc.text('', 10, doc.lastAutoTable.finalY + 30); // Add blank line for space
      doc.text(additionalContent, 10, doc.lastAutoTable.finalY + 40);
    } else {
      // If there's not enough space, add a new page
      doc.addPage();
    }
  
    // Save the PDF with student name as the filename
    const studentName = studentDetails[0].studentName; // Assuming the first student's name is used
    doc.save(`${studentName}.pdf`);
  };
  
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          padding: '8px',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          disabled={studentDetails.length === 0}
          onClick={handleExportRows}
          startIcon={<SaveIcon />}
          className={clsx('custom-export-button')}
        >
          Export Student Details
        </Button>

        <Button
          disabled={studentDetails.length === 0}
          onClick={onSendNotification}
          startIcon={<SendIcon />}
          className={clsx('custom-notification-button')}
        >
          Send Notification
        </Button>
        <Button onClick={handleAddCertificates}>
          Add Certificate
        </Button>
        <Button onClick={onSaveCertificates} disabled={studentDetails.length === 0 || saving}>
          {saving ? 'Saving...' : 'Save Certificate Numbers'}
        </Button>
      </Box>
      <MaterialReactTable table={table} showPagination={true} />
    </>
  );
};

TablePrint.propTypes = {
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
      certificateNumber: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSave: PropTypes.func.isRequired,
  onSendNotification: PropTypes.func.isRequired,
};

export default TablePrint;
