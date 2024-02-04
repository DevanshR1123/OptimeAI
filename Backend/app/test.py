# import json
# from time import sleep

# import pandas as pd
from app.scheduler import call_scheduler, classify_chain

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
