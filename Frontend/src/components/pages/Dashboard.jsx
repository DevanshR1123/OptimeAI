import { useAuth } from "../contexts/Auth";
import { useCalendar } from "../contexts/Calendar";

export const Dashboard = () => {
  const { getCalendars, getEvents, createEvent } = useCalendar();

  return (
    <div className="grid grid-cols-4 gap-8 p-8">
      <button
        className="border-2 border-white bg-stone-600 p-2 text-lg font-bold"
        onClick={getCalendars}
      >
        Get Calendars
      </button>
      <button
        className="border-2 border-white bg-stone-600 p-2 text-lg font-bold"
        onClick={getEvents}
      >
        Get Events
      </button>
      <button
        className="border-2 border-white bg-stone-600 p-2 text-lg font-bold"
        onClick={createEvent}
      >
        Create Event
      </button>
    </div>
  );
};
