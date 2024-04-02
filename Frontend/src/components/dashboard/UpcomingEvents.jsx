import { useCalendar } from "../contexts/Calendar";
import { twMerge } from "tailwind-merge";
import ReloadIcon from "../../assets/icons/reload.svg";

export const UpcomingEvents = () => {
    const { events, updateEvents, deleteEvent } = useCalendar();

    return (
        <div className="grid grid-rows-[auto_1fr] gap-4 rounded-lg bg-primary-700 p-8">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Upcoming Events</h1>
                <button
                    onClick={updateEvents}
                    className={twMerge(
                        "aspect-square cursor-pointer transition-transform duration-200 active:rotate-[360deg] disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                >
                    <img src={ReloadIcon} alt="Reload" className="h-5 w-5" />
                </button>
            </div>
            <div className="flex h-full flex-col gap-4 overflow-y-auto">
                {events.map((event) => (
                    <div
                        className={twMerge(
                            "grid h-fit grid-cols-[1fr-auto] grid-rows-2 gap-2 rounded-lg bg-primary-700 px-6 py-4",
                            event.description?.includes("#OptimeAI")
                                ? "bg-green-800"
                                : "bg-primary-600",
                        )}
                    >
                        <a href={event.htmlLink} target="_blank" key={event.id}>
                            <h3 className="text-xl font-bold">
                                {event.summary}
                            </h3>
                        </a>
                        <button
                            className="aspect-square w-6 place-self-end rounded-md bg-primary-800 p-1 text-xs "
                            onClick={() => deleteEvent(event.id)}
                        >
                            X
                        </button>
                        <p className="col-span-2 font-semibold">
                            <EventDateFormat
                                from={event.start.dateTime}
                                to={event.end.dateTime}
                            />
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingEvents;

const EventDateFormat = ({ from, to }) => {
    const from_date = new Date(from);
    const to_date = new Date(to);

    if (from_date.getDate() === to_date.getDate())
        return (
            <>
                {from_date.toLocaleString("en-in", {
                    dateStyle: "long",
                })}
                ,{" "}
                {`${from_date.toLocaleString("en-in", {
                    hour: "numeric",
                    minute: "numeric",
                })} — ${to_date.toLocaleString("en-in", {
                    hour: "numeric",
                    minute: "numeric",
                })}`}
            </>
        );
    else
        return (
            <>
                {new Date(event.start.dateTime).toLocaleString("en-IN", {
                    dateStyle: "short",
                    timeStyle: "short",
                })}
                <span> — </span>
                {new Date(event.end.dateTime).toLocaleString("en-IN", {
                    dateStyle: "short",
                    timeStyle: "short",
                })}
            </>
        );
};
