/* Data for the Debate Society pages (i263131) */
(() => {
  "use strict";

  // Array holding the Debate Society profile and its list of meetings.
  const DEBATE_SOCIETY_DATA = [
    {
      id: "debate",
      name: "Debate Society",
      description: "Practise public speaking in short, friendly debates.",
      meetings: [
        {
          id: "debate-meeting-1",
          title: "First Debate Practice",
          date: "2026-12-02",
          startTime: "3:00 pm",
          endTime: "3:45 pm",
          venue: "Student Centre, Room 104",
          note: "Bring a notebook."
        }
      ],
      events: [
        {
          id: "debate-event-1",
          title: "First Debate Practice",
          date: "2026-12-02",
          startTime: "3:00 pm",
          endTime: "3:45 pm",
          venue: "Student Centre, Room 104",
          note: "Bring a notebook.",
          capacity: 20
        },
        {
          id: "debate-event-2",
          title: "Public Speaking Workshop",
          date: "2026-12-09",
          startTime: "4:00 pm",
          endTime: "5:00 pm",
          venue: "Student Centre, Room 102",
          note: "Beginners welcome.",
          capacity: 15
        },
        {
          id: "debate-event-3",
          title: "Inter-Society Friendly Debate",
          date: "2026-12-16",
          startTime: "2:00 pm",
          endTime: "3:30 pm",
          venue: "Main Auditorium",
          note: "Come and cheer us on.",
          capacity: 0
        },
        {
          id: "debate-event-4",
          title: "Open Mic Evening",
          date: "2026-12-19",
          startTime: "5:00 pm",
          endTime: "6:00 pm",
          venue: "Campus Cafe",
          note: "Bring a topic to speak about.",
          capacity: 30
        }
      ]
    }
  ];

  // Share the data array with the Debate Society scripts via window.
  window.UniSyncDebateData = DEBATE_SOCIETY_DATA;
})();
