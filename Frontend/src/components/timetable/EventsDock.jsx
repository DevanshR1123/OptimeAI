import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import addIcon from "../../assets/icons/add-icon.svg";
import { useEvents } from "../contexts/Events";

const EventsDock = () => {
  const {
    tiles,
    addTile,
    selectedTile,
    setSelectedTile,
    deleteTile,
    handleTimetableSave,
  } = useEvents();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [newTile, setNewTile] = useState({
    name: "",
    color: "#000000",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTile((tile) => ({ ...tile, [name]: value }));
  };

  const handleSave = () => {
    addTile(newTile);
    setNewTile({
      name: "",
      color: "#000000",
      description: "",
    });
    setDialogOpen(false);
  };

  return (
    <>
      <div className="grid-rows-sandwich grid max-h-[calc(100vh_-_10rem)] gap-2 rounded-3xl bg-primary-700 p-4 font-bold">
        <button
          onClick={() => setDialogOpen(true)}
          className="grid place-items-center rounded-lg bg-primary-900 p-4"
        >
          <img src={addIcon} alt="Add" className="h-6 w-6" />
        </button>
        <div className="flex snap-y snap-mandatory scroll-p-2 flex-col gap-4 overflow-y-auto p-2">
          {tiles.map((tile, index) => (
            <div
              key={index}
              className={twMerge(
                "grid shrink-0 basis-14 cursor-pointer select-none snap-start place-items-center rounded-lg border-2 border-transparent px-4 py-3 text-center font-bold",
                selectedTile?.id === tile.id && "border-primary-200 shadow-lg",
              )}
              style={{ backgroundColor: tile.color }}
              onClick={() =>
                setSelectedTile(selectedTile?.id === tile.id ? null : tile)
              }
              onDoubleClick={() => deleteTile(tile.id)}
            >
              {tile.name}
            </div>
          ))}
        </div>
        <button
          className="grid place-items-center rounded-lg bg-primary-900 p-4 text-lg font-bold active:bg-primary-800"
          onClick={handleTimetableSave}
        >
          Save
        </button>
      </div>
      <CreateDialog
        {...{
          dialogOpen,
          setDialogOpen,
          handleInputChange,
          newTile,
          handleSave,
        }}
      />
    </>
  );
};

const CreateDialog = ({
  dialogOpen,
  setDialogOpen,
  handleInputChange,
  newTile,
  handleSave,
}) => {
  const dialogRef = useRef(null);

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
      className="grid-rows-sandwich grid grid-cols-2 gap-8 rounded-xl bg-primary-700 px-16 py-8 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <h2 className="col-span-2 text-center text-3xl font-bold">
        New Event Type
      </h2>
      <div className="col-span-2 grid auto-rows-[6rem] grid-cols-2 gap-4">
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
            value={newTile.name}
            autoComplete="off"
          />
        </div>

        <div className="col-start-2 row-span-2 grid grid-rows-[auto_1fr] gap-1">
          <label htmlFor="description" className="text-lg font-bold">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            className="resize-none rounded-lg bg-primary-900 p-4 text-lg font-bold leading-none"
            onChange={handleInputChange}
            value={newTile.description}
          />
        </div>

        <div className="grid grid-rows-[auto_1fr] gap-1">
          <label htmlFor="color" className="text-lg font-bold">
            Color
          </label>
          <input
            type="color"
            name="color"
            id="color"
            className="h-12 w-full cursor-pointer rounded-lg bg-primary-900 p-2 text-lg font-bold"
            onChange={handleInputChange}
            value={newTile.color}
          />
        </div>

        <div className="col-span-2 grid grid-rows-[auto-1fr] gap-1">
          <span className="text-lg font-bold">Preview</span>
          <div
            className="grid h-14 w-48 cursor-pointer select-none snap-start place-items-center place-self-center rounded-lg p-4 text-center font-bold "
            style={{ backgroundColor: newTile.color }}
          >
            {newTile.name}
          </div>
        </div>
      </div>

      <button
        className="grid cursor-pointer select-none place-items-center rounded-lg bg-primary-900 p-4 text-lg font-bold active:bg-primary-800 disabled:opacity-50 disabled:active:bg-primary-900"
        onClick={handleSave}
        disabled={!newTile.name}
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

export default EventsDock;
