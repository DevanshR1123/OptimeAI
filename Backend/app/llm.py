from langchain_google_genai import GoogleGenerativeAI


def get_llm(temperature=0.0, max_tokens=100):
    return GoogleGenerativeAI(
        model="gemini-pro", max_tokens=max_tokens, temperature=temperature
    )
