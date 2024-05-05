from datetime import datetime, timedelta
from typing import Literal


from app.llm import get_llm
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableLambda, RunnableSequence, RunnableBranch, RunnablePassthrough
from langchain_core.pydantic_v1 import BaseModel, Field

llm = get_llm(max_tokens=10)


class TimeBounds(BaseModel):
    start: datetime = Field(description="Start bound of the events to check in ISO 8601 format")
    end: datetime = Field(description="End bound of the events to check in ISO 8601 format")


parser = JsonOutputParser(pydantic_object=TimeBounds)


schedule_time_prompt = PromptTemplate(
    template="""
The below is is an extracted event from the user's input which is to be scheduled in their calendar:
{extracted}

{schema}

Here are some reference values:
today's date and time: {current_date_time} (in the format: day, year-month-day hour:minute:second in 24 hour format)
tomorrow's date: {tomorrow} (in the format: day, year-month-day)

Determine the min and max timebounds between which the event can be scheduled.
These bounds will be used to fetch the user's calendar events to check for conflicts.
The event time will be adjusted to fit within any free time slots between these bounds.
Selected a larger time range to increase the chances of finding a free slot, it can upto few days and aleast a few hours.
Adjust the flexibility of the time range as needed depending on the urgency of the event.
The time bounds should be in ISO 8601 format. For example, 2022-01-01T00:00:00Z.
These time bounds will be used for the Google Calendar API query.
The start time should be before the end time.
Response:
""",
    input_variables=["extracted", "current_date_time", "tomorrow"],
    partial_variables={
        "schema": parser.get_format_instructions(),
    },
)

get_time_prompt = PromptTemplate(
    template="""
The below is the user's input to get events from their calendar:
{input}

{schema}

Here are some reference values:
today's date and time: {current_date_time} (in the format: day, year-month-day hour:minute:second in 24 hour format)
tomorrow's date: {tomorrow} (in the format: day, year-month-day)

Determine the min and max timebounds between which the events can be fetched.
These bounds will be used to fetch the user's calendar events.
Selected a larger time range to increase the chances of finding an event.
The time bounds should be in ISO 8601 format. For example, 2022-01-01T00:00:00Z.
The start time should be before the end time.
Response:
""",
    input_variables=["input", "current_date_time", "tomorrow"],
    partial_variables={
        "schema": parser.get_format_instructions(),
    },
)


def fix_time_bounds_format(time_bounds: TimeBounds):
    start = time_bounds["start"]
    end = time_bounds["end"]

    return {
        "start": start + "Z" if start[-1] != "Z" else start,
        "end": end + "Z" if end[-1] != "Z" else end,
    }


time_chain: RunnableSequence = (
    RunnableBranch(
        (lambda x: x["classification"] == "schedule", schedule_time_prompt),
        (lambda x: x["classification"] == "get", get_time_prompt),
        RunnablePassthrough(),
    )
    | llm
    | parser
    | RunnableLambda(fix_time_bounds_format)
)
