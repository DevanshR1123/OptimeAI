import { useCalendar } from "../contexts/Calendar";

const GetEvents = () => {
    const { getEvents } = useCalendar();

    return (
        <div className="grid gap-4 rounded-lg bg-primary-700 p-8">
            <button
                className="rounded-lg bg-primary-500 px-4 py-2 text-lg font-bold text-white hover:bg-primary-400"
                onClick={() => {
                    getEvents(
                        new Date().toISOString(),
                        new Date(
                            Date.now() + 3 * 60 * 60 * 24 * 1000,
                        ).toISOString(),
                    );
                }}
            >
                <h1 className="text-2xl font-bold">Get Events</h1>
            </button>
        </div>
    );
};
export default GetEvents;
