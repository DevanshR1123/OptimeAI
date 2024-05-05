import json
from datetime import datetime, timedelta

from app.llm import get_llm
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableBranch, RunnableLambda, RunnablePassthrough, RunnableSequence
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field


llm = get_llm(max_tokens=256)


class Event(BaseModel):
    from_: datetime = Field(alias="from", description="Start date and time of the event without timezone")
    to: datetime = Field(description="End date and time of the event without timezone")
    title: str = Field(description="Title of the event")
    description: str = Field(description="Description of the event")
    duration: str = Field(description="Duration of the event")
    recurring: bool = Field(description="Is the event recurring")
    repeat: str = Field(description="Recurring pattern of the event")
    rrule: str = Field(description="Recurring rule of the event")
    # conflicting: bool = Field(description="Is the event conflicting with the user's calendar events")


parser = JsonOutputParser(pydantic_object=Event)

template = """
The below is is an extracted event from the user's input text:
{extracted}

The below is the conflicting events from the user's calendar events:
{conflicting_events}

The extracted event conflicts with the user's calendar events.
Please resolve the conflict by adjusting the event time to fit within any free time slots between the time bounds.
Adjust the event time to fit within any free time slots between the time bounds.
Take note of the conflicting events, weekly events, and primary events to ensure that the event does not conflict with any existing events.

{schema}
 
Response:
"""

conflict_prompt = PromptTemplate(
    template=template,
    input_variables=["extracted", "conflicting_events"],
    partial_variables={"schema": parser.get_format_instructions()},
)


def process_event(event: dict, extract: dict) -> dict:
    f = datetime.strptime(event["start"], "%A, %Y-%m-%d %H:%M:%S")
    t = datetime.strptime(event["end"], "%A, %Y-%m-%d %H:%M:%S")

    fr, to = datetime.fromisoformat(extract["from"]), datetime.fromisoformat(extract["to"])

    nf = f.replace(year=fr.year, month=fr.month, day=fr.day + (f.weekday() - fr.weekday()))
    nt = t.replace(year=to.year, month=to.month, day=to.day + (t.weekday() - to.weekday()))

    return {"summary": event["summary"], "from": nf, "to": nt}


def format_events(events: list, extract: dict) -> list:
    return list(map(lambda x: process_event(x, extract), events))


def overlap(event, extract, window=2):
    s1, e1 = event["from"] - timedelta(hours=window), event["to"] + timedelta(hours=window)
    s2, e2 = datetime.fromisoformat(extract["from"]), datetime.fromisoformat(extract["to"])

    if s1.weekday() != s2.weekday():
        print("Different days", s1.weekday(), s2.weekday())
        return False

    if s1.time() > s2.time():
        s1, e1, s2, e2 = s2, e2, s1, e1  # swap

    # print(s1.time(), e1.time(), s2.time(), e2.time(), s2.time() < e1.time())

    return s2.time() < e1.time()


def stringify_events(events: list) -> str:
    if not events:
        return "No events found"

    return "\n".join([f"{event['summary']} from {event['from']} to {event['to']}" for event in events])


def get_conflict_bounds(x):

    print(x["extract"])

    weekly_events = format_events(x["weekly_events"], x["extract"])
    primary_events = format_events(x["primary_events"], x["extract"])

    conflicting_events = [
        *[event for event in weekly_events if overlap(event, x["extract"])],
        *[event for event in primary_events if overlap(event, x["extract"])],
    ]
    conflicting_events = sorted(conflicting_events, key=lambda x: x["from"])

    print(f"{conflicting_events = }")

    x["conflicting_events"] = stringify_events(conflicting_events)
    x["conflict"] = len(conflicting_events) > 0
    x["extracted"] = json.dumps(x["extract"], indent=2)

    return x


conflict_message_template = """
The below is an conflict event from the user's input text:
{extracted}

The above event conflicts with the user's calendar events.
It was found that the event conflicts with the following events:
{conflicting_events}

The event was rescheduled to be the following:
{event}

Please draft a response to the user to inform them of the conflict and the rescheduled event.
The response should include the event details and the conflicting events.
The response should only mention the closest conflicting events.
The response should also include the new event time and date.
The response should be clear and concise in a friendly and professional tone in about 1-2 sentences.

The user's name is {name}

Response:
"""

conflict_message_prompt = PromptTemplate(
    template=conflict_message_template,
    input_variables=["extracted", "conflicting_events", "event", "name"],
)


conflict_chain: RunnableSequence = RunnableLambda(get_conflict_bounds) | RunnableBranch(
    (
        lambda x: x["conflict"],
        RunnablePassthrough.assign(event=conflict_prompt | llm | parser)
        | RunnablePassthrough.assign(conflict_message=conflict_message_prompt | llm | StrOutputParser()),
    ),
    RunnablePassthrough.assign(event=lambda x: x["extract"], conflict_message=lambda x: "No conflicts found"),
)
