# app/services/question_generator.py

import os
from openai import AzureOpenAI

client = AzureOpenAI(
    api_key=os.getenv("AZURE_API_KEY"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_ENDPOINT")
)

def generate_interview_questions(prompt: str) -> str:
    """
    Calls Azure DeepSeek (Foundry) and returns raw text output
    """
    try:
        response = client.chat.completions.create(
            model=os.getenv("AZURE_DEPLOYMENT_NAME"),
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional interviewer who generates interview questions."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=800
        )

        return response.choices[0].message.content

    except Exception as e:
        raise RuntimeError(f"Azure OpenAI error: {str(e)}")
