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

const TablePrint = ({ studentDetails, onSave, onSendNotification }) => {
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

    const doc = new jsPDF({
      orientation: 'landscape',
    });

    const filteredColumns = columns.filter((col) => col.accessorKey !== 'action');
    const tableData = studentDetails.map((row) => filteredColumns.map((col) => row[col.accessorKey]));
    const tableHeaders = filteredColumns.map((col) => col.header);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
    });

    doc.save('student-details.pdf');
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
