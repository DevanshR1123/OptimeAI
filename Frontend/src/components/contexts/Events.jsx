import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useCalendar } from "./Calendar";
import { toast } from "sonner";

const EventsContext = createContext({});

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }) => {
    const { profile, supabase, refreshProfile } = useAuth();
    const { createWeeklyEvent, deleteEvent: deleteCalendarEvent, updateEvent, getEvents } = useCalendar();

    const [events, setEvents] = useState([]);
    const [tiles, setTiles] = useState([]);
    const [selectedTile, setSelectedTile] = useState(null);
    const [tileId, setTileId] = useState(0);
    const [eventId, setEventId] = useState(0);
    const [saving, setSaving] = useState(0);
    const [changeLog, setChangeLog] = useState([]);

    const getDate = (day, time) => {
        const date = new Date();
        const dayDiff = (day - date.getDay() + 7) % 7;
        date.setDate(date.getDate() + dayDiff);
        date.setHours(Math.floor(time / 4));
        date.setMinutes((time % 4) * 15);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    };

    const processEvents = async (timetable) => {
        const nextMonday = getDate(1, 0).valueOf();
        const { items } = await getEvents(nextMonday, nextMonday + 7 * 24 * 60 * 60 * 1000);
        const calendarEvents = items.map((item) => item.id);
        const existingEvents = timetable.filter((event) => calendarEvents.includes(event.gEventId));

        setEvents(existingEvents);
    };

    useEffect(() => {
        processEvents(profile.events["timetable"]);
        setEventId(profile.events["_id"]);
        setTileId(profile.tiles["_id"]);
        setTiles(profile.tiles["tiles"]);
    }, []);

    const addTile = (tile) => {
        const newTile = {
            id: tileId,
            ...tile,
        };
        setTileId((id) => id + 1);
        setTiles((tiles) => [...tiles, newTile]);
    };

    const deleteTile = (id) => {
        setTiles((tiles) => tiles.filter((tile) => tile.id !== id));
        events.forEach((event) => {
            if (event.tileId === id) deleteEvent(event.id);
        });
        if (selectedTile?.id === id) setSelectedTile(null);
    };

    const addEvent = (tileId, from, duration, day) => {
        const newEvent = {
            id: eventId,
            tileId,
            from,
            duration,
            day,
        };

        let intersect = false;

        events.forEach((event) => {
            const to = from + duration;
            const eventTo = event.from + event.duration;

            const dayMatch = day === event.day;
            const tileMatch = tileId === event.tileId;
            const softIntersectMatch = (from >= event.from && from <= eventTo) || (from <= event.from && to >= event.from);
            const intersectMatch = (from >= event.from && from < eventTo) || (from <= event.from && to > event.from);

            const exactMatch = from === event.from && duration === event.duration;

            intersect = intersect || (dayMatch && intersectMatch && !tileMatch) || (dayMatch && softIntersectMatch && tileMatch);

            if (dayMatch && intersectMatch && !tileMatch && exactMatch) {
                deleteEvent(event.id);
            } else if (dayMatch && tileMatch && softIntersectMatch) {
                const existingLog = changeLog.find((change) => change.data.id === event.id);
                if (exactMatch) {
                    deleteEvent(event.id);
                } else if (from === event.from && duration < event.duration) {
                    event.from += duration;
                    event.duration -= duration;
                } else if (to === eventTo && from > event.from) {
                    event.duration -= duration;
                } else {
                    event.from = Math.min(from, event.from);
                    event.duration = Math.max(to, eventTo) - event.from;
                }

                if (!exactMatch) {
                    from = event.from;
                    duration = event.duration;
                    if (event.gEventId && !existingLog) setChangeLog((changeLog) => [...changeLog, { type: "modify", data: { id: event.id } }]);
                }
            }
        });

        if (!intersect) {
            setEventId((id) => id + 1);
            setEvents((events) => [...events, newEvent]);
            setChangeLog((changeLog) => [...changeLog, { type: "add", data: { id: newEvent.id } }]);
        }
    };

    const deleteEvent = (id) => {
        const event = events.find((event) => event.id === id);
        setEvents((events) => events.filter((event) => event.id !== id));
        setChangeLog((changeLog) => changeLog.filter((change) => change.data.id !== id));
        if (event.gEventId) setChangeLog((changeLog) => [...changeLog, { type: "delete", data: { gEventId: event.gEventId } }]);
    };

    const processChangeLog = async () => {
        console.log(changeLog);

        const processedEvents = [];

        for (const log of changeLog) {
            const { type, data } = log;
            if (type === "add") {
                const { id, tileId, from, duration, day } = events.find((event) => event.id === data.id);
                const fromDateTime = getDate(day, from);
                const toDateTime = getDate(day, from + duration);
                const tile = tiles.find((tile) => tile.id === tileId);
                const summary = tile.name;
                const description = tile.description;
                const gEvent = await createWeeklyEvent(summary, fromDateTime, toDateTime, description, day);
                setEvents((events) => events.map((event) => (event.id === id ? { ...event, gEventId: gEvent.id } : event)));
                processedEvents.push({ id, gEventId: gEvent.id });
            } else if (type === "delete") {
                const { gEventId } = data;
                await deleteCalendarEvent(gEventId);
            } else if (type === "modify") {
                const { id } = data;
                const { gEventId, tileId, from, duration, day } = events.find((event) => event.id === id);
                const fromDateTime = getDate(day, from);
                const toDateTime = getDate(day, from + duration);
                const tile = tiles.find((tile) => tile.id === tileId);
                const summary = tile.name;
                const description = tile.description;
                await updateEvent(gEventId, summary, fromDateTime, toDateTime, description);
            }
        }
        setChangeLog([]);
        return processedEvents;
    };

    const handleTimetableSave = async () => {
        try {
            setSaving(1);

            const processedEvents = await processChangeLog();

            const finalEvents = events.map((event) => {
                const gEventId = processedEvents.find((gEvent) => gEvent.id === event.id)?.gEventId;
                console.log(gEventId);
                return gEventId ? { ...event, gEventId } : event;
            });

            const { error } = await supabase
                .from("profiles")
                .update({
                    tiles: { _id: tileId, tiles },
                    events: { _id: eventId, timetable: finalEvents },
                })
                .eq("email", profile.email);
            if (error) throw error;

            refreshProfile();
            setSaving(2);
            setTimeout(() => {
                setSaving(0);
                toast.success("Timetable saved successfully!");
            }, 2000);
        } catch (error) {
            console.log(error);
            toast.error("Error saving timetable");
        }
    };

    const value = {
        events,
        addEvent,
        deleteEvent,

        tiles,
        addTile,
        deleteTile,

        selectedTile,
        setSelectedTile,

        tileId,
        setTileId,

        handleTimetableSave,
        saving,
        setSaving,
    };

    return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};
