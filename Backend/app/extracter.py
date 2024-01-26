from datetime import datetime, timedelta

from app.llm import get_llm
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableSequence

llm = get_llm(max_tokens=256)

response_schema = [
    ResponseSchema(name="from", type="datetime", description="Start time of the event"),
    ResponseSchema(name="to", type="datetime", description="End time of the event"),
    ResponseSchema(name="title", type="string", description="Title of the event"),
    ResponseSchema(
        name="description", type="string", description="Description of the event"
    ),
    ResponseSchema(
        name="type",
        type="string",
        description="Type of the event such as once, daily, weekly, monthly, etc",
    ),
    ResponseSchema(
        name="quick_add",
        type="string",
        description="summary of event using the extracted information including the type",
    ),
]


parser = StructuredOutputParser(response_schemas=response_schema)

template = """Extract the following information about a google calendar event from the text:

{input}

{schema}

Here are some reference values:
today's date and time: {current_date_time}
tomorrow's date: {tomorrow}

morning: 6:00 AM
noon: 12:00 PM
afternoon: 2:00 PM
evening: 6:00 PM
night: 9:00 PM
midnight: 12:00 AM

Use the following text as a guide to extract the information:
{history}

Do not have null values for any of the fields.
Make reasonable assumptions about the duration and description.
Generate a description if its not found in the text.
For recurring events, the from and to fields should be of the same day which needs to repeat.
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

# print(
#     schedule_extract_prompt.format(
#         input="I have a meeting tomorrow at 9:00 AM", history=""
#     )
# )

extract_chain: RunnableSequence = schedule_extract_prompt | llm | parser
