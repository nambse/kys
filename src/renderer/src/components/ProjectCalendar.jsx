import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick

const ProjectCalendar = ({ projects }) => {
  // Convert projects data to events format for FullCalendar
  const events = projects.map(project => ({
    title: project.projectName,
    start: project.raffleDate,
    description: project.raffleCategory,
    extendedProps: {
      location: project.projectLocation,
      owner: project.projectOwner,
      branch: project.projectBranch,
      type: project.raffleType,
      houseCount: project.raffleHouseCount,
      applicantCount: project.raffleApplicantCount,
      tags: project.raffleTags,
    },
  }));

  const handleEventClick = (info) => {
    const { event } = info;
    alert(
      `Project: ${event.title}\nLocation: ${event.extendedProps.location}\nOwner: ${event.extendedProps.owner}\nCategory: ${event.extendedProps.category}\nType: ${event.extendedProps.type}\nHouse Count: ${event.extendedProps.houseCount}\nApplicant Count: ${event.extendedProps.applicantCount}\nTags: ${event.extendedProps.tags}`
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Project Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        eventClick={handleEventClick}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
      />
    </div>
  );
};

export default ProjectCalendar;
