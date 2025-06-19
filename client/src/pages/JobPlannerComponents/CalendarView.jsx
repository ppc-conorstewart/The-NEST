// src/pages/JobPlannerComponents/CalendarView.jsx

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

import { useState } from 'react';

export default function CalendarView({
  months,
  currentYear,
  singleMonth,
  setSelectedMonth,
  events,
}) {
  const [clickedDate, setClickedDate] = useState(null);

  // Robustly filter events by month if in single month view
  let filteredEvents = events;
  if (singleMonth) {
    filteredEvents = events.filter((e) => {
      const d = new Date(e.start);
      return (
        d instanceof Date &&
        !isNaN(d) &&
        d.getFullYear() === singleMonth.year &&
        d.getMonth() === singleMonth.monthIndex
      );
    });

    // --- DEBUG LOG: Show which jobs are included for this month ---
    console.log(
      `Filtered events for: ${singleMonth.year}-${singleMonth.monthIndex + 1} (index: ${singleMonth.monthIndex})`
    );
    filteredEvents.forEach(e => {
      const d = new Date(e.start);
      console.log('Event:', e.title, 'Start:', e.start, 'Date obj:', d, 'Year:', d.getFullYear(), 'Month:', d.getMonth());
    });
  }

  const handleDateClick = (arg) => {
    const clicked = clickedDate === arg.dateStr ? null : arg.dateStr;
    setClickedDate(clicked);
  };

  const renderAggregatedPopup = () => {
    if (!clickedDate) return null;
    const dateJobs = filteredEvents.filter(e => e.start === clickedDate).map(e => e.extendedProps);
    if (dateJobs.length === 0) return null;

    const total = (key) => dateJobs.reduce((sum, job) => sum + (parseInt(job[key]) || 0), 0);

    return (
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white border-2 border-[#6a7257] rounded-lg shadow-lg p-4 w-[320px]">
        <h3 className="text-yellow-400 underline text-center font-bold mb-2">TOTAL REQUIREMENTS</h3>
        <ul className="text-sm text-[#6a7257] space-y-1 text-left">
          <li>7-1/16 Valves: <strong className="text-white">{total('valve_7_1_16')}</strong></li>
          <li>5-1/8 Valves: <strong className="text-white">{total('valve_5_1_8')}</strong></li>
          <li>3-1/16 HYD: <strong className="text-white">{total('valve_hyd')}</strong></li>
          <li>3-1/16 MAN: <strong className="text-white">{total('valve_man')}</strong></li>
          <li>Gateway Pods: <strong className="text-white">{total('gateway_pods')}</strong></li>
          <li>AWC: <strong className="text-white">{total('awc_pods')}</strong></li>
          <li>Grease: <strong className="text-white">{total('grease_unit')}</strong></li>
          <li>Coil Trees: <strong className="text-white">{total('coil_trees')}</strong></li>
          <li>Accumulator: <strong className="text-white">{total('accumulator')}</strong></li>
          <li>Techs: <strong className="text-white">{total('techs')}</strong></li>
        </ul>
      </div>
    );
  };

  const renderEventContent = (eventInfo) => {
    const job = eventInfo.event.extendedProps;
    const logoPath = `/assets/logos/${(job.customer || '').toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;

    return {
      domNodes: [
        (() => {
          const wrapper = document.createElement('div');
          wrapper.className = 'flex items-center justify-center text-center gap-2 rounded text-white px-2 border-2 border-[#6a7257]';
          wrapper.style.backgroundColor = 'black';
          wrapper.style.boxShadow = 'none';
          wrapper.style.color = 'white';
          wrapper.style.height = '40px';
          wrapper.style.overflow = 'hidden';
          wrapper.style.width = '100%';

          const img = document.createElement('img');
          img.src = logoPath;
          img.alt = 'logo';
          img.className = 'h-8 w-8 object-contain';
          img.onerror = (e) => (e.currentTarget.style.display = 'none');

          const textDiv = document.createElement('div');
          textDiv.className = 'text-xs font-bold leading-tight';
          textDiv.innerText = `${job.customer} • ${job.surface_lsd || 'LSD'} • Wells: ${parseInt(job.num_wells) || 0}`;

          wrapper.appendChild(img);
          wrapper.appendChild(textDiv);
          return wrapper;
        })()
      ]
    };
  };

  const handleEventDidMount = (info) => {
    const job = info.event.extendedProps;
    if (info.el) tippy(info.el, {
      content: `
        <div style="text-align:center; max-width: 250px; background-color: black; color: white; border: none; box-shadow: 0 0 0 2px #6a7257; padding: 10px; border-radius: 0px; font-weight: bold;">
          <div style='background-color: white; padding: 4px; border-radius: 4px; margin-bottom: 6px;'>
            <img src='/assets/logos/${job.customer?.toLowerCase().replace(/[^a-z0-9]/g, '')}.png' alt='logo' style='height: 40px; object-fit: contain;' onerror="this.style.display='none'" />
          </div>
          <div style='margin-bottom: 4px;'>LSD: ${job.surface_lsd || 'N/A'}</div>
          <div style='margin-bottom: 8px;'>Wells: ${parseInt(job.num_wells) || 0}</div>
          <strong style='color: yellow; text-decoration: underline;'>Requirements:</strong>
          <ul style='padding-left: 18px; text-align: left; color: #6a7257;'>
            <li>7-1/16" Valves: <strong style='color: white;'>${parseInt(job.valve_7_1_16) || 0}</strong></li>
            <li>5-1/8" Valves: <strong style='color: white;'>${parseInt(job.valve_5_1_8) || 0}</strong></li>
            <li>3-1/16" HYD: <strong style='color: white;'>${parseInt(job.valve_hyd) || 0}</strong></li>
            <li>3-1/16" MAN: <strong style='color: white;'>${parseInt(job.valve_man) || 0}</strong></li>
            <li>Gateway Pods: <strong style='color: white;'>${parseInt(job.gateway_pods) || 0}</strong></li>
            <li>AWC: <strong style='color: white;'>${parseInt(job.awc_pods) || 0}</strong></li>
            <li>Grease: <strong style='color: white;'>${parseInt(job.grease_unit) || 0}</strong></li>
            <li>Coil Trees: <strong style='color: white;'>${parseInt(job.coil_trees) || 0}</strong></li>
            <li>Accumulator: <strong style='color: white;'>${parseInt(job.accumulator) || 0}</strong></li>
            <li>Techs: <strong style='color: white;'>${parseInt(job.techs) || 0}</strong></li>
          </ul>
        </div>
      `,
      allowHTML: true,
      placement: 'top',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-black border border-[#6a7257] rounded-lg p-4 text-white">
      <h2 className="text-xl font-bold mb-6 text-center">Calendar View</h2>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {Array.isArray(months) && months.map((monthName, idx) => (
          <button
            key={monthName}
            onClick={() => setSelectedMonth(`${monthName} ${currentYear}`)}
            className={`px-3 py-1 rounded ${
              singleMonth &&
              singleMonth.year === currentYear &&
              singleMonth.monthIndex === idx
                ? 'bg-[#6a7257] text-white'
                : 'border border-[#6a7257] text-[#6a7257]'
            }`}
          >
            {monthName}
          </button>
        ))}
        <button
          onClick={() => setSelectedMonth('')}
          className={`px-3 py-1 rounded ${
            !singleMonth ? 'bg-[#6a7257] text-white' : 'border border-[#6a7257] text-[#6a7257]'
          }`}
        >
          Show All
        </button>
      </div>

      {singleMonth ? (
        <div className="mx-auto w-full">
          <FullCalendar
  key={`single-${singleMonth.year}-${singleMonth.monthIndex}`}
  plugins={[dayGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  initialDate={`${singleMonth.year}-${(singleMonth.monthIndex + 1).toString().padStart(2, '0')}-01`}
  headerToolbar={false}
  events={filteredEvents} dateClick={handleDateClick}
  eventContent={renderEventContent}
  eventDidMount={handleEventDidMount}
  height="auto"
  eventBackgroundColor="transparent"
  eventBorderColor="transparent"
  firstDay={0}
  dayHeaderClassNames={() => 'bg-black text-xl text-white'}
  dayCellClassNames={({ date }) => date.getDate() % 2 === 0 ? 'text-2xl font-semibold bg-[#1c1c1c]' : 'text-2xl font-semibold bg-[#111]'}
/>

        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.isArray(months) && months.map((monthName, idx) => {
            const monthEvents = events.filter((e) => {
              const d = new Date(e.start);
              return (
                d instanceof Date &&
                !isNaN(d) &&
                d.getFullYear() === currentYear &&
                d.getMonth() === idx
              );
            });
            // --- DEBUG LOG: Show which jobs are included for each calendar in "Show All" mode ---
            console.log(`Events for ${monthName} (${idx})`, monthEvents);

            return (
              <div key={monthName} className="bg-black border border-[#6a7257] rounded p-2">
                <h3 className="text-center font-bold text-lg mb-2 text-[#6a7257]">
                  {monthName} {currentYear}
                </h3>
                <FullCalendar
  key={`showall-${currentYear}-${idx}`}
  plugins={[dayGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  initialDate={`${currentYear}-${(idx + 1).toString().padStart(2, '0')}-01`}
  headerToolbar={false}
  events={monthEvents}
  eventContent={renderEventContent}
  eventDidMount={handleEventDidMount}
  height="auto"
  eventBackgroundColor="transparent"
  eventBorderColor="transparent"
  firstDay={0}
  dayHeaderClassNames={() => 'bg-black text-white'}
  dayCellClassNames={() => 'text-lg font-semibold'}
/>

              </div>
            );
          })}
        </div>
      )}
      {renderAggregatedPopup()}
    </div>
  );
}
