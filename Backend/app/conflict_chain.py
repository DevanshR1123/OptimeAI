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

{schema}

The below is the conflicting events from the user's calendar events:
{conflicting_events}

The below are the available time slots for the event:
{slots}

The extracted event conflicts with the user's calendar events.
Please resolve the conflict by adjusting the event time to fit within any free time slots.
Take note of the conflicting events to ensure that the event does not conflict with any existing events.
The event timings should be adjusted to fit within the user's calendar events.
Thoroughly check the conflicting events to ensure that the event does not overlap with any existing events.
You can adjust the event timings by a few hours. 
Response:
"""

conflict_prompt = PromptTemplate(
    template=template,
    input_variables=["extracted", "conflicting_events", "slots"],
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


def stringify_slots(slots: list) -> str:
    if not slots:
        return "No slots found"

    return "\n".join(
        [
            f"From {slot['from'].strftime('%Y-%m-%d %H:%M:%S')} to {slot['to'].strftime('%Y-%m-%d %H:%M:%S')} with duration of {slot['duration']} hours"
            for slot in slots
        ]
    )


def get_conflict_bounds(x):

    # print(x["extract"])
    fr, to = datetime.fromisoformat(x["extract"]["from"]), datetime.fromisoformat(x["extract"]["to"])
    event_duration = (to - fr).total_seconds() / 3600

    weekly_events = format_events(x["weekly_events"], x["extract"])
    primary_events = format_events(x["primary_events"], x["extract"])

    conflicting_events = [
        *[event for event in weekly_events if overlap(event, x["extract"])],
        *[event for event in primary_events if overlap(event, x["extract"])],
    ]
    conflicting_events = sorted(conflicting_events, key=lambda x: x["from"])

    all_events = sorted(
        filter(
            lambda x: x["from"].replace(tzinfo=None) >= fr.replace(tzinfo=None)
            and x["from"].replace(tzinfo=None).date() == fr.replace(tzinfo=None).date(),
            weekly_events + primary_events,
        ),
        key=lambda x: x["from"],
    )
    slots = []

    if not all_events:
        slots.append(
            {
                "from": fr,
                "to": to,
                "duration": event_duration,
                "fit": 0,
                "change": 0,
            }
        )
        x["slots"] = stringify_slots(slots)
        x["conflicting_events"] = stringify_events(conflicting_events)
        x["conflict"] = len(conflicting_events) > 0
        x["extracted"] = json.dumps(x["extract"], indent=2)
        return x

    first = all_events[0]
    first_duration = (
        first["from"] - datetime(first["from"].year, first["from"].month, first["from"].day)
    ).total_seconds() / 3600
    slots.append(
        {
            "from": datetime(first["from"].year, first["from"].month, first["from"].day),
            "to": first["from"],
            "duration": first_duration,
            "fit": first_duration - event_duration,
            "change": (to - first["from"]).total_seconds() / 3600,
        }
    )

    for i in range(len(all_events) - 1):
        if all_events[i]["to"] < all_events[i + 1]["from"]:
            duration = (all_events[i + 1]["from"] - all_events[i]["to"]).total_seconds() / 3600
            slots.append(
                {
                    "from": all_events[i]["to"],
                    "to": all_events[i + 1]["from"],
                    "duration": duration,
                    "fit": duration - event_duration,
                    "change": (all_events[i]["to"] - fr).total_seconds() / 3600,
                }
            )

    last = all_events[-1]
    last_duration = (
        datetime(last["to"].year, last["to"].month, last["to"].day) + timedelta(days=1) - last["to"]
    ).total_seconds() / 3600
    slots.append(
        {
            "from": last["to"],
            "to": datetime(last["to"].year, last["to"].month, last["to"].day) + timedelta(days=1),
            "duration": last_duration,
            "fit": last_duration - event_duration,
            "change": (last["to"] - fr).total_seconds() / 3600,
        }
    )

    print(f"Slots:\n{stringify_slots(slots)}")
    print(f"Conflicts:\n{stringify_events(conflicting_events)}")

    x["slots"] = stringify_slots(slots)
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
