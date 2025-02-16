"""
Generates text using the Groq API.
"""

import os
from dataclasses import dataclass
from typing import Optional

from dotenv import load_dotenv
from groq import Groq

load_dotenv()


@dataclass
class GroqModelConfig:
    """
    Config for the Groq model.
    """
    # model: str = "llama-3.3-70b-specdec"
    # model: str = "llama-3.3-70b-versatile"
    # model: str = "llama3-70b-8192"
    model: str = "qwen-2.5-32b"
    temperature: float = 0.6
    max_tokens: Optional[int] = 4096
    top_p: float = 0.95


class GroqClient:
    """
    Generates text using the Groq API.
    """
    def __init__(self, config: GroqModelConfig):
        self.config = config
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def generate_text(self, text: str) -> str:
        """
        Generates text using the Groq model.
        """
#         prompt = f"""
# You are an expert text processor. The following text contains multiple conversations on different topics.
# Also, the text is in chronological order. Please remove unknown topics and discard any sentences that are not related to anything.
# Please extract and group sentences that belong to the same topic, remove any sentences that are not related to anything, and make sure to only group sentences that are right after each other since they are in chronological order:
# <text>
# {text}
# </text>

# Return the response as a structured JSON format where each topic has its own array of sentences.
# Do not include any other text in the response. Only the a object a "topics" field that contains an array of sentences.
# <json>
# {{
#     "topics": [
#         {{
#             "topic": "topic",
#             "sentences": ["sentence1", "sentence2", "sentence3"]
#         }},
#         {{
#             "topic": "topic2",
#             "sentences": ["sentence4", "sentence5", "sentence6"]
#         }}
#     ]
# }}
# </json>
# """
        prompt = text

        completion = self.client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=self.config.model,
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens,
            top_p=self.config.top_p,
            # response_format={"type": "json_object"}
        )

        return completion.choices[0].message.content


if __name__ == "__main__":
    model_config = GroqModelConfig()
    groq = GroqClient(model_config)

    response = groq.generate_text("""
Can you please tell me what you think about the following text:

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
""")
    print(response)
