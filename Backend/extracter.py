from datetime import datetime, timedelta

from langchain.llms.cohere import Cohere
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableSequence

llm = Cohere(temperature=0, max_tokens=256)

response_schema = [
    ResponseSchema(name="from", type="datetime", description="Start time of the event"),
    ResponseSchema(name="to", type="datetime", description="End time of the event"),
    ResponseSchema(name="title", type="string", description="Title of the event"),
    ResponseSchema(
        name="description", type="string", description="Description of the event"
    ),
]


parser = StructuredOutputParser(response_schemas=response_schema)

template = """Extract the following information from the text:

{input}


{schema}

context:
today's date and time: {current_date_time}
tomorrow's date: {tomorrow}

morning: 6:00 AM
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
