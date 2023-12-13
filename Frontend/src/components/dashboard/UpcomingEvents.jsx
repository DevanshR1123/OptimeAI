import { useCalendar } from "../contexts/Calendar";
import { twMerge } from "tailwind-merge";

export const UpcomingEvents = () => {
    const { events } = useCalendar();

    return (
        <div className="grid grid-rows-[auto_1fr] gap-4 rounded-lg bg-primary-700 p-8">
            <h1 className="text-2xl font-bold">Upcoming Events</h1>
            <div className="flex flex-col gap-4">
                {events.map((event) => (
                    <a href={event.htmlLink} target="_blank" key={event.id}>
                        <div
                            className={twMerge(
                                "grid h-fit grid-cols-[1fr-auto_1fr] grid-rows-2 gap-2 rounded-lg bg-primary-700 px-6 py-4",
                                event.description.includes("#OptimeAI")
                                    ? "bg-green-500"
                                    : "bg-primary-600",
                            )}
                        >
                            <h3 className="col-span-3 text-xl font-bold">
                                {event.summary}
                            </h3>
                            <p className="font-semibold">
                                {new Date(event.start.dateTime).toLocaleString(
                                    "en-IN",
                                    { dateStyle: "short", timeStyle: "short" },
                                )}
                            </p>
                            <span>—</span>
                            <p className="font-semibold">
                                {new Date(event.end.dateTime).toLocaleString(
                                    "en-IN",
                                    {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                    },
                                )}
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default UpcomingEvents;
