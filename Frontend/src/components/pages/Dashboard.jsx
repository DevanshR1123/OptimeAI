import { useEffect, useState } from "react";
import { useAuth } from "../contexts/Auth";
import { useCalendar } from "../contexts/Calendar";

export const Dashboard = () => {
  const { getEvents, createEvent, quickAddEvent, deleteEvent } = useCalendar();

  const [text, setText] = useState("");

  const [newEvent, setNewEvent] = useState({
    summary: "",
    from: new Date().toISOString().substring(0, 16),
    to: new Date(Date.now() + 60 * 60 * 1000).toISOString().substring(0, 16),
    description: "",
  });

  const { summary, from, to, description } = newEvent;

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  useEffect(() => {
    document.title = "Dashboard | OptimeAI";
  }, []);

  return (
    <div className="grid grid-cols-4 gap-8 p-8">
      <div className="col-span-2 row-span-2 grid gap-4 rounded-lg bg-primary-700 p-8">
        <input type="text" name="summary" value={summary} onChange={handleEventChange} className="rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400" />
        <input type="datetime-local" name="from" value={from} onChange={handleEventChange} className="rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400" />
        <input type="datetime-local" name="to" value={to} onChange={handleEventChange} className="rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400" />
        <input type="text" name="description" value={description} onChange={handleEventChange} className="rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400" />

        <button
          onClick={() => {
            console.log(summary, from, to, description);
            createEvent(summary, from, to, description);
            setNewEvent({
              summary: "",
              from: new Date().toISOString().substring(0, 16),
              to: new Date(Date.now() + 60 * 60 * 1000).toISOString().substring(0, 16),
              description: "",
            });
          }}
          className="cursor-pointer rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!(summary && from && to && new Date(from) < new Date(to))}
        >
          Create Event
        </button>
      </div>

      <div className="col-span-2 grid gap-4 rounded-lg bg-primary-700 p-8">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400" />
        <button
          onClick={() => {
            quickAddEvent(text);
            setText("");
          }}
          className="rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400"
        >
          Quick Add Event
        </button>
      </div>

      <div className="col-span-2 grid gap-4 rounded-lg bg-primary-700 p-8">
        <button
          onClick={() => {
            getEvents(Date.now() + 73 * 24 * 60 * 60 * 1000, Date.now() + 80 * 24 * 60 * 60 * 1000);
          }}
          className="rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400"
        >
          Get Events
        </button>
      </div>

      {/* <div className="col-span-2 grid gap-4 rounded-lg bg-primary-700 p-8">
        <button
          onClick={() => {
            deleteEvent("j0v0q6co0o0j3uv811ptp1e63g");
          }}
          className="rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400"
        >
          Delete Event
        </button>
      </div> */}
    </div>
  );
};
