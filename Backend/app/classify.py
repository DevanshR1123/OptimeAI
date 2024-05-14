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
Determine the user's intent from the following message:

{input}

you can either:
- schedule a new event
- get events from the calendar
- provide general response

It can be a calendar event if it contains a time range, a title, and a optional description.
An event is only characterised by the presence of these three things.
If the message does not contain a time range, a title, and a description, it is not an event and you should provide a general response.

Examples of events:
- Meeting with John at 2pm to discuss the new project
- Go to the gym at 5pm to do some cardio
- Study for the exam at 7pm
- Go to the supermarket at 8pm to buy some groceries
- Watch a movie at 9pm

Examples of non-events:
- I am going to the gym
- I have a meeting with John
- I am going to the supermarket
- I am going to watch a movie
- Schedule a meeting with John
- Schedule a 2hr gym session

You should ask for more information for the above non-events to schedule an event.

user can say things like the following to get events from the calendar:
- What events do I have tomorrow?
- What do I have planned for today?
- What are my plans for the week?
- What events do I have this week?
- What do I have planned for the month?

In case neither of the above is true, you can provide a general response.
The user can ask you to:
    - provide general information.
    - provide inferences based on the chat history.
    - provide a general response based on the chat history.
    - describe the chat history.
    - describe the chat history containing their events.
    - find out what the user wants to do.
    - calculate break time based on the chat history.
- You can ask for more information or clarify the user's intent in case of ambiguity.
- If user has not provided enough information about the event, ask for more information to schedule an event.
- prompt the user to schedule an event if the information provided is not enough.
- provide a general response if there is any ambiguity in the user's intent or if the user has not provided enough information.

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
