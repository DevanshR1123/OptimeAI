import { useAuth } from "../components/contexts/Auth";
import { useCalendar } from "../components/contexts/Calendar";

export const Dashboard = () => {
  const { getCalendars, getEvents, createEvent } = useCalendar();

  return (
    <div className='grid grid-cols-4 gap-8 p-8'>
      <button className='border-white border-2 bg-stone-600 p-2 font-bold text-lg' onClick={getCalendars}>
        Get Calendars
      </button>
      <button className='border-white border-2 bg-stone-600 p-2 font-bold text-lg' onClick={getEvents}>
        Get Events
      </button>
      <button className='border-white border-2 bg-stone-600 p-2 font-bold text-lg' onClick={createEvent}>
        Create Event
      </button>
    </div>
  );
};
