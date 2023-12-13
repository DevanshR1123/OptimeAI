import { useEffect, useState } from "react";
import { useAuth } from "../contexts/Auth";
import { useCalendar } from "../contexts/Calendar";
import Chat from "../dashboard/Chat";
import { CreateEvent } from "../dashboard/CreateEvent";

export const Dashboard = () => {
    const { getEvents, createEvent, quickAddEvent, deleteEvent } = useCalendar();

    const [text, setText] = useState("");

    useEffect(() => {
        document.title = "Dashboard | OptimeAI";
    }, []);

    return (
        <div className="grid grid-cols-4 grid-rows-3 gap-8 p-8">
            <Chat />
            <CreateEvent />
        </div>
    );
};
