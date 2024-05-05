from typing import Literal

from app.llm import get_llm
from langchain.output_parsers.pydantic import PydanticOutputParser
from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnableLambda, RunnableSequence
from langchain_core.pydantic_v1 import BaseModel

llm = get_llm(max_tokens=10)

classify_prompt = PromptTemplate(
    template="""
Determine the user's intent from the following input:

{input}

you can either:
- schedule a new event
- get events from the calendar
- or provide general assistance

schedule example:
- Schedule a meeting with John tomorrow at 3 PM
- Meeting with John at 2pm to discuss the new project
- Go to the gym at 5pm to do some cardio
- Study for the exam at 7pm
- Go to the supermarket at 8pm to buy some groceries
- Watch a movie at 9pm

get example:
- What events do I have tomorrow?
- What do I have planned for today?
- What are my plans for the week?
- What events do I have this week?
- What do I have planned for the month?
- What events do I have this month?

In case of general assistance, the user might ask for help or ask a general question or make a general statement.
general assistance might include but is not limited to:
- Asking for help
- Making a general statement
- Asking about the schedule
- Asking about the calendar
- Asking based on previous responses
- Describing the user's schedule
- Asking for clarifications
- Inquiring about the user's schedule
- Asking for more information
- Asking for inference based on the user's schedule
    
Use the following chat history as a guide to respond:
{context}

Use only the latest message as context for the current input.

Respond with either 'schedule', 'get', or 'general'.
Response:
""",
    input_variables=["input", "context"],
)

classify_chain: RunnableSequence = (
    classify_prompt | llm | StrOutputParser() | RunnableLambda(lambda x: x.strip().lower())
)
