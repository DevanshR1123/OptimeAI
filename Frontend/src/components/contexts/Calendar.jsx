import { useSession } from "@supabase/auth-helpers-react";
import { createContext, useContext } from "react";
import axios from "axios";

export const CalendarContext = createContext({});
export const useCalendar = () => useContext(CalendarContext);

const baseUrl = "https://www.googleapis.com/calendar/v3";

export const CalendarProvider = ({ children }) => {
  const session = useSession();

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
      console.log(data);
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
      console.log(data);
      return data;
    } catch (error) {
      console.log(error.response.data);
    }
  };

  const getCalendars = async () => await getRequest(`/users/me/calendarList`);

  const createCalendar = async () => await postRequest(`/calendars`, { summary: "OptimeAI" });

  const getEvents = async () =>
    await getRequest(`/calendars/primary/events`, {
      timeMin: "2023-07-01T00:00:00Z",
      timeMax: "2023-07-31T00:00:00Z",
    });

  const value = { getCalendars, createCalendar, getEvents };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};
