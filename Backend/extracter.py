from datetime import datetime, timedelta
from typing import List

from langchain.llms.cohere import Cohere
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from langchain.pydantic_v1 import BaseModel, Field, validator
from langchain.schema.runnable import RunnableSequence


class Event(BaseModel):
    from_: datetime = Field(alias="from")
    to: datetime
    title: str
    description: str

    @validator("to")
    def to_must_be_after_from(cls, v, values, **kwargs):
        if "from_" in values and v < values["from_"]:
            raise ValueError("to must be after from")
        return v

    @validator("from_")
    def from_must_be_before_to(cls, v, values, **kwargs):
        if "to" in values and v > values["to"]:
            raise ValueError("from must be before to")
        return v

    @validator("title")
    def title_must_not_be_empty(cls, v):
        if not v:
            raise ValueError("title must not be empty")
        return v

    class Config:
        allow_population_by_field_name = True
        validate_assignment = True
        extra = "allow"
        json_encoders = {
            datetime: lambda dt: dt.isoformat(),
            timedelta: lambda td: td.total_seconds(),
        }


class EventList(BaseModel):
    events: List[Event]

    class Config:
        allow_population_by_field_name = True
        validate_assignment = True
        extra = "allow"


llm = Cohere(temperature=0, max_tokens=256)

parser = PydanticOutputParser(pydantic_object=Event)

template = """Extract the following information from the text:

{input}

{schema}

context:
today's date and time: {current_date_time}
tomorrow date: {tomorrow}

morinig: 6:00 AM
noon: 12:00 PM
afternoon: 2:00 PM
evening: 6:00 PM
night: 9:00 PM
midnight: 12:00 AM

Respond with only the extracted information and nothing else.
Response:
"""

schedule_extract_prompt = PromptTemplate(
    template=template,
    input_variables=["input"],
    partial_variables={
        "schema": parser.get_format_instructions(),
        "current_date_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "tomorrow": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
    },
)

extract_chain: RunnableSequence = schedule_extract_prompt | llm | parser
