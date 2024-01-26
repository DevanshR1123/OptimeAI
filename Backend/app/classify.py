from typing import Literal

from app.llm import get_llm
from langchain.output_parsers.pydantic import PydanticOutputParser
from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnableLambda, RunnableSequence
from langchain_core.pydantic_v1 import BaseModel

llm = get_llm(max_tokens=10)


class Classification(BaseModel):
    classification: Literal["yes", "no"]
    "Classification of the input text as an event. Either 'yes' or 'no'."


parser = PydanticOutputParser(pydantic_object=Classification)


classify_prompt = PromptTemplate(
    template="""
    Determine whether the following text contains a description of a schedulable calendar event, or not:

    {input}

    It can be a calendar event if it contains a time range, a title, and a optional description.
    An event is only characterised by the presence of these three things.

    Examples of events:
    - Meeting with John at 2pm to discuss the new project
    - Go to the gym at 5pm to do some cardio
    - Study for the exam at 7pm
    - Go to the supermarket at 8pm to buy some groceries
    - Watch a movie at 9pm

    Respond with either 'yes' or 'no'.
    Response:
    """,
    input_variables=["input"],
)

classify_chain: RunnableSequence = (
    classify_prompt
    | llm
    | StrOutputParser()
    | RunnableLambda(lambda x: x.strip().lower())
)
