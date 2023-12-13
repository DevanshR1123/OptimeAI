from langchain.llms.cohere import Cohere
from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnableSequence, RunnableLambda

llm = Cohere(temperature=0, max_tokens=50)


quick_add_prompt = PromptTemplate(
    template="""
    Generate a single line summary text for google calendar of the following event:

    {input}

    context:
    {from} to {to}

    Respond with only the summarised event text and nothing else.
    Response:
    """,
    input_variables=["input", "from", "to", "title", "description"],
)

quick_add_chain: RunnableSequence = (
    quick_add_prompt
    | llm
    | StrOutputParser()
    | RunnableLambda(lambda x: x.split("\n")[0].strip())
)
