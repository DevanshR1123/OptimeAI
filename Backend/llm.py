import os

os.environ["COHERE_API_KEY"] = "dS07uyHpjfRQus3GKTPzOqYVy2b9XIUjxZiFDpFQ"

from extracter import extract_chain
from quick_add import quick_add_chain


def call_scheduler(prompt_input):
    try:
        print("-" * 50)
        extract_output = extract_chain.invoke({"input": prompt_input})
        parsed_output = extract_output.dict()
        parsed_output["from"] = parsed_output.pop("from_").isoformat()
        parsed_output["to"] = parsed_output["to"].isoformat()

        quick_add_output = quick_add_chain.invoke(
            {"input": prompt_input, **parsed_output}
        )
        formatted_quick_add_output = quick_add_output.split("\n")[0].strip()

        print("-" * 50)

    except Exception as e:
        print(e)
        return {"error": str(e)}

    return {
        "extract": parsed_output,
        "quick_add": formatted_quick_add_output,
    }
