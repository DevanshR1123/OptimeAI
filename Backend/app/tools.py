from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import tool
from requests import get


class GetCalendarEventsInput(BaseModel):
    token: str = Field(..., description="The token for the Google Calendar API")
    calendar_id: str = Field(..., description="The calendar ID for the Google Calendar API")
    time_min: str = Field(..., description="The minimum time for the events")
    time_max: str = Field(..., description="The maximum time for the events")


@tool
def get_calendar_events(token: str, calendar_id: str, time_min: str, time_max: str):
    """
    Get the calendar events from the Google Calendar API
    """

    url = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"
    headers = {"Authorization": f"Bearer {token}"}
    params = {"timeMin": time_min, "timeMax": time_max}

    response = get(url, headers=headers, params=params)
    data = response.json()

    print(data)

    return data["items"]
