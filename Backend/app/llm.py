from langchain_google_genai import GoogleGenerativeAI
from langchain.llms.cohere import Cohere


def get_llm(temperature=0.2, max_tokens=100):
    return GoogleGenerativeAI(
        model="gemini-pro", max_tokens=max_tokens, temperature=temperature
    )

    # return Cohere(max_tokens=max_tokens, temperature=temperature)
