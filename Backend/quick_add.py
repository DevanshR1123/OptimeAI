from langchain.llms.cohere import Cohere
from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnableSequence

llm = Cohere(temperature=0, max_tokens=50)


quick_add_prompt = PromptTemplate(
    template="""
Generate a single line text for google calendar for the following event:

{input}

context:
{from} to {to}

Respond with only the summarised event text and nothing else.
Response:
""",
    input_variables=["input", "from", "to"],
)

quick_add_chain: RunnableSequence = quick_add_prompt | llm | StrOutputParser()
