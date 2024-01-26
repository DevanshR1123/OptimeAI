import { useEffect, useState } from "react";
import { useAuth } from "../contexts/Auth";
import { useCalendar } from "../contexts/Calendar";
import Chat from "../dashboard/Chat";
import { CreateEvent } from "../dashboard/CreateEvent";
import { UpcomingEvents } from "../dashboard/UpcomingEvents";
import { TodayTimetable } from "../dashboard/TodayTimetable";
import GetEvents from "../dashboard/GetEvents";

export const Dashboard = () => {
    useEffect(() => {
        document.title = "Dashboard | OptimeAI";
    }, []);

    return (
        <div className="grid gap-8 p-8">
            <Chat />
            <section className="grid grid-cols-3 gap-4">
                <CreateEvent />
                <UpcomingEvents />
                <TodayTimetable />
                <GetEvents />
            </section>
        </div>
    );
};
