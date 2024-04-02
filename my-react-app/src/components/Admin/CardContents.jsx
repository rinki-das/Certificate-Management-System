// CardContents.jsx
import React from 'react';
import Calendar from 'react-calendar'; // Import the Calendar component
import 'react-calendar/dist/Calendar.css'; // Import the default calendar styles

const CalendarContent = () => {
  return (
    <div className="card-content" id="calendarScheduleContent">
      <h2>Calendar and Schedule Content</h2>
      <p>Details about calendar and schedule...</p>

      {/* Indian Calendar */}
      <div>
        <h3>Indian Calendar</h3>
        <Calendar locale="en-IN" />
      </div>
    </div>
  );
};

export default CalendarContent;
