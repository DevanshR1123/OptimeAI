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
User has sent you the following text:
{input}

Use the following context as a guide to respond:
{context}

The text was classified as {classification} for being an event.
Respond with a general and relevant polite response in short 1-3 sentences.
The response should be relevant to the user's text message and can include suggestions for scheduling an event.
It should prompt the user to send you a new text message and schedule an event.
Response:                   
""",
    input_variables=["input", "classification", "context"],
)

general_chain: RunnableSequence = general_prompt | llm | StrOutputParser()
