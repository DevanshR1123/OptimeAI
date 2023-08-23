import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./Auth";

const EventsContext = createContext({});

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }) => {
  const { profile, supabase, refreshProfile } = useAuth();

  const [events, setEvents] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [tileId, setTileId] = useState(0);
  const [eventId, setEventId] = useState(0);
  const [saving, setSaving] = useState(0);

  useEffect(() => {
    setEventId(profile.events["_id"]);
    setEvents(profile.events["events"]);
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
    setEvents((events) => events.filter((event) => event.tileId !== id));
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
      const softIntersectMatch =
        (from >= event.from && from <= eventTo) ||
        (from <= event.from && to >= event.from);
      const intersectMatch =
        (from >= event.from && from < eventTo) ||
        (from <= event.from && to > event.from);

      const exactMatch = from === event.from && duration === event.duration;

      intersect =
        intersect ||
        (dayMatch && intersectMatch && !tileMatch) ||
        (dayMatch && softIntersectMatch && tileMatch);

      if (dayMatch && intersectMatch && !tileMatch && exactMatch) {
        deleteEvent(event.id);
      } else if (dayMatch && tileMatch && softIntersectMatch) {
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
        }
      }
    });

    if (!intersect) {
      setEventId((id) => id + 1);
      setEvents((events) => [...events, newEvent]);
    }
  };

  const deleteEvent = (id) => {
    setEvents((events) => events.filter((event) => event.id !== id));
  };

  const handleTimetableSave = async () => {
    try {
      setSaving(1);
      const { error } = await supabase
        .from("profiles")
        .update({
          tiles: { _id: tileId, tiles },
          events: { _id: eventId, events },
        })
        .eq("email", profile.email);
      if (error) throw error;

      refreshProfile();
      setSaving(2);
      setTimeout(() => setSaving(0), 2000);
    } catch ({ name, message }) {
      console.log(name, message);
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

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
};
