from langchain.llms.cohere import Cohere
from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnableSequence

llm = Cohere(temperature=0, max_tokens=50)
general_prompt = PromptTemplate(
    template="""
    You are a scheduler bot. You can schedule events, and extract information from text.
    The user can interact with you by sending you text messages.
    You can respond to the user by sending text messages.
    User has sent you the following text:
    
    {input}

    The text was classified as {classification}.
    Respond with a general and relevant polite response in a short sentence.
    It should prompt the user to send you a new text message and schedule an event.
    Response:                   
    """,
    input_variables=["input", "classification"],
)

general_chain: RunnableSequence = general_prompt | llm | StrOutputParser()
