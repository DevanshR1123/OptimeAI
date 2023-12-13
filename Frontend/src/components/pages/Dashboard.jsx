import { useEffect, useState } from "react";
import { useAuth } from "../contexts/Auth";
import { useCalendar } from "../contexts/Calendar";
import Chat from "../dashboard/Chat";
import { CreateEvent } from "../dashboard/CreateEvent";

export const Dashboard = () => {
    // const { getEvents, createEvent, quickAddEvent, deleteEvent } = useCalendar();

    useEffect(() => {
        document.title = "Dashboard | OptimeAI";
    }, []);

    return (
        <div className="grid gap-8 p-8">
            <Chat />
            <section className="grid grid-cols-3 gap-4">
                <CreateEvent />
            </section>
        </div>
    );
};
