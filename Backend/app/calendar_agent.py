from langchain.agents import AgentExecutor, create_json_agent
from app.llm import get_llm
from app.tools import get_calendar_events

llm = get_llm(max_tokens=10000)

calendar_agent = create_json_agent(llm=llm, toolkit=[get_calendar_events])
