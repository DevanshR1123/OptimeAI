import { twMerge } from "tailwind-merge";
import { useCalendar } from "../contexts/Calendar";

export const TodayTimetable = () => {
    const { timetable } = useCalendar();

    const now = new Date();

    return (
        <div className="grid grid-rows-[auto_1fr] gap-4 rounded-lg bg-primary-700 p-8">
            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                <h1 className="text-2xl font-bold">Today's Timetable</h1>
                <div className="grid max-w-fit text-right">
                    <span>
                        {now.toLocaleString("en-IN", {
                            weekday: "long",
                        })}
                    </span>
                    <span>
                        {now.toLocaleString("en-IN", {
                            dateStyle: "long",
                        })}
                    </span>
                </div>
            </div>
            <div className="flex h-full flex-col gap-4 overflow-y-auto">
                {timetable
                    .sort(
                        (a, b) =>
                            new Date(a.start.dateTime) -
                            new Date(b.start.dateTime),
                    )
                    .map((event) => (
                        <a href={event.htmlLink} target="_blank" key={event.id}>
                            <div
                                className={twMerge(
                                    "grid h-fit grid-cols-[1fr-auto_1fr] grid-rows-2 gap-2 rounded-lg bg-amber-600/50 px-6 py-4",
                                    new Date(event.start.dateTime) < now &&
                                        "bg-amber-600/25",
                                )}
                            >
                                <h3
                                    className={twMerge(
                                        "col-span-3 text-xl font-bold",
                                        new Date(event.start.dateTime) < now &&
                                            "line-through",
                                    )}
                                >
                                    {event.summary}
                                </h3>
                                <p className="font-semibold">
                                    {new Date(
                                        event.start.dateTime,
                                    ).toLocaleString("en-IN", {
                                        timeStyle: "short",
                                    })}
                                    <span> — </span>
                                    {new Date(
                                        event.end.dateTime,
                                    ).toLocaleString("en-IN", {
                                        timeStyle: "short",
                                    })}
                                </p>
                            </div>
                        </a>
                    ))}
            </div>
        </div>
    );
};

export default TodayTimetable;
