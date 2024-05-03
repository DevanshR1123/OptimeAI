# import json
# from time import sleep
from datetime import datetime, timedelta

# import pandas as pd
from app.scheduler import call_scheduler, classify_chain
from app.tools import get_calendar_events

# data = pd.read_csv("app/data/prompts.csv")

# bool_map = {"yes": 1, "no": 0}

# for index, row in data.iterrows():
#     output = classify_chain.invoke({"input": row["input"], "context": ""})
#     data.at[index, "classification"] = bool_map[output]
#     print(f'{row["input"]}:\t{row['event']} => {output}')
#     # sleep(15)

# data["classification"] = data["classification"].astype(int)
# data.to_csv("app/data/results.csv", index=False)

# print("Accuracy:", f'{(data["classification"] == data["event"]).sum() / len(data) :.2%}')

TEST_INPUT = {
    "token": "ya29.a0Ad52N3_Ba1UIsu1rLrErxIjBemq0C5gCiWoqlMLPB_pN3qQed73TBymaGhqJEcQaLrlYH2ljMlnpelmVtXzOz7w977brDjIZhyE21qE1hisGzP5iubm7Ejsv4w_UTh6LVDrmKAJbr23y6fZK4QsLbtPw406npcfhyFPSaCgYKAR0SARMSFQHGX2Mi56nSgh2FjLIAtj6-aWN12Q0171",
    "calendar_id": "primary",
    # "calendar_id": "6m8ftkgpu37vv4sicbakk3nq80@group.calendar.google.com",
    "time_min": (datetime.now() + timedelta(days=-1)).isoformat() + "Z",
    "time_max": (datetime.now() + timedelta(days=1)).isoformat() + "Z",
}


def test_get_calendar_events():
    """
    Test the get_calendar_events tool
    """

    print("Testing get_calendar_events")

    try:
        print(TEST_INPUT)
        print(get_calendar_events)
        result = get_calendar_events.invoke(TEST_INPUT)
        print(result)

        for event in result:
            print(f'{event["summary"]} - {event["start"]["dateTime"]} - {event["end"]["dateTime"]}')

    except Exception as e:
        print(e)


test_get_calendar_events()
