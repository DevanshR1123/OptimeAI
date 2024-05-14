from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnableSequence

from app.llm import get_llm

llm = get_llm()

general_prompt = PromptTemplate(
    template="""
You are a scheduler bot. You can schedule events by extracting information from text.
The user can interact with you by sending you text messages.
You can respond to the user by sending text messages.

User has sent you the following message:
{input}

The user input has ambiguous intent or is not enough to schedule an event.

Use the following context as a guide to respond:
{context}

The following are the user's weekly events:
{weekly_events}

The following are the user's primary events:
{primary_events}

The events are fetched from the user's calendar over the next week, starting from today.
You can use the events to suggest scheduling new events.

Respond with a general and relevant polite response in short 1-3 sentences.
The response should be relevant to the user's message and can include suggestions for scheduling an event.
It should prompt the user to send you a new message and schedule an event.
The user's name is {name}.
Response:                   
""",
    input_variables=["input", "context", "name", "weekly_events", "primary_events"],
)

general_chain: RunnableSequence = general_prompt | llm | StrOutputParser()
