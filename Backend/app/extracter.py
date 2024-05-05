from datetime import datetime, timedelta
import json

from app.llm import get_llm
from langchain.output_parsers import (
    ResponseSchema,
    StructuredOutputParser,
)

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableSequence

llm = get_llm(max_tokens=256, json_output=True)


class Event(BaseModel):
    from_: datetime = Field(alias="from", description="Start date and time of the event without timezone")
    to: datetime = Field(description="End date and time of the event without timezone")
    title: str = Field(description="Title of the event")
    description: str = Field(description="Description of the event")
    duration: str = Field(description="Duration of the event")
    recurring: bool = Field(description="Is the event recurring")
    repeat: str = Field(description="Recurring pattern of the event")
    rrule: str = Field(description="Recurring rule of the event")


parser = JsonOutputParser(pydantic_object=Event)

template = """
Extract the following information about a google calendar event from the text:
{input}

{schema}

Here are some reference values:
today's date and time: {current_date_time} (in the format: day, year-month-day hour:minute:second in 24 hour format)
tomorrow's date: {tomorrow} (in the format: day, year-month-day)

morning: 6:00 AM
noon: 12:00 PM
afternoon: 2:00 PM
evening: 6:00 PM
night: 9:00 PM
midnight: 12:00 AM

Use the following text as a guide to extract the information:
{context}

Do not have null values for any of the fields.
Make reasonable assumptions about the duration and description.
Generate a description if its not found in the text.
For recurring events, the from and to fields should be of the same day which needs to repeat.
Respond with only the extracted information and nothing else. 
Response:
"""

schedule_extract_prompt = PromptTemplate(
    template=template,
    input_variables=["input", "context", "current_date_time", "tomorrow"],
    partial_variables={
        "schema": parser.get_format_instructions(),
    },
)

# print(
#     schedule_extract_prompt.format(
#         input="I have a meeting tomorrow at 9:00 AM", context=""
#     )
# )

# print(parser.get_format_instructions())

extract_chain: RunnableSequence = schedule_extract_prompt | llm | parser
