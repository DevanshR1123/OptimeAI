import { useState } from "react";

export const CreateEvent = () => {
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

    return (
        <div className="col-span-2 row-span-2 grid gap-4 rounded-lg bg-primary-700 p-8">
            <label className="grid grid-rows-[auto_1fr] text-sm font-semibold">
                Event Name
                <input type="text" name="summary" value={summary} onChange={handleEventChange} className="rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400" />
            </label>
            <label className="grid grid-rows-[auto_1fr] text-sm font-semibold">
                From
                <input type="datetime-local" name="from" value={from} onChange={handleEventChange} className="rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400" />
            </label>
            <label className="grid grid-rows-[auto_1fr] text-sm font-semibold">
                To
                <input type="datetime-local" name="to" value={to} onChange={handleEventChange} className="rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400" />
            </label>
            <label className="grid grid-rows-[auto_1fr] text-sm font-semibold">
                Description
                <input type="text" name="description" value={description} onChange={handleEventChange} className="rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400" />
            </label>

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
    );
};
