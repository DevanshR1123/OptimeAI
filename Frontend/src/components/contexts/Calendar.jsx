import axios from "axios";
import { createContext, useContext } from "react";
import { useAuth } from "./Auth";

export const CalendarContext = createContext({});
export const useCalendar = () => useContext(CalendarContext);

const baseUrl = "https://www.googleapis.com/calendar/v3";

export const CalendarProvider = ({ children }) => {
  const { session, profile } = useAuth();

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
    }
  };

  const getCalendars = async () => {
    const calendars = await getRequest(`/users/me/calendarList`);
    console.log(calendars);
  };

  const getEvents = async () => {
    const events = await getRequest(`/calendars/${calendar_id}/events`, {
      timeMin: "2023-07-01T00:00:00Z",
      timeMax: "2023-07-31T00:00:00Z",
    });
    console.log(events);
  };

  const createEvent = async () => {
    const event = await postRequest(`/calendars/${calendar_id}/events`, {
      summary: "Test Event",
      description: "This is a test",
      start: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateTime: new Date("2023-07-14T12:00:00"),
      },
      end: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateTime: new Date("2023-07-14T16:00:00"),
      },
    });
    console.log(event);
  };
  const value = { getCalendars, getEvents, createEvent };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};
