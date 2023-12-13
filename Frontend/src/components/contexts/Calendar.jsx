import axios from "axios";
import { createContext, useContext } from "react";
import { useAuth } from "./Auth";
import { toast } from "sonner";
import { data } from "autoprefixer";

export const CalendarContext = createContext({});
export const useCalendar = () => useContext(CalendarContext);

const baseUrl = "https://www.googleapis.com/calendar/v3";
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const CalendarProvider = ({ children }) => {
    const { session, profile, Logout } = useAuth();

    const calendar_id = encodeURIComponent(profile?.calendar_id);

    const getRequest = async (url, params = {}) => {
        try {
            const res = await axios.get(`${baseUrl}${url}`, {
                headers: {
                    Authorization: `Bearer ${session.provider_token}`,
                    Accept: "application/json",
                },
                params,
            });
            const data = await res.data;
            return data;
        } catch (error) {
            console.log(error.response.data);
            if (error.response.data.error.status === "UNAUTHENTICATED") {
                toast.error("Please login again!");
                Logout();
            }
        }
    };

    const postRequest = async (url, body = {}) => {
        try {
            const res = await axios.post(`${baseUrl}${url}`, body, {
                headers: {
                    Authorization: `Bearer ${session.provider_token}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });
            const data = await res.data;
            return data;
        } catch (error) {
            console.log(error.response.data);
            if (error.response.data.error.status === "UNAUTHENTICATED") {
                toast.error("Please login again!");
                Logout();
            }
        }
    };

    const putRequest = async (url, body = {}) => {
        try {
            const res = await axios.put(`${baseUrl}${url}`, body, {
                headers: {
                    Authorization: `Bearer ${session.provider_token}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });
            const data = await res.data;
            return data;
        } catch (error) {
            console.log(error.response.data);
            if (error.response.data.error.status === "UNAUTHENTICATED") {
                toast.error("Please login again!");
                Logout();
            }
        }
    };

    const deleteRequest = async (url) => {
        try {
            const res = await axios.delete(`${baseUrl}${url}`, {
                headers: {
                    Authorization: `Bearer ${session.provider_token}`,
                    Accept: "application/json",
                },
            });
            const data = await res.data;
            return data;
        } catch (error) {
            console.log(error.response.data);
            if (error.response.data.error.status === "UNAUTHENTICATED") {
                toast.error("Please login again!");
                Logout();
            }
        }
    };

    const getCalendars = async () => {
        const calendars = await getRequest(`/users/me/calendarList`);
        console.log(calendars);
    };

    const getEvent = async (id) => {
        const { data: event } = await axios.get(`${baseUrl}/calendars/${calendar_id}/events/${id}`, {
            headers: {
                Authorization: `Bearer ${session.provider_token}`,
                Accept: "application/json",
            },
        });
        return event;
    };

    const getEvents = async (from, to, primary = true) => {
        const events = await getRequest(`/calendars/${primary ? "primary" : calendar_id}/events`, {
            timeMin: new Date(from).toISOString(),
            timeMax: new Date(to).toISOString(),
        });
        // console.log(events);
        return events;
    };

    const quickAddEvent = async (text, primary = true) => {
        const event = await postRequest(`/calendars/${primary ? "primary" : calendar_id}/events/quickAdd`, {
            text,
        });
        // console.log(event);
        toast.success("Event created successfully!");
        return event;
    };

    const createEvent = async (summary, from, to, description, options, primary = true, notify = true) => {
        const event = await postRequest(`/calendars/${primary ? "primary" : calendar_id}/events`, {
            summary,
            description,
            ...options,
            start: {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                dateTime: new Date(from),
            },
            end: {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                dateTime: new Date(to),
            },
        });
        // console.log(event);
        if (notify) toast.success("Event created successfully!");

        return event;
    };

    const createWeeklyEvent = async (summary, from, to, description, day) => {
        const DAY = days[day].toUpperCase().substring(0, 2);
        return createEvent(
            summary,
            from,
            to,
            description,
            {
                recurrence: [`RRULE:FREQ=WEEKLY;WKST=MO;INTERVAL=1;BYDAY=${DAY}`],
            },
            false,
            false,
        );
    };

    const deleteEvent = async (id) => {
        const event = await deleteRequest(`/calendars/${calendar_id}/events/${id}`);
    };

    const updateEvent = async (id, summary, from, to, description, options) => {
        const event = await putRequest(`/calendars/${calendar_id}/events/${id}`, {
            summary,
            description,
            ...options,
            start: {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                dateTime: new Date(from),
            },
            end: {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                dateTime: new Date(to),
            },
        });
    };

    const value = {
        getCalendars,

        getEvent,
        getEvents,
        quickAddEvent,
        createEvent,
        createWeeklyEvent,
        deleteEvent,
        updateEvent,
    };

    return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};
