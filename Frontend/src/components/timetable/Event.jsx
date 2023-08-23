import { twMerge } from "tailwind-merge";
import { useEvents } from "../contexts/Events";

const Event = ({ id, tileId, from, duration, day, className, editOpen }) => {
  const { deleteEvent, tiles, setSelectedTile } = useEvents();

  const { color, name } = tiles.find((tile) => tile.id === tileId);

  return (
    <div
      style={{
        backgroundColor: color,
        gridColumn: day + 1,
        gridRow: `${from + 1} / span ${duration}`,
      }}
      className={twMerge(
        "grid cursor-pointer select-none place-items-center rounded-lg text-center font-bold",
        className,
      )}
      onDoubleClick={() => {
        deleteEvent(id);
      }}

      // onClick={() => {
      //   editOpen(id);
      //   setSelectedTile(tiles.find((tile) => tile.id === tileId));
      // }}
    >
      {name}
    </div>
  );
};
export default Event;
