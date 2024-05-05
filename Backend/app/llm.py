from langchain_google_genai import GoogleGenerativeAI
from langchain.llms.cohere import Cohere


def get_llm(temperature=0.2, max_tokens=100, json_output=False):
    return GoogleGenerativeAI(
        model="gemini-pro",
        max_tokens=max_tokens,
        temperature=temperature,
        # response_mime_type="application/json" if json_output else "text/plain",
    )

    # return Cohere(max_tokens=max_tokens, temperature=temperature)
