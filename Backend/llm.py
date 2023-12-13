import os

os.environ["COHERE_API_KEY"] = "dS07uyHpjfRQus3GKTPzOqYVy2b9XIUjxZiFDpFQ"

from langchain.schema.runnable import (
    RunnableBranch,
    RunnableLambda,
    RunnablePassthrough,
)

from classify import classify_chain
from extracter import extract_chain
from general import general_chain
from quick_add import quick_add_chain

from langchain.globals import set_llm_cache
from langchain.cache import InMemoryCache

set_llm_cache(InMemoryCache())


def call_scheduler(prompt_input):
    out = {
        "extract": None,
        "quick_add": None,
        "classification": None,
        "general": None,
    }

    try:
        print("-" * 50)

        llm = {
            "classification": classify_chain,
            "input": lambda x: x["input"],
        } | RunnableBranch(
            (
                lambda x: x["classification"] == "yes",
                RunnablePassthrough.assign(extract=extract_chain)
                | RunnablePassthrough.assign(
                    quick_add={
                        "from": lambda x: x["extract"]["from"],
                        "to": lambda x: x["extract"]["to"],
                        "title": lambda x: x["extract"]["title"],
                        "description": lambda x: x["extract"]["description"],
                        "input": lambda x: x["input"],
                    }
                    | quick_add_chain
                    | RunnableLambda(lambda x: x.split("\n")[0])
                ),
            ),
            RunnablePassthrough.assign(general=general_chain),
        )

        llm_output = llm.invoke({"input": prompt_input.strip()})
        print("-" * 50)

    except Exception as e:
        print(e)
        return {**out, "error": str(e)}

    return {**out, **llm_output}
