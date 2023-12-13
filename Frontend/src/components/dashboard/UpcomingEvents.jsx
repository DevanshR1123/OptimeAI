import { useState } from "react";
import { useCalendar } from "../contexts/Calendar";

export const CreateEvent = () => {
    const { getEvents } = useCalendar();

    return (
        <div className="grid gap-4 rounded-lg bg-primary-700 p-8">
            <h1 className="text-2xl font-bold">Upcoming Event</h1>
        </div>
    );
};
