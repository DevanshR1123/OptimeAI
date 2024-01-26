import json
from dotenv import load_dotenv

load_dotenv()

from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache
from langchain.memory import ConversationBufferWindowMemory
from langchain.schema.runnable import (
    RunnableBranch,
    RunnableLambda,
    RunnablePassthrough,
)

from app.classify import classify_chain
from app.extracter import extract_chain
from app.general import general_chain
from app.quick_add import quick_add_chain

set_llm_cache(InMemoryCache())


def call_scheduler(prompt_input, context):
    out = {
        "extract": None,
        "quick_add": None,
        "classification": None,
        "general": None,
    }

    try:
        print("-" * 50)

        memory = ConversationBufferWindowMemory(k=10, memory_key="history")

        i = 1
        while i < len(context):
            conversation = []
            temp = ""
            for j in range(i, len(context)):
                message = context[j]
                if message["type"] == "user":
                    conversation.append({"input": message["text"]})
                elif message["type"] == "event":
                    temp = json.dumps(message["text"])
                elif message["type"] == "bot":
                    conversation.append({"output": temp + "\n" + message["text"]})
                    i = j + 1
                    break
            memory.save_context(*conversation)

        llm = {
            "classification": classify_chain,
            "input": lambda x: x["input"],
            "history": lambda x: x["history"],
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

        llm_output = llm.invoke(
            {"input": prompt_input.strip(), "history": str(memory.chat_memory)}
        )
        print("-" * 50)

    except Exception as e:
        print(e)
        return {**out, "error": str(e)}

    return {**out, **llm_output}
