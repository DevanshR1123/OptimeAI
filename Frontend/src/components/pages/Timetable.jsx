import { useEffect, useRef } from "react";
import { EventsProvider, useEvents } from "../contexts/Events";
import WeekCalendar from "../timetable/WeekTimetable";
import EventsDock from "../timetable/EventsDock";
import xIcon from "../../assets/icons/x-icon.svg";

const Timetable = () => {
  useEffect(() => {
    document.title = "Timetable | OptimeAI";
  }, []);

  return (
    <EventsProvider>
      <div className="grid grid-cols-[6fr_1fr] gap-4 p-4">
        <WeekCalendar />
        <EventsDock />
      </div>
      <SavedDialog />
    </EventsProvider>
  );
};

const SavedDialog = () => {
  const { saving, setSaving } = useEvents();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (saving > 0) {
      dialogRef.current.showModal();
      dialogRef.current.classList.add("grid");
    } else {
      dialogRef.current.close();
      dialogRef.current.classList.remove("grid");
    }
  }, [saving]);

  return (
    <dialog ref={dialogRef} onClose={() => setSaving(0)} className="relative grid place-items-center gap-4 rounded-xl bg-primary-700 p-24 backdrop:bg-black/50 backdrop:backdrop-blur-sm">
      <button className="absolute right-4 top-4" onClick={() => setSaving(0)}>
        <img src={xIcon} alt="Close" className="h-8 w-8" />
      </button>

      {saving === 1 && (
        <>
          {/* spinner */}
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-400 border-y-transparent"></div>
        </>
      )}

      {saving === 2 && (
        <>
          <h2 className="text-center text-3xl font-bold">Saved Successfully</h2>
          <p className="text-center text-lg font-bold">Your timetable has been saved.</p>
        </>
      )}
    </dialog>
  );
};

export default Timetable;
