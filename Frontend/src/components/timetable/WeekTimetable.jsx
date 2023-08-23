import { useRef, useState, useEffect } from "react";
import Event from "./Event";
import { useEvents } from "../contexts/Events";

const WeekCalendar = () => {
  const { events, selectedTile, addEvent } = useEvents();

  const [hovering, setHovering] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [day, setDay] = useState(0);
  const [from, setFrom] = useState(0);
  const [duration, setDuration] = useState(1);

  //   const [editEvent, setEditEvent] = useState({
  //     id: 0,
  //     tileId: 0,
  //     from: 0,
  //     duration: 1,
  //     day: 0,
  //   });

  const gridRef = useRef(null);

  const styles = {
    dayHeader: "rounded-lg bg-primary-900 p-4 text-center font-bold",
  };

  //   const editOpen = (id) => {
  //     setDialogOpen(true);
  //     setEditEvent(events.find((event) => event.id === id));
  //   };

  const moveHandler = (e) => {
    const { clientX, clientY, buttons, movementY, movementX } = e;
    const { x, y, width, height } = gridRef.current?.getBoundingClientRect();

    if (buttons !== 1) {
      setDay(Math.floor((7 * (clientX - x)) / width));
      setFrom(Math.floor((96 * (clientY - y)) / height));
    } else {
      if (movementX !== 0) setDay(Math.floor((7 * (clientX - x)) / width));

      if (movementY >= 0)
        setDuration(Math.floor((96 * (clientY - y)) / height) - from + 1);
      else {
        setFrom(Math.floor((96 * (clientY - y)) / height));
      }
    }
  };

  const mouseUpHandler = () => {
    if (!selectedTile) return;
    setDuration(1);
    addEvent(selectedTile.id, from, duration, day);
  };

  return (
    <>
      <div className="grid max-h-[calc(100vh_-_10rem)] grid-rows-[auto_1fr] gap-y-4 rounded-3xl p-4 pt-0">
        <div className="ml-12 grid grid-cols-7 gap-4 border-b-2 p-4">
          <div className={styles["dayHeader"]}>Sunday</div>
          <div className={styles["dayHeader"]}>Monday</div>
          <div className={styles["dayHeader"]}>Tuesday</div>
          <div className={styles["dayHeader"]}>Wednesday</div>
          <div className={styles["dayHeader"]}>Thursday</div>
          <div className={styles["dayHeader"]}>Friday</div>
          <div className={styles["dayHeader"]}>Saturday</div>
        </div>
        <div className="grid overflow-y-auto p-4 pl-16">
          <div className="col-start-1 row-start-1 grid grid-rows-[repeat(48,4rem)_auto] border-primary-400">
            {Array(49)
              .fill(0)
              .map((_, i) => {
                return (
                  <div
                    key={i}
                    className="group relative grid items-start gap-2 border-t-2 border-primary-400"
                  >
                    <span className="absolute -left-16 -top-[0.875rem] w-12 text-right font-bold">
                      {i % 2 === 0 &&
                        new Date(0, 0, 0, 0, i * 30).toLocaleTimeString(
                          ["en-IN"],
                          {
                            hour: "numeric",
                          },
                        )}
                    </span>
                  </div>
                );
              })}
          </div>

          <div
            className="grid-rows-96 z-10 col-start-1 row-start-1 grid grid-cols-7 gap-x-4"
            ref={gridRef}
            //   onClick={clickHandler}
            onMouseMove={moveHandler}
            onMouseUp={mouseUpHandler}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => {
              setHovering(false);
              setDuration(1);
            }}
          >
            {events.map((event, index) => {
              return <Event key={index} {...event} />;
            })}
            {selectedTile && hovering && (
              <div
                className="grid cursor-n-resize select-none place-items-center rounded-lg font-bold mix-blend-screen"
                style={{
                  backgroundColor: selectedTile.color,
                  opacity: 0.5,
                  gridColumn: day + 1,
                  gridRow: `${from + 1} / span ${duration}`,
                }}
              >
                {selectedTile.name}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* <EditDialog
        {...{ dialogOpen, setDialogOpen, setEditEvent, editEvent }}
      /> */}
    </>
  );
};

const EditDialog = ({ dialogOpen, setDialogOpen, setEditEvent, editEvent }) => {
  const dialogRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditEvent((event) => ({ ...event, [name]: value }));
  };

  useEffect(() => {
    if (dialogOpen) {
      dialogRef.current.showModal();
      dialogRef.current.classList.add("grid");
    } else {
      dialogRef.current.close();
      dialogRef.current.classList.remove("grid");
    }
  }, [dialogOpen]);
  return (
    <dialog
      ref={dialogRef}
      onClose={() => setDialogOpen(false)}
      className="grid-rows-sandwich grid grid-cols-2 gap-8 rounded-xl bg-primary-700 p-8 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <h2 className="col-span-2 text-center text-3xl font-bold">Edit Event</h2>
      <div className="col-span-2 grid grid-cols-2 gap-4 p-4">
        <div className="grid grid-rows-[auto_1fr] gap-1">
          <label htmlFor="name" className="text-lg font-bold">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="rounded-lg bg-primary-900 p-4 text-lg font-bold leading-none"
            onChange={handleInputChange}
            value={editEvent.name}
            autoComplete="off"
          />
        </div>
      </div>
      <button
        className="grid cursor-pointer select-none place-items-center rounded-lg bg-primary-900 p-4 text-lg font-bold active:bg-primary-800 disabled:opacity-50 disabled:active:bg-primary-900"
        //   onClick={handleSave}
        disabled={!editEvent.name}
      >
        Save
      </button>
      <button
        className="grid cursor-pointer select-none place-items-center rounded-lg bg-primary-900 p-4 text-lg font-bold active:bg-primary-800"
        onClick={() => setDialogOpen(false)}
      >
        Cancel
      </button>
    </dialog>
  );
};

export default WeekCalendar;
