import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import clsx from 'clsx';

const AdminTable = ({ studentDetails, onSave, onSendNotification, onEdit }) => {
  const [editingIndex, setEditingIndex] = useState(null);

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
              onChange={(e) => onEdit(row.index, 'studentName', e.target.value)}
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
        Cell: ({ row }) => {
          const isEditing = editingIndex === row.index;

          return isEditing ? (
            <input
              type="text"
              value={row.original.marksTheory}
              onChange={(e) => onEdit(row.index, 'marksTheory', e.target.value)}
              className="edit-input"
            />
          ) : (
            row.original.marksTheory
          );
        },
      },
      {
        accessorKey: 'marksProject',
        header: 'Marks (Project)',
        size: 150,
        Cell: ({ row }) => {
          const isEditing = editingIndex === row.index;

          return isEditing ? (
            <input
              type="text"
              value={row.original.marksProject}
              onChange={(e) => onEdit(row.index, 'marksProject', e.target.value)}
              className="edit-input"
            />
          ) : (
            row.original.marksProject
          );
        },
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
            <>
              <button onClick={() => onSave(row.index)}>Save</button>
              <button onClick={() => setEditingIndex(null)}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditingIndex(row.index)}>Edit</button>
          );
        },
      },
    ],
    [editingIndex, onEdit, onSave]
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
      </Box>

      <MaterialReactTable
        table={table}
        showPagination={true}
        renderHeader={(props) => (
          <>
            {props.headers.map((header, index) => (
              <th key={index}>{header.label}</th>
            ))}
            <th>Action</th>
          </>
        )}
        renderCell={(props) => {
          const isEditing = editingIndex === props.row.index;

          return isEditing ? (
            <>
              <button onClick={() => onSave(props.row.index)}>Save</button>
              <button onClick={() => setEditingIndex(null)}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditingIndex(props.row.index)}>Edit</button>
          );
        }}
      />
    </>
  );
};

AdminTable.propTypes = {
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
  onSave: PropTypes.func.isRequired,
  onSendNotification: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired, // Add the onEdit prop
};

export default AdminTable;
