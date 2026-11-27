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
      ]
    }
  ];

  // Share the data array with debate_i263131.js via window.
  window.UniSyncDebateData = DEBATE_SOCIETY_DATA;
})();
