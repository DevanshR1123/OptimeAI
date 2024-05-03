from datetime import datetime, timedelta

from app.llm import get_llm
from langchain.output_parsers import (
    ResponseSchema,
    StructuredOutputParser,
)

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableSequence

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
    conflicting: bool = Field(description="Is the event conflicting with the user's calendar events")


parser = JsonOutputParser(pydantic_object=Event)

template = """
The below is is an extracted event from the user's input which is to be scheduled in their calendar:
{extracted}

The below is the events fetched from the user's primary calendar:
{primary_events}

The below is the events fetched from the user's weekly calendar:
{weekly_events}

You can use the extracted event to check for conflicts with the user's primary and weekly calendar events.
The primary calendar events are the user's personal events and the weekly calendar events are the user's work events.
Adjust the event time to fit within any free time slots between the time bounds.

{schema}
 
Response:
"""

conflict_prompt = PromptTemplate(
    template=template,
    input_variables=["extracted", "primary_events", "weekly_events"],
    partial_variables={"schema": parser.get_format_instructions()},
)

# print(
#     schedule_extract_prompt.format(
#         input="I have a meeting tomorrow at 9:00 AM", context=""
#     )
# )

# print(parser.get_format_instructions())

conflict_chain: RunnableSequence = conflict_prompt | llm | parser
