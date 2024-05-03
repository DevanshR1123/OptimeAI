from asyncio import events
import json
import math

from dotenv import load_dotenv
from pytz import timezone

load_dotenv()

import logging

from app.classify import classify_chain
from app.extracter import extract_chain
from app.general import general_chain
from app.get_context import context_chain
from app.time_chain import time_chain
from app.conflict_chain import conflict_chain
from app.tools import get_calendar_events
from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache
from langchain.memory import ConversationBufferWindowMemory
from langchain_core.runnables import (
    RunnableBranch,
    RunnableLambda,
    RunnablePassthrough,
    RunnableParallel,
)

from requests import get
from datetime import datetime, timedelta

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# from app.quick_add import quick_add_chain

set_llm_cache(InMemoryCache())


def get_calendar_events(token: str, calendar_id: str, time_min: str, time_max: str) -> str:
    """
    Get the calendar events from the Google Calendar API
    """

    print(time_min, time_max)

    url = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"
    headers = {"Authorization": f"Bearer {token}"}
    params = {"timeMin": time_min, "timeMax": time_max}

    response = get(url, headers=headers, params=params)
    data = response.json()

    if "items" not in data:
        return ""

    print(calendar_id, len(data["items"]))

    events = data["items"]

    return "\n".join(
        [
            str(
                {
                    "summary": event["summary"],
                    "start": datetime.fromisoformat(event["start"]["dateTime"]).strftime("%A, %Y-%m-%d %H:%M:%S"),
                    "end": datetime.fromisoformat(event["end"]["dateTime"]).strftime("%A, %Y-%m-%d %H:%M:%S"),
                }
            )
            for event in events
        ]
    )


primary_events = lambda x: get_calendar_events(
    token=x["token"],
    calendar_id="primary",
    time_min=x["time_bounds"]["start"] + "Z",
    time_max=x["time_bounds"]["end"] + "Z",
)

weekly_events = lambda x: get_calendar_events(
    token=x["token"],
    calendar_id=x["calendar_id"],
    time_min=x["time_bounds"]["start"] + "Z",
    time_max=x["time_bounds"]["end"] + "Z",
)


chain = (
    RunnablePassthrough.assign(context=context_chain)
    | RunnablePassthrough.assign(classification=classify_chain)
    | RunnableBranch(
        (
            lambda x: x["classification"] == "schedule",
            RunnablePassthrough.assign(extract=extract_chain, type=lambda x: "extract")
            | RunnablePassthrough.assign(
                time_bounds=(
                    {
                        "extracted": lambda x: json.dumps(x["extract"], indent=2),
                        "current_date_time": lambda x: x["current_date_time"],
                        "tomorrow": lambda x: x["tomorrow"],
                    }
                    | time_chain
                )
            )
            | RunnablePassthrough.assign(
                event=(
                    {
                        "extracted": lambda x: json.dumps(x["extract"], indent=2),
                        "primary_events": primary_events,
                        "weekly_events": weekly_events,
                    }
                    | RunnablePassthrough.assign(log=lambda x: print(x))
                    | conflict_chain
                )
            ),
        ),
        (
            lambda x: x["classification"] == "get",
            RunnablePassthrough.assign(
                time_bounds=(
                    {
                        "current_date_time": lambda x: x["current_date_time"],
                        "tomorrow": lambda x: x["tomorrow"],
                    }
                    | time_chain
                )
            )
            | RunnableParallel(
                primary_events=primary_events,
                weekly_events=weekly_events,
            ),
        ),
        RunnablePassthrough.assign(general=general_chain, type=lambda x: "general"),
    )
)


def call_scheduler(prompt_input, context, token, calendar_id, name):

    try:
        # print("-" * 50)

        # Chat Memory

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
                    temp = json.dumps(message["text"], indent=4)
                elif message["type"] == "bot":
                    conversation.append({"output": temp + "\n" if temp != "" else "" + message["text"]})
                    i = j + 1
                    break
            memory.save_context(*conversation)

        # print("Chat Memory:")
        # print(memory.chat_memory)

        # Output

        llm_output = chain.invoke(
            {
                "input": prompt_input.strip(),
                "history": str(memory.chat_memory),
                "token": token,
                "calendar_id": calendar_id,
                "name": name,
                "current_date_time": datetime.now().strftime("%A, %Y-%m-%d %H:%M:%S"),
                "tomorrow": (datetime.now() + timedelta(days=1)).strftime("%A, %Y-%m-%d"),
            }
        )

        print("Scheduler Output:")
        print(json.dumps(llm_output, indent=4))

        # print("-" * 50)

    except Exception as e:
        logger.exception(e)
        return {"error": str(e)}

    match llm_output["classification"]:
        case "extract":
            return {
                "classification": llm_output["classification"],
                "event": llm_output["event"],
            }
        case "get_events":
            return {
                "classification": llm_output["classification"],
                "primary_events": llm_output["primary_events"],
                "weekly_events": llm_output["weekly_events"],
            }
        case "general":
            return {
                "classification": llm_output["classification"],
                "general": llm_output["general"],
            }
        case _:
            return {"error": "Invalid classification"}
