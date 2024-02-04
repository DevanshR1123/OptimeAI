from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnableSequence

from app.llm import get_llm

llm = get_llm()

context_prompt = PromptTemplate(
    template="""
You are a scheduler bot. You can schedule events by extracting information from text.
The user can interact with you by sending you text messages.
chat history:
{history}

Latest message from user:
{input}

The response should be in short 1-3 sentences.
It should summarize the context of the conversation and the user's intention.
It should highlight the most important information relevant to the user's query.
Response:                   
""",
    input_variables=["input", "history"],
)

context_chain: RunnableSequence = context_prompt | llm | StrOutputParser()
