import os
from dotenv import load_dotenv
from openai import AzureOpenAI

# Load environment variables from .env
load_dotenv()

# Create Azure OpenAI client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_API_KEY"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_ENDPOINT")
)

def generate_questions(prompt: str) -> str:
    """
    Sends prompt to Azure DeepSeek and returns generated questions.
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
        raise RuntimeError(f"Error from Azure OpenAI: {str(e)}")